# These 2 lines must absolutely be at the top of the file
from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

from handlers.b64 import Base64PageHandler
from handlers.quick import FixedCountDownAndUpQuickAccess, RelativeCountDownQuickAccess
from handlers.home import HomeHandler
from handlers.newpage import CreateNewPageHandler
from handlers.fourofour import FourOFourHandler
from handlers.static import StaticFilesPackagerHandler
from handlers.testtpl import TestTemplateHandler

webapp.template.register_template_library("libs.templatetags.macro")

application = webapp.WSGIApplication([
	
	# Static file packager access
	('/_statics/(.*)', StaticFilesPackagerHandler),
	
	# Test template direct access
	('/_tpl/(.*)', TestTemplateHandler),
	
	# Quick access to counter pages created on the fly (but not stored in the db)
	('/countdown/([0-9]{12})(?:/([^/]*))?(?:/(.*))?', FixedCountDownAndUpQuickAccess),
	('/countdown/([0-9]*[smhd]{1})(?:/([^/]*))?(?:/(.*))?', RelativeCountDownQuickAccess),
	('/countup/([0-9]{12})(?:/([^/]*))?(?:/(.*))?', FixedCountDownAndUpQuickAccess),
	
	# Create a page
	('/new[/]?', CreateNewPageHandler),
	
	# Access to a stored page, by its b64 id
	('/([a-zA-Z0-9]+)', Base64PageHandler),
	
	# Home handler
	('/', HomeHandler),
	
	# Fallback if nothing else matched
	('.*', FourOFourHandler)
	
], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()