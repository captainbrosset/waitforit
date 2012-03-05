import re
import os
import logging

from handlers.base import BaseHandler

logger = logging.getLogger('StaticFilesPackagerHandler')

class StaticFilesPackagerHandler(BaseHandler):
    """
    Package, minify and return static files to the client
    """
    def get(self, q):
        files = re.findall('([a-zA-Z0-9/\.-]+(?:\.js|\.css){1})%26', q)
        response = ""
        type = ""
        
        logger.info("Static handler received a request for files " + q)

        for f in files:
            filename = self.getFilePath(f)
            filetype = filename[filename.rfind("."):]
            if type == "":
                type = filetype
            elif type != "" and type != filetype:
                continue                
                 
            file = open(filename, 'r')
            response += self.append(self.minify(file.read()))

        logger.info("Type of files is " + type)

        if type == ".css":
            self.response.headers["Content-Type"] = "text/css"
        elif type == ".js":
            self.response.headers["Content-Type"] = "application/javascript; charset=UTF-8"
            
        self.response.headers.add_header("Expires", "Thu, 01 Dec 2100 16:00:00 GMT")
        self.response.out.write(response)
    
    def append(self, content):
        separator = "\n/* ------------------------------ */\n"
        return content + separator
    
    def minify(self, content):
        return content.rstrip('\t')
    
    def getFilePath(self, filename):
        return os.path.join(os.path.dirname(__file__), "../resources/dynamic/" + filename)