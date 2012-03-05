from handlers.base import BaseHandler
import model.helper as modelaccess

class CreateNewPageHandler(BaseHandler):
    """
    Handler responsible for letting a user create a new page.
    """
    def get(self):
		data = {
			"step": "type"
		}
		
		self.sendTemplateResponse("createpage.html", data)

    def post(self):
		data = {
			"step": "type"
		}
		
		pageType = self.request.get("pageType")
		if pageType:
			data["step"] = "timestamp"
			data["pageType"] = pageType
		
		timestamp = self.request.get("timestamp")
		if timestamp:
			data["step"] = "template"
			data["templates"] = modelaccess.getAllTemplatesForAGivenPageType(pageType)
		
		template = self.request.get("template")
		if template:
			data["step"] = "end"
		
		self.sendTemplateResponse("createpage.html", data)