from handlers.base import BaseHandler

class TestTemplateHandler(BaseHandler):
    """
    Simply return a template corresponding to the URL pattern.
	Usefull when developing HTML/CSS/JS not bound to any specific python handler
    """
    def get(self, page):
		self.sendTemplateResponse(page + ".html")