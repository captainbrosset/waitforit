if(!wfi) {
    var wfi = {};
}
if(!wfi.pages) {
    wfi.pages = {};
}

/**
 * Actually renders a page into the DOM.
 * @singleton
 */
wfi.TemplateRenderer = {
	scriptCustomData: {},
	/**
	 * @param {wfi.TemplateParser} templateObj
	 * @param {Object} data
	 * @param {jQuery} $target
	 */
	render: function(templateObj, data, $target) {
		var template = templateObj.getTemplate();
		var style = templateObj.getStyle();
		var script = templateObj.getScript();
		var id = templateObj.getId();
		
		if(!this.scriptCustomData[id]) {
			this.scriptCustomData[id] = {};
		}
		
		data = {data : data, custom : this.scriptCustomData[id]};
		// Execute the script in a closure, hiding some sensitive objects, and passing the data
		(function(){
			var window = null,
				document = null,
				alert = null,
				setTimeout = null,
				setInterval = null,
				wfi = null,
				getElementById = null,
				getElementsByTagName = null,
				getElementsByClassName = null,
				$ = function(selector) {
					return jQuery(selector, "#" + id);
				};
			try {
				with(data) {
					eval(script)
				}
			} catch(e) {
				console.error("script failed ", e);
			}
		})();
		
		// Insert the CSS, prefixing all selectors
		if($("#style" + id).length == 0) {
			var styleNode = document.createElement("style");
			styleNode.setAttribute("type", "text/css");
			styleNode.setAttribute("id", "style" + id);
			document.body.appendChild(styleNode);
			$("#style" + id)[0].textContent = style;
		}
				
		// Insert the template
	    var tpl = TrimPath.parseTemplate(template);
	    var html = tpl.process(data, {throwExceptions: true});
	    $target.html(html);
	}
};

/**
 * @class wfi.PageEngine
 * @param {Object} pageData The data for this page (some common data coming from the Base Page class, some specific to page implementations)
 * @param {jQuery} $target Where should the page be displayed
 * @param {wfi.TemplateParser} tplObj The template object of the page
 * @constructor
 */
wfi.PageEngine = function(pageData, $target, tplObj) {
    // FirstlLook at the page type and delegate to specific page engine if there is one
    this._impl = null;
    var type = pageData.pageType;
    if(wfi.pages[type + "Engine"]) {
        this._impl = new wfi.pages[type + "Engine"](pageData, $target, tplObj);
    } else {
        // If no specific impl, just display the template
        this._pageData = pageData;
        this._tplObj = tplObj;
        this._$target = $target;
        this.display();
    }
};
wfi.PageEngine.prototype = {
    /**
     * Display the page.
     * This means take the template, take the data, and process everything inside $target
     */
    display: function() {
		wfi.TemplateRenderer.render(this._tplObj, this._pageData, this._$target)
    }
};

/**
 * @class wfi.pages.FixedCounterPageEngine
 * @param {Object} pageData The data for this page (some common data coming from the Base Page class, some specific to page implementations)
 * @param {jQuery} $target Where should the page be displayed
 * @param {wfi.TemplateParser} tplObj The template code of the page
 * @constructor
 */
wfi.pages.FixedCounterPageEngine = function(pageData, $target, tplObj) {
    this._pageData = pageData;
    this._tplObj = tplObj;
    this._$target = $target;

    // Start the count engine
    var countEngine = new wfi.CountEngine(this._pageData.jsDateStr, this._pageData.isUp);
    countEngine.addAppender("page-" + new Date().getTime(), this);
    if(!countEngine.start()) {
		alert("Counter couldn't start, " + this._pageData.jsDateStr + " couldn't be parsed to a valid date");
	}
};
wfi.pages.FixedCounterPageEngine.prototype = {
    /**
     * Called by the count engine when a new second has passed and the template needs to be refreshed
     */
    display: function(obj) {
        var data = $.extend({}, this._pageData, obj);
		wfi.TemplateRenderer.render(this._tplObj, data, this._$target)
    }
};

/**
 * @class wfi.pages.RelativeCounterPageEngine
 * @param {Object} pageData The data for this page (some common data coming from the Base Page class, some specific to page implementations)
 * @param {jQuery} $target Where should the page be displayed
 * @param {String} tplObj The template code of the page
 * @constructor
 */
wfi.pages.RelativeCounterPageEngine = function(pageData, $target, tplObj) {
    this._pageData = pageData;
    this._tplObj = tplObj;
    this._$target = $target;

    // Start the count engine
    var ms = new Date().getTime() + this._pageData.durationInSeconds * 1000;
    var countEngine = new wfi.CountEngine(ms, false);
    countEngine.addAppender("page-" + new Date().getTime(), this);
    if(!countEngine.start()) {
		alert("Counter couldn't start, " + ms + " couldn't be parsed to a valid date");
	}
};
wfi.pages.RelativeCounterPageEngine.prototype = {
    /**
     * Called by the count engine when a new second has passed and the template needs to be refreshed
     */
    display: function(obj) {
        var data = $.extend({}, this._pageData, obj);
		wfi.TemplateRenderer.render(this._tplObj, data, this._$target)
    }
};