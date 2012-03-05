import datetime

from django.utils import simplejson
from google.appengine.ext.db import Query

class JsonDatesEncoder(simplejson.JSONEncoder):
    """
    Used when encoding python objects into json to help serialize what cannot be done by default
    """
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d')
        if isinstance(obj, Query):
            return None
        return simplejson.JSONEncoder.default(self, obj)
