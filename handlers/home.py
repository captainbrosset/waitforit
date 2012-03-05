from django.utils import simplejson

from handlers.base import BaseHandler
import model.helper as modelaccess
import libs.jsonutils.dates as jsondateutils

class HomeHandler(BaseHandler):
	"""
	Home page. Shows a list of latest pages that have been created.
	"""
	def get(self):
		pagesData = modelaccess.getRecentPages(20)
		data = []
		
		for pagedata in pagesData:
			# On the home page, we cannot use the template corresponding to the page
			# Using special home templates for them
			
            #template = pagedata["template"]
			template = "<h2>${data.count}</h2><p>${data.message}</p>"
			pagedata["template"] = None
			index = pagedata["index"]
			b64index = pagedata["b64index"]
			jsondata = simplejson.dumps(pagedata, cls=jsondateutils.JsonDatesEncoder)
			data.append({"json": jsondata, "html": template, "index": index, "b64index": b64index})
			
		self.sendTemplateResponse("home.html", {"pages": data})