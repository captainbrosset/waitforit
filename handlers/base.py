import os
import sys

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

import libs.logger.logger as logger

class BaseHandler(webapp.RequestHandler):
    """
    Base handler class.
    Never targeted directly, aimed at being sub-classed.
    The base handler contains methods to return a 404 message, as well as redirect to a given template
    """
    def sendTemplateResponse(self, templatePath, data={}):
        """
        Generates the template response back to the client.
        """

        # Systematically adding the request url to the data because it is used (at least) in the meta tags
        data["url"] = self.request.url
        
        logger.info(self, "Sending back a template-based response to the client: " + templatePath)
        
        pageContent = template.render(self.getTemplatePath(templatePath), data)
        self.response.out.write(pageContent)

    def send404Response(self):
        """
        Generates a 404 HTML response back to the client.
        """
        self.sendTemplateResponse("404.html", {})

    def handle_exception(self, exception, debugMode):
        """
        Gets called to handle global exceptions not caught and handled below.
        Generates a custom 500 response back to the client.
        """
        if debugMode:
            super(BaseHandler, self).handle_exception(exception, debugMode)
        else:
            self.sendTemplateResponse("500.html", {
                "exception": exception,
                "debugMode": debugMode,
                "trace": sys.exc_info()
            })
    
    def getTemplatePath(self, tplName):
        """
        Returns the complete path of a django template, based on its file name only
        """
        logger.info(self, os.path.join(os.path.dirname(__file__), "../templates/" + tplName))
        return os.path.join(os.path.dirname(__file__), "../templates/" + tplName)