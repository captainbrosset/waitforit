if(!wfi) {var wfi = {};}

/**
 * Series of date utilities to manipulate "smart values", jsdates and datestamps back and forth
 * @singleton
 */
wfi.DateUtils = {
	/**
	 * Concerts a string as typed by the user into a duration in seconds
	 * The value typed must be a smartValue (3 hours 2 minutes for instance)
	 * @param {String} smartValue smart value (3 hours 2 minutes)
	 * @return {Number} The number of seconds
	 */
	getMsDurationFromSmartValue: function(smartValue) {
		var reSmartExpression = new RegExp(/^([0-9]+ (second|seconds|minute|minutes|hour|hours|day|days|month|months|year|years)( )*)+$/)
		
		if(smartValue.match(reSmartExpression)) {
			var parts = smartValue.split(" ");
			var time = 0;
			for(var i = 0; i < parts.length; i ++) {
				var type = parts[i + 1];
				var value = parseInt(parts[i]);

				if(type == "second" || type == "seconds") {
					time += value;
				} else if(type == "minute" || type == "minutes") {
					time += value * 60;
				} else if(type == "hour" || type == "hours") {
					time += value * 60 * 60;
				} else if(type == "day" || type == "days") {
					time += value * 24 * 60 * 60;
				} else if(type == "month" || type == "months") {
					time += value * 30 * 24 * 60 * 60;
				} else if(type == "year" || type == "years") {
					time += value * 365 * 24 * 60 * 60;
				}
				i++;
			}
			return time;
		} else {
			return false;
		}
	},
	
	/**
	 * Converts a string as typed by the user in the smart input into a usable datestamp
	 * @param {String} smartValue Either a datestamp directly (DDMMYYYYHHMM) or a smart value (3 hours 2 minutes)
	 * @return {String} The computed datestamp (DDMMYYYYHHMMSS)
	 */
	getDateStampFromSmartStr: function(smartValue) {
		var reDateStamp = new RegExp(/^[0-9]{12}$/);
		var reSmartExpression = new RegExp(/^([0-9]+ (second|seconds|minute|minutes|hour|hours|day|days|month|months|year|years)( )*)+$/)
		var dateStamp = false;

		// Either it's a true datestamp
		if(smartValue.match(reDateStamp)) {
			dateStamp = smartValue
		}
		// Or it's a smart expression (i.e. "1 minute", "4 hours", "45 years 3 days 5 minutes")
		else {
			var duration = this.getMsDurationFromSmartValue(smartValue);
			if(duration) {
				var now = new Date().getTime();
				now += duration * 1000;

				var target = new Date(now);
				var day = target.getDate() + "";
				if(day.length == 1)	day = "0" + day;
				var month = target.getMonth() + 1 + "";
				if(month.length == 1)	month = "0" + month;
				var year = target.getYear() + 1900 + "";
				var hour = target.getHours() + "";
				if(hour.length == 1)	hour = "0" + hour;
				var minute = target.getMinutes() + "";
				if(minute.length == 1)	minute = "0" + minute;
				var second = target.getSeconds() + "";
				if(second.length == 1)	second = "0" + second;
				dateStamp = day + month + year + hour + minute + second;
			}
		}

		return dateStamp;
	},
	
	/**
	 * Converts a datestamp into a jsdate string that can be interpreted by a new Date(jsdate) expression
	 * @param {String} dateStamp The datestamp (DDMMYYYYHHMMSS)
	 * @return {String} The jsdate (MM/DD/YYYY HH:MM:SS)
	 */
	getJsDateStrFromDateStamp: function(dateStamp) {
		var day = dateStamp.substring(0, 2),
			month = dateStamp.substring(2, 4),
			year = dateStamp.substring(4, 8),
			hour = dateStamp.substring(8, 10),
			minute = dateStamp.substring(10, 12),
			second = dateStamp.substring(12, 14);
		return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second;
	},
	
	/**
	 * Converts a smart value into a jsdate string that can be interpreted by a new Date(jsdate) expression
	 * @param {String} smartValue Either a datestamp directly (DDMMYYYYHHMM) or a smart value (3 hours 2 minutes)
	 * @return {String} The jsdate (MM/DD/YYYY HH:MM:SS)
	 */
	getJsDateFromSmartStr: function(smartValue) {
		return this.getJsDateStrFromDateStamp(this.getDateStampFromSmartStr(smartValue));
	},
	
	/**
	 * Returns a number of milliseconds from a jsdate string
	 * @param {String} The jsdate string (MM/DD/YYYY HH:MM:SS)
	 * @return {Number} The number of milliseconds, NaN if the date could not be parsed properly
	 */
	getMsFromJsDate: function(jsdateStr) {
		return new Date(jsdateStr).getTime();
	}
};