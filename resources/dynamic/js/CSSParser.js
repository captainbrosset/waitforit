if(!wfi) {
    var wfi = {};
}

/**
 * Simple CSSParser class.
 * Feed it some CSS content, and subscribe to the event methods to perform logic when the nodes are reached.
 * Event methods are onSelector and onProperty.
 * Usage example:
 * <pre>
 * var parser = new wfi.CSSParser();
 * parser.onSelector = function(selector) { ... };
 * parser.onProperty = function(property) { ... };
 * parser.feed(" ... some css content ... ");
 * </pre>
 */
wfi.CSSParser = function() {};
wfi.CSSParser.prototype = {
	/**
	 * Feed the CSS content to the parser
	 * @param {String} css The CSS content to be parsed
	 */
	feed: function(css) {
		// Walk through the string, searching for { } ; : characters
		var cursor = 0;
		var buffer = "";
		while(true) {
			var char = css.charAt(cursor);
			if(char == "") {
				break;
			}
			
			switch(char) {
				case "\n":
					break;
				case "\t":
					break;
				case "{":
					var selectors = buffer.split(",");
					for(var s  = 0; s < selectors.length; s ++) {
						this.onSelector(this._trim(selectors[s]));
					}
					this.onBlockStart();
					buffer = "";
					break;
				case ":":
					this.onProperty(this._trim(buffer));
					buffer = "";
					break;
				case ";":
					this.onValue(this._trim(buffer));
					buffer = "";
					break;
				case "}":
					this.onBlockEnd();
					buffer = "";
					break;
				default:
					buffer += char;
					break;
			}
			
			cursor ++;
		}
	},
	_trim: function(str) {
		return str.replace(/^ */, "").replace(/ *$/, "");
	},
	/**
	 * Meant to be overriden by the user. Is executed everytime a selector is met.
	 * @param {String} selector Selector code : "div span .myClass"
	 */
	onSelector: function(selector) {},
	/**
	 * Meant to be overriden by the user. Is executed everytime the start of a selector block is met.
	 */
	onBlockStart: function() {},
	/**
	 * Meant to be overriden by the user. Is executed everytime a property is met.
	 * @param {String} property The property name "border-top"
	 */
	onProperty: function(property) {},
	/**
	 * Meant to be overriden by the user. Is executed everytime a value is met.
	 * @param {String} value The property value "2px solid black"
	 */
	onValue: function(value) {},
	/**
	 * Meant to be overriden by the user. Is executed everytime the end of a selector block is met.
	 */
	onBlockEnd: function() {}
};