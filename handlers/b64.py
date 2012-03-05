from django.utils import simplejson

import libs.logger.logger as logger
from handlers.base import BaseHandler
import libs.pb64.converter as pb64
import model.helper as modelaccess
import libs.jsonutils.dates as jsondateutils

class Base64PageHandler(BaseHandler):
    """
    Handler that serves as the main entry point to display a page, given a specific index (in b64).
    Will get the page from the model, with its template, and send back the HTML to the client to show
    the page
    """
    def get(self, indexB64):
        index = pb64.decodeB64Padless(indexB64)
        if index:
            logger.info(self, "Getting page at index: " + indexB64 + " (b64: " + str(index) + ")")
        
            pagedata = modelaccess.getPageData(index)
            if pagedata:
                template = pagedata["template"]
                pagedata["template"] = None
                jsondata = simplejson.dumps(pagedata, cls=jsondateutils.JsonDatesEncoder)
                pagedata.update({"json": jsondata, "html": template})
                
                modelaccess.incrementPageUsage(index)
    
                self.sendTemplateResponse("page.html", pagedata)
            else:
                self.send404Response()
        else:
            self.send404Response()