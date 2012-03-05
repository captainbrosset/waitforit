from handlers.base import BaseHandler

class FourOFourHandler(BaseHandler):
    """
    Fallback handler in case no URL pattern matched.
    """
    def get(self):
        self.send404Response()