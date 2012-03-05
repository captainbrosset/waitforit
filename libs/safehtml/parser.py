import re

from HTMLParser import HTMLParser

class SafeHtmlParser(HTMLParser):
	"""
	Clean a HTML string to make sure it can be safely used as a custom theme on the site.

	The parser keeps a blacklist of tags to be removed.
	When it encounters a tag in the blacklist, it strips it from the output, but continues to parse inside.
	
	It also takes care of harmful attributes
		on...
		src="javascript:..."
		href="javascript:..."
	
	Finally, it looks inside style tags to remove the following
		url(javascript:...)
		
	The clean html is available on the html attribute of the instance after the content has been fed
	
	FIXME: seems that TEXT tags are not taken into account
		--> see http://docs.python.org/library/htmlparser.html
	"""
	
	noJavaScriptInCssWarningIcon = "url(http://figs.cyberciti.biz/warning-40px.png)"
	
	def __init__(self):
		HTMLParser.__init__(self)
		self.html = ""
		self.isCurrentlyInBlackListedTag = False
		self.isCurrentlyInsideAStyleTag = False
		self.tagBlackList = [
			"body",
			"html",
			"head",
			"title",
			"script",
			"object",
			"iframe",
			"frameset",
			"frame",
			"meta",
			"form",
			"input",
			"select",
			"textarea",
			"button"
		]

	def handle_starttag(self, tag, attrs):
		if tag in self.tagBlackList:
			self.isCurrentlyInBlackListedTag = True
		else:
			self.isCurrentlyInBlackListedTag = False
			self.html += "<" + tag + self.getSafeAndCleanAttributes(attrs) + ">"
			if tag == "style":
				self.isCurrentlyInsideAStyleTag = True

	def handle_endtag(self, tag):
		if tag in self.tagBlackList:
			self.isCurrentlyInBlackListedTag = False
		else:
			self.html += "</" + tag + ">"
			if tag == "style":
				self.isCurrentlyInsideAStyleTag = False
	
	def handle_data(self, data):
		if not self.isCurrentlyInBlackListedTag:
			if self.isCurrentlyInsideAStyleTag:
				# Need to remove url('javascript:...') inside a style tag
				data = re.sub("url\s*\(\s*['\"]*javascript:.*\)", self.__class__.noJavaScriptInCssWarningIcon, data)
			self.html += data

	def handle_startendtag(self, tag, attrs):
		if tag not in self.tagBlackList:
			self.html += "<" + tag + self.getSafeAndCleanAttributes(attrs) + " />"

	def getSafeAndCleanAttributes(self, attrs):
		html = ""
		for attr in attrs:
			if attr[0][0:2] == "on":
				continue
			if attr[0] == "href" and attr[1][0:11] == "javascript:":
				continue
			if attr[0] == "src" and attr[1][0:11] == "javascript:":
				continue
			html += " " + attr[0] + "=\"" + attr[1] + "\""

		return html
	
	def getSafeHtml(self, html):
		self.feed(html)
		return self.html