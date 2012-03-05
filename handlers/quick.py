import datetime
import urllib2
import re

from django.utils import simplejson

from handlers.base import BaseHandler
import model.helper as modelaccess
import libs.jsonutils.dates as jsondateutils
        
class FixedCountDownAndUpQuickAccess(BaseHandler):
    """
    Quick access to a simple countdown/up page.
    This is made to allow the creation of a page through the URL only.
    For instance, the following 3 URLs would lead to this handler:
    http://w.aitfor.it/countdown/121120111330
    http://w.aitfor.it/countdown/121120111330/my birthday
    http://w.aitfor.it/countdown/121120111330/my birthday/templatename
    Nothing is stored in the datastore when this happens, we just create a page on the fly
    """
    def get(self, dateStr, message, templateName):
        """
        Depending on what URL was entered, we may have a dateStr only, a dateStr and a message, or a dateStr, message and templateName
        If there is no message, we don't show any, if there is no templateName, we default to one we know
        """        
        if templateName == None:
            templateName = "BasicFixedTemplate"
        if message == None:
            message = ""
        
        template = modelaccess.getTemplate(templateName)
        if template.supportedPageType == "FixedCounterPage":
            pagedata = {
                "timesUsed": 0,
                "dateAdded": datetime.datetime.now(),
                "jsDateStr": dateStr[2:4] + "/" + dateStr[0:2] + "/" + dateStr[4:8] + " " + dateStr[8:10] + ":" + dateStr[10:12] + ":00",
                "isUp": True if self.request.url.find("/countup/") != -1 else False,
                "message": urllib2.unquote(message.strip()),
                "pageType": "FixedCounterPage"
            }
            jsondata = simplejson.dumps(pagedata, cls=jsondateutils.JsonDatesEncoder)
    
            self.sendTemplateResponse("page.html", {"json": jsondata, "html": template.html})
        else:
            self.sendTemplateResponse("error.html", {"message": "Sorry, an error occured: the template used doesn't support fixed date countdown pages"})

class RelativeCountDownQuickAccess(BaseHandler):
    """
    Quick access to a simple relative countdown page.
    This is made to allow the creation of a page through the URL only.
    For instance, the following 3 URLs would lead to this handler:
    http://w.aitfor.it/countdown/3m
    http://w.aitfor.it/countdown/3m/my birthday
    http://w.aitfor.it/countdown/3m/my birthday/templatename
    Nothing is stored in the datastore when this happens, we just create a page on the fly.
    The time format is something like [0-9]*[smhd]{1}
    """
    def get(self, time, message, templateName):
        """
        Depending on what URL was entered, we may have a time only, a time and a message, or a time, message and templateName
        If there is no message, we don't show any, if there is no templateName, we default to one we know
        """
        if templateName == None:
            templateName = "BasicRelativeTemplate"
        if message == None:
            message = ""
        
        # Parse the time to convert into seconds
        timeValue = int(re.findall("[0-9]*", time)[0])
        timeUnit = re.findall("[smhd]{1}", time)[0]
        multiplyBy = 1
        if timeUnit == "m":
            multiplyBy = 60
        if timeUnit == "h":
            multiplyBy = 60 * 60
        if timeUnit == "d":
            multiplyBy = 60 * 60 * 24
        seconds = timeValue * multiplyBy
        
        template = modelaccess.getTemplate(templateName)
        if template.supportedPageType == "RelativeCounterPage":
            pagedata = {
                "timesUsed": 0,
                "dateAdded": datetime.datetime.now(),
                "durationInSeconds": seconds,
                "message": urllib2.unquote(message.strip()),
                "pageType": "RelativeCounterPage"
            }
            jsondata = simplejson.dumps(pagedata, cls=jsondateutils.JsonDatesEncoder)
            self.sendTemplateResponse("page.html", {"json": jsondata, "html": template.html})
        else:
            self.sendTemplateResponse("error.html", {"message": "Sorry, an error occured: the template used doesn't support recurring countdown pages"})