if(!wfi) {var wfi = {};}

wfi.CounterCreator = function($previewArea) {
	/**
	 * The count engine instance used for previewed the counter page
	 * @type wfi.CountEngine
	 */
	this._countEngine = null;
	
	/**
	 * The preview area
	 * @type JQueryObject
	 */
	this.$previewArea = $previewArea;
};

wfi.CounterCreator.prototype = {
	/**
	 * Preview a custom HTML code into the preview area
	 * @param {String} html The HTML code to be previewed
	 * @param {String} title The title to go with the counter
	 * @param {Boolean} up Count up?
	 * @param {String} smartValue The smart value content, to be interpreted into a datestamp
	 * @return {Boolean} True if the preview processed started correctly (it's async), false if the smartValue could not be parsed
	 */
	preview: function(html, title, up, smartValue) {
		var dateStamp = wfi.DateUtils.getDateStampFromSmartStr(smartValue);
		if(dateStamp) {
			var jsdateStr = wfi.DateUtils.getJsDateStrFromDateStamp(dateStamp);
			this.tameHtml(html, this._continuePreviewWithTamedHtml, this, [title, up, jsdateStr]);
			return true;
		} else {
			return false;
		}
	},
	
	_continuePreviewWithTamedHtml: function(html, args) {
		var title = args[0];
		var up = args[1];
		var jsdateStr = args[2];
		
		// Put HTML and title in page
		this.$previewArea.html(html);
		$("head title").html(title + " [PREVIEW]");
		
		// Start preview using the CountEngine
		this._startCountEngineOnPreviewedHtml(jsdateStr, title, up);	
	},
	
	_continueCreateWithTamedHtml: function(html, args) {
		debugger;
	},

	/**
	 * Tame custom HTML code so it can be previewed into the preview area
	 * @param {String} html The HTML code to be tamed
	 * @param {Function} cb The callback to execute when the HTML has been tamed (the tamed HTML will be passed as 1st argument)
	 * @param {Object} scope Optional scope to execute the callback in
	 * @param {Array} args Optional array of arguments to be passed to the callback (will be passed as 2nd argument)
	 */
	tameHtml: function(html, cb, scope, args) {
		if(!scope) {
			scope = window;
		}
		var self = this;
		$.ajax({
			type: 'POST',
			url: "/getSafeHtml",
			data: {html: html},
			dataType: "html",
			success: function(scope) {
				return function(data) {
					cb.apply(scope, [data, args]);
				};
			}(scope)
		});
	},
	
	/**
	 * Once there is HTML to be previewed, start the countengine on it to show the real preview
	 * @param {String} jsdateStr The string for the jsdate to be created
	 * @param {String} title The title of the counter
	 * @param {Boolean} up True if this is a count up
	 */
	_startCountEngineOnPreviewedHtml: function(jsdateStr, title, up) {
		if(this._countEngine) {
			this._countEngine.stop();
		}

		this._countEngine = new wfi.CountEngine(jsdateStr, title, up);
		this._countEngine.addAppender("h1h2", new wfi.GlobalH1H2Appender());
		if(!this._countEngine.start()) {
			alert("Counter couldn't start, " + jsdateStr + " couldn't be parsed into a valid date");
		}
	}
};



$(document).ready(function() {
	var cc = new wfi.CounterCreator($("#wfi-preview"));
	
	function getExpertHtmlFromSimpleInputs() {
		var idPrefix = "#wfi-simpleHtmlCreator-";
		html = "<style type='text/css'>";
		html += "body {";
		html += "font-family: " + $(idPrefix + "font").val() + ";";
		var color = $(idPrefix + "bkgColor").val() || "white";
		html += "background: " + color;
		if($(idPrefix + "bkgImage").val()) {
			html += " url(" + $(idPrefix + "bkgImage").val() + ") " + $(idPrefix + "bkgRepeat").val() + " " + $(idPrefix + "bkgPosition").val();
		}
		html += ";}";
		html += "#content {";
		var position = $(idPrefix + "position").val();
		if(position.indexOf("right") != -1) {
			html += "text-align: right;";
		}
		html += "position:absolute;" + position + "}";
		var counterSize = $(idPrefix + "counterSize").val() || "20";
		var counterColor = $(idPrefix + "counterColor").val() || "black";
		var titleSize = $(idPrefix + "titleSize").val() || "17";
		var titleColor = $(idPrefix + "titleColor").val() || "black";
		html += "h1 {font-size: " + $(idPrefix + "counterSize").val() + "px; color: " + $(idPrefix + "counterColor").val() + "}";
		html += "h2 {font-size: " + $(idPrefix + "titleSize").val() + "px; color: " + $(idPrefix + "titleColor").val() + "}";
		html += "</style>";
		html += "<div id='content'><h1></h1><h2></h2></div>";
		
		return html;
	}
	
	// Are we in simple or expert custom mode?
	var mode = $("#wfi-urlForm").attr("_mode");
	
	// Preview handler
	$("#wfi-urlForm #wfi-previewBtn").click(function(evt){
		evt.preventDefault();
		
		if(mode == "simple") {
			// In this mode, we need to create custom HTML based on user's inputs
			$("#wfi-customTheme").val(getExpertHtmlFromSimpleInputs());
		}
		
		if(!cc.preview(
			$("#wfi-customTheme").val(),
			$("#wfi-urlForm #wfi-title").val(),
			$("#wfi-urlForm #wfi-up")[0].checked,
			$("#wfi-smart").val()
		)) {
			$("#wfi-smart").addClass("error");
		}
	});

	// Create handler
	$("#wfi-urlForm").submit(function(evt){
		if(mode == "simple") {
			// In this mode, we need to create custom HTML based on user's inputs
			$("#wfi-customTheme").val(getExpertHtmlFromSimpleInputs());
		}
		
		if($("#wfi-urlForm #wfi-relative")[0].checked) {
			var dateStamp = "NOW" + wfi.DateUtils.getMsDurationFromSmartValue($("#wfi-smart").val());
		} else {
			var dateStamp = wfi.DateUtils.getDateStampFromSmartStr($("#wfi-smart").val());
		}
		if(dateStamp) {
			$("#wfi-datestamp").val(dateStamp);
		} else {
			evt.preventDefault();
			$("#wfi-smart").addClass("error");
		}
	});
	
	// Remove error class when focusing back into the smart input
	$("#wfi-smart").focus(function(evt){
		$("#wfi-smart").removeClass("error");
	});
	
	// help tooltip
    $('#wfi-smart, #wfi-customTheme').focus(function() {		
		if(this.id == "wfi-smart") {
			$("#wfi-helpForSmartField").show();
			$("#wfi-helpForCustomTheme").hide();
		} else {
			$("#wfi-helpForSmartField").hide();
			$("#wfi-helpForCustomTheme").show();
		}
		
        var top = $(this).offset().top + 2;
        var left = $(this).offset().left + parseInt($(this).css("width")) + 16;
        $('#wfi-helpTip').css({'top':top, 'left':left});
		$('#wfi-helpTip').show();
    });
    $('#wfi-smart, #wfi-customTheme').blur(function () {
        $('#wfi-helpTip').hide();
    });
});