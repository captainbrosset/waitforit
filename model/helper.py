import model
from libs.pb64.converter import encodeB64Padless

def incrementPageUsage(index):
    """
    Increment the number of times a page was used
    """
    query = model.PagesIndex.all().filter("index = ", int(index))
    indexes = query.fetch(1)
    if len(indexes) == 1:
        page = indexes[0].page
        page.timesUsed += 1 
        page.put()

def getPage(index):
    """
    Returns a page model instance from a given index.
    The returned page can be one of the many types extending from model.Page
    """
    query = model.PagesIndex.all().filter("index = ", int(index))
    indexes = query.fetch(1)
    if len(indexes) == 1:
        index = indexes[0]
        page = index.page
        page.dateAdded = index.dateAdded
        return page
    else:
        return None

def getPageData(index):
    """
    From an index, get a page model instance,
	and then, from this, return the dict of properties of this page.
    This, without knowing which type of page implementation this is.
    The dict returned will contain:
    - typeOfPage, String, the model class name of this page implementation
    - template, String, the HTML of the template
    - all attributes of the specific page type
    """
    page = getPage(index)
    if page:
        data = {}
        members = dir(page)
        for m in members:
            if m[0:1] != "_":
                property = eval("page.%s" % m)
                try:
                    property.__call__
                except:
                    data[m] = page.__getattribute__(m)
        data["template"] = page.template.html
        data["pageType"] = page.__class__.__name__
        data["index"] = index
        data["b64index"] = encodeB64Padless(index)
        return data
    else:
        return None

def getRecentPages(max):
    """
    Get a list of recently added pages.
    The number of pages returned is either max or the total number of pages in the store if max is bigger.
    Will return a list of what is returned by getPageData()
    """
    # Get the latest indexes
    query = model.PagesIndex.all().order("-dateAdded")
    indexes = query.fetch(max)
    if len(indexes) > 0:
        pagesData = []
        for index in indexes:
            pagesData.append(getPageData(index.index))
        return pagesData
        

def getTemplate(name):
    """
    Get a template object by its name

	Args
		name The name of template to be retrieved
    """
    query = model.Template.all().filter("name = ", name)
    templates = query.fetch(1)
    if len(templates) == 1:
        return templates[0]
    else:
        return None

def getAllTemplatesForAGivenPageType(pageType):
	"""
	Get the list of all templates that support a given page type

	Args
		pageType The type of page
	"""
	query = model.Template.all().filter("supportedPageType = ", pageType)
	return query.fetch(100)