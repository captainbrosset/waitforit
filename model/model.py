from google.appengine.ext import db

class Template(db.Model):
    """
    A template serves as a view for a page.
    It contains a certain HTML code that has to be rendered in the browser and will be fed with the page's data.
    A template can be reused across several pages, so it has a name, ... to identify it.
    It can also be created by users of the site, so it comes with author's name and creation date.
    Finally, a template is made for a specific page (with specific data), so each template has the name of the supported page type
    """
    html = db.TextProperty()
    name = db.StringProperty()
    dateAdded = db.DateTimeProperty(auto_now_add=True)
    createdBy = db.StringProperty()
    supportedPageType = db.StringProperty()

class Page(db.Model):
    """
    Page base class, not meant to be used as is, but rather extended into a model class that serves a purpose.
    A page only has the notion of when it was created, how many times it was displayed and which template it uses to display.
    Each subclass of this should define their own properties that are going to be used in templates
    """
    timesUsed = db.IntegerProperty()
    template = db.ReferenceProperty(Template)

class FixedCounterPage(Page):
    """
    Implementation of a page: fixed counter.
    This one expects a message and a date (either past or future) and a direction in which to count
    """
    jsDateStr = db.StringProperty() # MM/DD/YYYY HH:MM:SS
    isUp = db.BooleanProperty()
    message = db.StringProperty()

class RelativeCounterPage(Page):
    """
    Implementation of a page: relative counter.
    This one expects a message and a duration in seconds to display a counter that starts when the page is displayed
    """
    durationInSeconds = db.IntegerProperty()
    message = db.StringProperty()

class PagesIndex(db.Model):
    """
    This serves as the global index of pages.
    Each entity has a unique index and an instance of a certain page type
    """
    index = db.IntegerProperty()
    page = db.ReferenceProperty(Page)
    dateAdded = db.DateTimeProperty(auto_now_add=True)

class IndexCounter(db.Model):
    """
    There is no auto-increment primary key thing in the datastore,
    so this model class is here to keep only one entity, that gets incremented everytime something is
    added to the model
    """
    currentIndex = db.IntegerProperty()

# Fake data when datastore is empty
isIndexEmpty = len(IndexCounter.all().fetch(1)) == 0
if isIndexEmpty:
    tplForFixedCounterPage = Template(html="""
		<style>
		h1, h2 {
			background-color: black;
			color: white;
			font-family: arial;
			margin: 0;
			padding: 1em;
		}
		p {
			color: red;
		}
		#container {
			position: relative;
			width: 100%;
			height: 20px;
			background: #eee;
		}
		#progress {
			position: absolute;
			top: 0;
			height: 20px;
			left: 0;
			background: red;
		}
		</style>
		<script>
			if(!data.isUp) {
				if(!custom.start) {
					custom.start = data.currentTimeMs;
				}
				var totalWidth = parseInt($("#container").css("width"));
				var currentWidth = Math.floor(data.currentTimeMs * totalWidth / custom.start);
				custom.currentWidth = currentWidth;
			}
		</script>
        {if data.hasNotStarted}
            Counter that goes up has not yet started. Countups work with dates in the past.
		{elseif data.isOver}
            Countdown is over!!
        {else}
			<div id="container">
				<div id="progress" style="width:${custom.currentWidth}px"></div>
			</div>
            <h1>${data.count}</h1><h2>${data.message}</h2>
            <p>Counter added on ${data.dateAdded} and used ${data.timesUsed} time(s)</p>
            <p>This is a fixed counter page that goes {if data.isUp}up{else}down{/if}</p>
            {if data.isUp}
            <p>It started on ${data.jsDateStr}</p>
            {else}
            <p>It will end on ${data.jsDateStr}</p>
            {/if}
        {/if}
    """, name="BasicFixedTemplate", createdBy="Patrick Brosset", supportedPageType="FixedCounterPage")
    tplForFixedCounterPage.put()

    tplForRelativeCounterPage = Template(html="""
        Relative:
        <h1>${data.count}</h1><h2>${data.message}</h2>
        <p>Counter added on ${data.dateAdded} and used ${data.timesUsed} time(s)</p>
    """, name="BasicRelativeTemplate", createdBy="Patrick Brosset", supportedPageType="RelativeCounterPage")
    tplForRelativeCounterPage.put()

    page1 = FixedCounterPage(jsDateStr="07/15/2012 12:00:00", isUp=False, message="test", timesUsed=0, template=tplForFixedCounterPage)
    page1.put()
    
    index = PagesIndex(index=1, page=page1)
    index.put()
    counter = IndexCounter(currentIndex=1)
    counter.put()

    page2 = RelativeCounterPage(durationInSeconds=180, message="test", timesUsed=0, template=tplForRelativeCounterPage)
    page2.put()
    
    index = PagesIndex(index=2, page=page2)
    index.put()
    counter.currentIndex = 2
    counter.put()
    
    page3 = RelativeCounterPage(durationInSeconds=1930, message="wow, that's long", timesUsed=0, template=tplForRelativeCounterPage)
    page3.put()
    
    index = PagesIndex(index=3, page=page3)
    index.put()
    counter.currentIndex = 3
    counter.put()
    
    page4 = FixedCounterPage(jsDateStr="11/12/1979 12:00:00", isUp=True, message="I was born", timesUsed=0, template=tplForFixedCounterPage)
    page4.put()
    
    index = PagesIndex(index=4, page=page4)
    index.put()
    counter.currentIndex = 4
    counter.put()

    page5 = FixedCounterPage(jsDateStr="12/21/2012 12:00:00", isUp=True, message="after the end of the world", timesUsed=0, template=tplForFixedCounterPage)
    page5.put()
    
    index = PagesIndex(index=5, page=page5)
    index.put()
    counter.currentIndex = 5
    counter.put()

    eggCookingRelativeTpl = Template(html="""
		<style>
			#container {
				background: url(http://2.bp.blogspot.com/_6Hq15LR-ptk/S8UoS6k_kQI/AAAAAAAAARk/W4jV09WOX2o/s1600/Boiling+Eggs.jpg) repeat top left;
			}
			p, ul {
				font-family: arial;
				font-size: 20px;
			}
			ul {
				border: 1px solid #ccc;
				border-right: 0;
				background: #eee;
				list-style-type: none;
				margin: 0;
				padding: 0;
				width: 604px;
				position: absolute;
				top: 60px;
				left: 20px;
				height: 52px;
			}
			li {
				list-style-type: none;
				margin: 0;
				padding: 0;
				display: inline-block;
				text-align: center;
				height: 50px;
				border-right: 1px solid #ccc;
			}
			#progress {
				position: absolute;
				top: 61px;
				left: 21px;
				height: 51px;
				background: red;
				opacity: 0.3;
			}
		</style>
		<div id="container">
		{if data.isOver}
            Trop cuit!!!!
		{else}
			<p>Cuisson depuis ${custom.cookedTime} secondes ...</p>
			<ul><li style="width:200px;">Cru</li><li style="width:100px;">A la coque</li><li style="width:230px;">Mi-mollet</li><li style="width:70px;">Dur</li></ul>
			<div id="progress" style="width:${custom.cookedTime}px"></div>
		{/if}
		</div>
		<script>
			if(!data.isOver) {
				if(!custom.startedAt) {
					custom.startedAt = data.currentTimeMs / 1000; // seconds
				}
				var remainingTime = data.currentTimeMs / 1000; // seconds
				custom.cookedTime = Math.floor(custom.startedAt - remainingTime);
			}
		</script>
    """, name="EggCookingRelativeTpl", createdBy="Patrick Brosset", supportedPageType="RelativeCounterPage")
    eggCookingRelativeTpl.put()

    eggPage = RelativeCounterPage(durationInSeconds=10*60, message="cooking eggs...", timesUsed=0, template=eggCookingRelativeTpl)
    eggPage.put()
    
    index = PagesIndex(index=6, page=eggPage)
    index.put()
    counter.currentIndex = 6
    counter.put()