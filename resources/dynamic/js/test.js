wfi.ImagePicker = function() {
	this.$el = $("#wfi-image-picker");
	this._isVisible = false;
	
	var that = this;
	$("input, select", this.$el).blur(function() {
		if(that._applyToElement) {
			that._setStyle($("input.url", that.$el).val(), $("select.position", that.$el).val(), $("input.size", that.$el).val());
		}
	});
};
wfi.ImagePicker.prototype = {
	onChange: function(url, position, size) {},
	_setStyle: function(url, position, size) {
		var $el = this._applyToElement;
		
		if(!url) {
			$el.attr("src", "http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif");
			this.onChange();
		} else {
			$el.css("top", "").css("bottom", "").css("left", "").css("right", "").css("width", "").css("height", "").attr("src", url);
			
			var posValues = position.split(" ");
			if(posValues[0] == "top") {
				$el.css("top", "0");
			} else if(posValues[0] == "bottom") {
				$el.css("bottom", "0");
			}
			if(posValues[1] == "left") {
				$el.css("left", "0");
			} else if(posValues[1] == "right") {
				$el.css("right", "0");
			}
			
			if(size) {
				$el.css("width", size + "%").css("height", size + "%");
			}
			
			this.onChange(url, position, size);
		}
	},
	applyTo: function(element) {
		this._applyToElement = $(element);
	},
	show: function(anchor) {
		this._positionAt(anchor);
		this.$el.show();
		this._isVisible = true;
	},
	hide: function(anchor) {
		this._positionAt(anchor);
		this.$el.hide();
		this._isVisible = false;
	},
	toggle: function(anchor) {
		if(this._isVisible) {
			this.hide();
		} else {
			this.show(anchor);
		}
	},
	_positionAt: function(anchor) {
		if(anchor) {
			$(anchor.parentNode).append(this.$el);
			var anchorOffset = $(anchor).position();
			this.$el.css("top", (anchorOffset.top + $(anchor)[0].offsetHeight) + "px");
			this.$el.css("left", anchorOffset.left + "px");
		}
	}
};

// ######################################################################################################

wfi.ColorPicker = function() {
	this.$el = $("#wfi-color-picker");
	this._isVisible = false;

	var str = "";	
	for(var b = 0; b <= 255; b = b + 51) {	
		for(var g = 0; g <= 255; g = g + 51) {
			for(var r = 0; r <= 255; r = r + 51) {
				str += "<li style='background:rgb("+r+","+g+","+b+");'></li>";
			}
		}
	}
	this.$el.append(str);
	
	var that = this;
	$("li", this.$el).click(function() {
		if(that._applyToElement && that._applyToProperty) {
			var color = $(this).css("backgroundColor");
			that._applyToElement.css(that._applyToProperty, color);
			that.onChange(that._applyToElement, that._applyToProperty, color);
		}
		that.hide();
	});
};
wfi.ColorPicker.prototype = {
	onChange: function(el, prop, color) {},
	applyTo: function(property, element) {
		this._applyToProperty = property;
		this._applyToElement = $(element);
	},
	show: function(anchor) {
		this._positionAt(anchor);
		this.$el.show();
		this._isVisible = true;
	},
	hide: function(anchor) {
		this._positionAt(anchor);
		this.$el.hide();
		this._isVisible = false;
	},
	toggle: function(anchor) {
		if(this._isVisible) {
			this.hide();
		} else {
			this.show(anchor);
		}
	},
	_positionAt: function(anchor) {
		if(anchor) {
			$(anchor.parentNode).append(this.$el);
			var anchorOffset = $(anchor).position();
			this.$el.css("top", (anchorOffset.top + $(anchor)[0].offsetHeight) + "px");
			this.$el.css("left", anchorOffset.left + "px");
		}
	}
};

// ######################################################################################################

wfi.FontPicker = function() {
	this.$el = $("#wfi-font-picker");
	this._isVisible = false;
	
	// Fixing the preview text to start with
	$("li", this.$el).css("fontFamily", function(index, value) {
		return $(this).attr("_font");
	});
	this.setPreviewText();
	
	var that = this;
	$("li", this.$el).click(function() {
		that.onChange($(this).attr("_font"));
		that.hide();
	});
};
wfi.FontPicker.prototype = {
	onChange: function(fontName) {},
	show: function(anchor) {
		this._positionAt(anchor);
		this.$el.show();
		this._isVisible = true;
	},
	hide: function(anchor) {
		this._positionAt(anchor);
		this.$el.hide();
		this._isVisible = false;
	},
	toggle: function(anchor) {
		if(this._isVisible) {
			this.hide();
		} else {
			this.show(anchor);
		}
	},
	_positionAt: function(anchor) {
		if(anchor) {
			$(anchor.parentNode).append(this.$el);
			var anchorOffset = $(anchor).position();
			this.$el.css("top", (anchorOffset.top + $(anchor)[0].offsetHeight) + "px");
			this.$el.css("left", anchorOffset.left + "px");
		}
	},
	setPreviewText: function(text) {
		$("li", this.$el).html(function() {
			if(!text) {
				return $(this).attr("_font");
			} else {
				return $(this).attr("_font") + " (" + text + ")";
			}
		});
	}
};

// ######################################################################################################

wfi.SimpleCustomThemeCreator = function() {
	
	/*this.template = "
		#wfi-custom-counter {
			color: ${counter.color};
			font-family: ${counter.fontFamily};
			font-size: ${counter.fontSize} px;
			position: absolute;
			top: ${counter.position.top} px;
			left: ${counter.position.left} px;
		}
		#wfi-custom-title {
			color: ${title.color};
			font-family: ${title.fontFamily};
			font-size: ${title.fontSize} px;
			position: absolute;
			top: ${title.position.top} px;
			left: ${title.position.left} px;
		}";*/
	
	this.data = {
		body: {
			background: {
				color: "white",
				image: null,
				size: "100%",
				position: "top left"
			}
		},
		title: {
			position: {
				top: 100,
				left: 100
			},
			value: "your title here",
			fontSize: 34,
			fontFamily: "arial",
			color: "black"
		},
		counter: {
			position: {
				top: 200,
				left: 100
			},
			value: "00:00:00",
			fontSize: 36,
			fontFamily: "arial",
			color: "black"
		}
	};
};
wfi.SimpleCustomThemeCreator.prototype = {
	updatePreview: function() {},
	
	getThemeHTML: function() {},
	
	setBodyColor: function(color) {
		this.data.body.background.color = color;
	},
	setBodyImage: function(url) {
		this.data.body.background.image = url;
	},
	setBodyImageSize: function(size) {
		this.data.body.background.size = size;
	},
	setBodyImagePosition: function(position) {
		this.data.body.background.position = position;
	},
	
	setCounterFont: function(font) {
		this.data.counter.fontFamily = font;
	},
	setCounterFontSize: function(size) {
		this.data.counter.fontSize = size
	},
	setCounterColor: function(color) {
		this.data.counter.color = color;
	},
	setCounterPosition: function(top, left) {
		this.data.counter.position.top = top;
		this.data.counter.position.left = left;
	},
	setCounterValue: function(value) {
		this.data.counter.value = value;
	},
	
	setTitleFont: function(font) {
		this.data.title.fontFamily = font;
	},
	setTitleFontSize: function(size) {
		this.data.title.fontSize = size
	},
	setTitleColor: function(color) {
		this.data.title.color = color;
	},
	setTitlePosition: function(top, left) {
		this.data.title.position.top = top;
		this.data.title.position.left = left;
	},
	setTitleValue: function(value) {
		this.data.title.value = value;
	}
};

// ######################################################################################################

wfi.SimpleCustomThemeH1Appender = function() {};
wfi.SimpleCustomThemeH1Appender.prototype = {
	/**
	 * Display a count in this appender. Called by the countEngine.
	 * @param {Object} obj An object containing properties count, title, isUp and isOverOrNotStarted
	 */
	display: function(obj) {
		if(obj.isOverOrNotStarted) {
			if(obj.isUp) {
				$("h1").html("Countup hasn't started yet!");
			} else {
				$("h1").html("Countdown is over!");
			}
		} else {
			$("h1").html(obj.count);
		}
	}
};

// ######################################################################################################

wfi.FontPickerCounterAppender = function(fontPicker) {
	this._fontPicker = fontPicker;
};
wfi.FontPickerCounterAppender.prototype = {
	/**
	 * Display a count in this appender. Called by the countEngine.
	 * @param {Object} obj An object containing properties count, title, isUp and isOverOrNotStarted
	 */
	display: function(obj) {
		if(obj.isOverOrNotStarted) {
			if(obj.isUp) {
				this._fontPicker.setPreviewText("Countup hasn't started yet!");
			} else {
				this._fontPicker.setPreviewText("Countdown is over!");
			}
		} else {
			this._fontPicker.setPreviewText(obj.count);
		}
	}
};

// ######################################################################################################

$(function() {
	var fontPicker = new wfi.FontPicker();
	var colorPicker = new wfi.ColorPicker();
	var imagePicker = new wfi.ImagePicker();
	var customHtmlData = new wfi.SimpleCustomThemeCreator();
	imagePicker.applyTo("#wfi-custom-background");
	var engine = null;
	
	colorPicker.onChange = function(el, prop, color) {
		if(el.attr("id") == "wfi-custom-container") {
			customHtmlData.setBodyColor(color);
		} else {
			if(el[0].parentNode.id.indexOf("counter") != -1) {
				customHtmlData.setCounterColor(color);
			} else {
				customHtmlData.setTitleColor(color);
			}
		}
	};
	
	imagePicker.onChange = function(url, position, size) {
		customHtmlData.setBodyImage(url);
		customHtmlData.setBodyImageSize(size);
		customHtmlData.setBodyImagePosition(position);
	};
	
	$("#wfi-custom-counter, #wfi-custom-title").draggable({
		handle: ".handle",
		stack: "#wfi-custom-counter, #wfi-custom-title",
		stop: function() {
			if($("h1", this).length == 1) {
				var pos = $(".editable", this).position;
				customHtmlData.setCounterPosition(pos.top, pos.left);
			}
			if($("h2", this).length == 1) {
				var pos = $(".editable", this).position;
				customHtmlData.setTitlePosition(pos.top, pos.left);
			}
		}
	});
	
	$("#wfi-custom-container > div").mouseenter(function(){
		$(".editable", this).addClass("editing");
		$(".editTools", this).show();
	});
	$("#wfi-custom-container > div").mouseleave(function(){
		$(".editable", this).removeClass("editing");
		$(".editTools", this).hide();
		fontPicker.hide();
		colorPicker.hide();
		imagePicker.hide();
	});
	
	
	function getFontSizeAsNumber($el) {
		return parseInt($el.css("fontSize"));
	}
	
	function increaseFontSize($el, increaseBy) {
		var newSize = getFontSizeAsNumber($el) + increaseBy;
		$el.css("fontSize", newSize + "px");
		if($el[0].parentNode.id.indexOf("counter") != -1) {
			customHtmlData.setCounterFontSize(newSize);
		} else {
			customHtmlData.setTitleFontSize(newSize);
		}
	}
	
	function decreaseFontSize($el, decreaseBy) {
		var current = getFontSizeAsNumber($el);
		if(current > decreaseBy) {
			var newSize = getFontSizeAsNumber($el) - decreaseBy;
			$el.css("fontSize", newSize + "px");
			if($el[0].parentNode.id.indexOf("counter") != -1) {
				customHtmlData.setCounterFontSize(newSize);
			} else {
				customHtmlData.setTitleFontSize(newSize);
			}
		}
	}
	
	
	$("#wfi-custom-container div .editTools .sizeUp").click(function() {
		var $el = $(".editable", this.parentNode.parentNode);
		increaseFontSize($el, 2);
	});
	
	$("#wfi-custom-container div .editTools .sizeDown").click(function() {
		var $el = $(".editable", this.parentNode.parentNode);
		decreaseFontSize($el, 2);
	});
	
	var elementOnWhichFontIsBeingChanged = null;
	var elementOnWhichColorIsBeingChanged = null;
	
	$("#wfi-custom-container div .editTools .font").click(function() {
		// Deal with the count engine appender in the fontPicker if the engine is started and we clicked on the counter fontPicker tool
		if(engine && this.parentNode.parentNode.id == "wfi-custom-counter") {
			if(!engine.getAppender("fontPickerAppender")) {
				engine.addAppender("fontPickerAppender", new wfi.FontPickerCounterAppender(fontPicker));
			}
			elementOnWhichFontIsBeingChanged = "#wfi-custom-counter";
		} else {
			if(engine) {
				engine.removeAppender("fontPickerAppender")
			}
			fontPicker.setPreviewText($(".editable", this.parentNode.parentNode).html());	
			elementOnWhichFontIsBeingChanged = this.parentNode.parentNode.id == "wfi-custom-counter" ? "#wfi-custom-counter" : "#wfi-custom-title";
		}
		
		fontPicker.show(this);
	});
	
	$("#wfi-custom-container div .editTools .color").click(function() {
		colorPicker.show(this);
		colorPicker.applyTo("color", this.parentNode.parentNode.id == "wfi-custom-counter" ? "#wfi-custom-counter" : "#wfi-custom-title");
	});
	
	$("#wfi-custom-container > .editTools .bodyColor").click(function() {
		colorPicker.show(this);
		colorPicker.applyTo("backgroundColor", "#wfi-custom-container");
	});
	
	$("#wfi-custom-container > .editTools .bodyImage").click(function() {
		imagePicker.show(this);
	});
	
	
	
	fontPicker.onChange = function(fontName) {
		var $el = $(elementOnWhichFontIsBeingChanged);
		$el.css("fontFamily", fontName);
		
		if($el[0].parentNode.id.indexOf("counter") != -1) {
			customHtmlData.setCounterFont(fontName);
		} else {
			customHtmlData.setTitleFont(fontName);
		}
	};
	
	$("#wfi-custom-counter h1, #wfi-custom-title h2").click(function() {
		$("input.edit", this.parentNode).show().focus();
	});
	
	$("#wfi-custom-counter input.edit").blur(function() {
		$(this).hide();
		// stop previous counter
		if(engine) {
			engine.stop();
			engine = null;
		}
		
		// start new counter
		var smartStr = $(this).val();
		if(smartStr) {
			var jsdate = wfi.DateUtils.getJsDateFromSmartStr(smartStr);
			engine = new wfi.CountEngine(jsdate, "", false);
			engine.addAppender("customThemeAppender", new wfi.SimpleCustomThemeH1Appender());
			if(!engine.start()) {
				alert("Sorry, counter couldn't start correctly, " + jsdate + " couldn't be parsed to a valid date");
			}
			customHtmlData.setCounterValue(smartStr);
		}
	});
	
	$("#wfi-custom-title input.edit").blur(function() {
		$(this).hide();
		// set title
		var title = $(this).val();
		if(title.length != 0) {
			$("#wfi-custom-title h2").html(title);
			customHtmlData.setTitleValue(title);
		}
	});
});