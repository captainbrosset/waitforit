import logging
import random
import sys
import datetime
import os
import urllib2
import re

from google.appengine.ext import webapp
from google.appengine.ext import db

import modelold
import libs.gettheme.gettheme as themecontroller
import utils
import libs.pb64.converter as pb64
import libs.safehtml.parser as safehtml

class GetRandomCounterPage(webapp.RequestHandler):
	"""
	Called when clicking on the icon, to get a random counter page
	"""
	def get(self):
		# Get a random entry in the URLs store
		total = utils.getNbOfTotalUrls() - 1
		nb = random.randint(1, total)
		self.redirect("/" + pb64.encodeB64Padless(int(nb)))


class AccessViaShortUrl(webapp.RequestHandler):
	"""
	Legacy short URL ... just forwarding to the corresponding base64padless
	"""
	def get(self, nb):
		logging.info(">>> " + self.request.url + " >>>AccessViaShortUrl")
		self.redirect("/" + pb64.encodeB64Padless(int(nb)))


class NewAccessViaB64ShortUrl(webapp.RequestHandler):
	def get(self, nb):
		logging.info(">>> " + self.request.url + " >>>NewAccessViaB64ShortUrl")
		nb = pb64.decodeB64Padless(nb)
		if nb:
			# Get the full url corresponding to count
			q = db.GqlQuery("SELECT * FROM URLs WHERE counter = :1", nb)
			urls = q.fetch(1)
			if len(urls) == 1:
				matches = re.findall(utils.regexp["parseFullUrlWithSeconds"], urls[0].url)
				if len(matches) == 0:
					matches = re.findall(utils.regexp["parseFullUrl"], urls[0].url)
				try:				
					target = matches[0][0]
					options = matches[0][1] or ""
					title = matches[0][2] or ""
					subHandler = CountDownDMYHMS()
					subHandler.request = self.request
					subHandler.response = self.response
					subHandler.get(target, options, title)
				except:
					#print sys.exc_info()
					# TODO: need error management for the user here
					self.redirect("/")
			else:
				#print sys.exc_info()
				# TODO: need error management for the user here
				self.redirect("/")
		else:
			# TODO: need error management for the user here
			self.redirect("/")

class AccessViaB64ShortUrl(webapp.RequestHandler):
	"""
	New short URL access. URLs are like http://<domain>/<base64padless>
	Will call the CountDownDMYHMS handler which is the true main entry point
	"""
	def get(self, nb):
		logging.info(">>> " + self.request.url + " >>>AccessViaB64ShortUrl")
		nb = pb64.decodeB64Padless(nb)
		if nb:
			# Get the full url corresponding to count
			q = db.GqlQuery("SELECT * FROM URLs WHERE counter = :1", nb)
			urls = q.fetch(1)
			if len(urls) == 1:
				matches = re.findall(utils.regexp["parseFullUrlWithSeconds"], urls[0].url)
				if len(matches) == 0:
					matches = re.findall(utils.regexp["parseFullUrl"], urls[0].url)
				try:				
					target = matches[0][0]
					options = matches[0][1] or ""
					title = matches[0][2] or ""
					subHandler = CountDownDMYHMS()
					subHandler.request = self.request
					subHandler.response = self.response
					subHandler.get(target, options, title)
				except:
					#print sys.exc_info()
					# TODO: need error management for the user here
					self.redirect("/")
			else:
				#print sys.exc_info()
				# TODO: need error management for the user here
				self.redirect("/")
		else:
			# TODO: need error management for the user here
			self.redirect("/")


class CountDownDMYHM(webapp.RequestHandler):
	"""
	Legacy full URL entry point, with no seconds
	Just adds 00 at the end of the URL and forwards to the CountDownDMYHMS handler
	"""
	def get(self, target, options, title):
		logging.info(">>> " + self.request.url + " >>>CountDownDMYHM")
		if options == None:
			options = ""
		if title == None:
			title = ""
		else:
			title = "/" + title
		self.redirect("/" + target + "00" + options + title)


class AccessViaRelativeUrl(webapp.RequestHandler):
	"Relative counter entry point, starts a counter from now, for a number of seconds"
	def get(self, numberOfSeconds, optionsStr, title):
		logging.info(">>> " + self.request.url + " >>>AccessViaRelativeUrl")
		options = themecontroller.getThemeOptions(optionsStr)
		
		if title:
			title = title.strip()
			if title != '':
				title = urllib2.unquote(title.strip())
		else:
			title = ""
	
		urlToShare = self.request.url
	
		data = {
			"dateObject" : {
				"relativeDuration": numberOfSeconds
			},
			"title": title,
			"options": options,
			"form": {},
			"relative": True,
			"shortUrl": urlToShare,
			"listOfThemes": themecontroller.getListOfThemes()
		}
		data["latestUrls"] = utils.getLatestUrls()
		data["popularUrls"] = utils.getMostPopulars()
	
		formData = utils.prepareFormData()
		data["form"].update(formData)
	
		pageContent = utils.getTemplateContent(os.path.join(os.path.dirname(__file__), "templates/main.html"), data)
		self.response.out.write(pageContent)


class CountDownDMYHMS(webapp.RequestHandler):
	"""
	Real entry point to the site, takes in a full URL like http://<domain>/<ddmmyyyyhhmmss><options>/<title>
	Responsibility is to display the corresponding countdown and increment usage counter for URL
	"""
	def get(self, target, optionsStr, title):
		logging.info(">>> " + self.request.url + " >>>CountDownDMYHMS")
		# Expected format is DDMMYYYYHHMMSS (checked via main.py by a regexp anyway)
		day = target[:2]
		month = target[2:4]
		year = target[4:8]
		hour = target[8:10]
		minute = target[10:12]
		second = target[12:14]
		
		if utils.isValidDate(day, month, year, hour, minute, second):
		
			storedUrl = utils.storeUrl(self.request.url, target, optionsStr or "", title or "", None, None, None)

			ctheme = None
			isTemplatizedCTheme = False
			options = {}
		
			if storedUrl.customTheme:
				ctheme = storedUrl.customTheme.html
				isTemplatizedCTheme = storedUrl.customTheme.isTemplate
			else:
				options = themecontroller.getThemeOptions(optionsStr)
		
			jsdate = month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second

			if title:
				title = title.strip()
				if title != '':
					title = urllib2.unquote(title.strip())
			else:
				title = ""
		
			urlToShare = utils.getContextRootFromUrl(self.request.url) + "/" + pb64.encodeB64Padless(storedUrl.counter)
		
			data = {
				"dateObject" : {
					"day": day, "month": month, "year": year, "hour": hour, "minute": minute
				},
				"jsdate": jsdate,
				"title": title,
				"options": options,
				"customTheme": ctheme,
				"isTemplateTheme": isTemplatizedCTheme,
				"form": {},
				"up": storedUrl.up,
				"relative": storedUrl.relative,
				"shortUrl": urlToShare,
				"listOfThemes": themecontroller.getListOfThemes()
			}
			data["latestUrls"] = utils.getLatestUrls()
			data["popularUrls"] = utils.getMostPopulars()
		
			formData = utils.prepareFormData()
			data["form"].update(formData)
		
			pageContent = utils.getTemplateContent(os.path.join(os.path.dirname(__file__), "templates/main.html"), data)
			self.response.out.write(pageContent)
			
		else:
			# Error, the date has a valid format, but is not a real date
			self.redirect("/")


class CreateCountdown(webapp.RequestHandler):
	"""
	Called when a new countdown URL is created
	In fact simply needs to redirect to the encoded b64padless version
	TODO: When managing custom themes, will also need to take them into account here
	"""
	def post(self):
		self.doCreate()
	def get(self):
		self.doCreate()
	def doCreate(self):
		target = self.request.get("datestamp")
		title = self.request.get("title")
		up = self.request.get("up")
		relative = self.request.get("relative")
		ctheme = None
		options = None
		
		# Handling custom themes or normal themes
		customTheme = self.request.get("customTheme")
		if customTheme:
			parser = safehtml.SafeHtmlParser()
			safe = parser.getSafeHtml(customTheme)
			
			ctheme = modelold.CustomTheme(html=safe, isTemplate=False)
			ctheme.put()
		else:
			options = self.request.get("music") + self.request.get("theme")
		
		if relative:
			self.redirect("/" + target + options + "/" + title)
		else:
			storedUrl = utils.storeUrl(self.request.url, target, options, title, ctheme, up, relative)	
			self.redirect("/" + pb64.encodeB64Padless(storedUrl.counter))


class CreateCustomThemedCountdown(webapp.RequestHandler):
	"""
	Called when a user wants to start creating a countdown with an advanced custom theme
	"""
	def get(self):
		pageContent = utils.getTemplateContent(os.path.join(os.path.dirname(__file__), "templates/customThemePlayGround.html"), {"expertMode": True})
		self.response.out.write(pageContent)


class CreateSimpleCustomThemedCountdown(webapp.RequestHandler):
	"""
	Called when a user wants to start creating a countdown with simple custom theme
	"""
	def get(self):
		pageContent = utils.getTemplateContent(os.path.join(os.path.dirname(__file__), "templates/customThemePlayGround.html"), {"simpleCustomMode": True})
		self.response.out.write(pageContent)


class GetSafeHtml(webapp.RequestHandler):
	"""
	Called via XHR to tame the html during custom theme preview action
	"""
	def post(self):
		parser = safehtml.SafeHtmlParser()
		safe = parser.getSafeHtml(self.request.get("html"))
		
		self.response.out.write(safe)


class Index(webapp.RequestHandler):
	"""
	Fallback handler in case no URL pattern matched.
	Shows a fake timer to urge users to create their own
	"""
	def get(self):
		delta = datetime.datetime.today() + datetime.timedelta(hours = 1)

		day = str(delta.day)
		if len(day) == 1: day = "0" + day
		month = str(delta.month)
		if len(month) == 1: month = "0" + month
		year = str(delta.year)
		hour = str(delta.hour)
		if len(hour) == 1: hour = "0" + hour
		minute = str(delta.minute)
		if len(minute) == 1: minute = "0" + minute
		second = str(delta.second)
		if len(second) == 1: second = "0" + second
		
		data = {
			"dateObject" : {
				"day": day, "month": month, "year": year, "hour": hour, "minute": minute
			},
			"jsdate": month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second,
			"title": "w.aitfor.it",
			"options": themecontroller.getThemeOptions("waitforit"),
			"form": {},
			"up": True,
			"relative": False,
			"shortUrl": self.request.url,
			"listOfThemes": themecontroller.getListOfThemes(),
			"nbOfTotalUrls": utils.getNbOfTotalUrls()
		}
		data["latestUrls"] = utils.getLatestUrls()
		data["popularUrls"] = utils.getMostPopulars()
		
		formData = utils.prepareFormData()
		data["form"].update(formData)
		
		pageContent = utils.getTemplateContent(os.path.join(os.path.dirname(__file__), "templates/main.html"), data)
		self.response.out.write(pageContent)