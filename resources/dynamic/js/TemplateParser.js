if(!wfi) {
    var wfi = {};
}

/**
 * @class wfi.TemplateParser
 * Extracts a structured object from a template raw code. Getters can then be used to access the different template elements
 * @param {String} templateSrc The source code
 * @constructor
 */
wfi.TemplateParser = function(templateSrc) {
    this._tplSrc = templateSrc;
	this._script = null;
	this._style = null;
	this._template = null;
	this._cssPrefix = "wfi-cp-" + new Date().getTime();
};
wfi.TemplateParser.prototype = {
	/**
	 * Extracts the js script from the template code and save it into the _script property
	 * @param {String} tpl The template code before extraction
	 * @return {String} The template code after extraction
	 */
	_parseScript: function(tpl) {
		var startIndex = tpl.indexOf("<script>");
		if(startIndex == -1) {
			this._script = "";
			return tpl;
		} else {
			var endIndex = tpl.indexOf("</script>");
			this._script = tpl.substring(startIndex + 8, endIndex);
			return tpl.substring(0, startIndex) + tpl.substring(endIndex + 9);
		}
	},
	
	/**
	 * Extracts the css style from the template code and save it into the _style property
	 * @param {String} tpl The template code before extraction
	 * @return {String} The template code after extraction
	 */
	_parseStyle: function(tpl) {
		var startIndex = tpl.indexOf("<style>");
		if(startIndex == -1) {
			this._style = "";
			return tpl;
		} else {
			var endIndex = tpl.indexOf("</style>");
			this._style = tpl.substring(startIndex + 8, endIndex);
			
			var cssPrefix = this._id;
			var css = "";
			var cssParser = new wfi.CSSParser();
			var that = this;
			cssParser.onSelector = function(selector) {
				css  += "#" + that._cssPrefix + " " + selector + ",";
			}
			cssParser.onBlockStart = function() {
				css = css.substring(0, css.length - 1);
				css += "{";
			}
			cssParser.onProperty = function(property) {
				css += property + ":";
			}
			cssParser.onValue = function(value) {
				css += value + ";";
			}
			cssParser.onBlockEnd = function() {
				css += "}\n";
			}
			cssParser.feed(this._style);
			this._style = css;
			
			return tpl.substring(0, startIndex) + tpl.substring(endIndex + 9);
		}
	},
	
	/**
	 * Main parser entry point. Parses out the script, style and HTML and save them into the _template, _style, and _script properties
	 * @param {String} tpl The raw template code
	 */
	_parse: function(tpl) {
		tpl = this._parseScript(tpl);
		tpl = this._parseStyle(tpl);
		this._template = "<div id='" + this._cssPrefix + "'>" + tpl + "</div>";
	},
	
	getTemplate: function() {
		if(!this._template) {
			this._parse(this._tplSrc);
		}
		return this._template;
	},
	
	getScript: function() {
		if(!this._script) {
			this._parse(this._tplSrc);
		}
		return this._script;
	},
	
	getStyle: function() {
		if(!this._style) {
			this._parse(this._tplSrc);
		}
		return this._style;
	},
	
	getId: function() {
		return this._cssPrefix;
	}
};