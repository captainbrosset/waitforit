if(!wfi) {var wfi = {};}


/**
 * @class wfi.CountEngine
 * Manages the 1 second interval to compute the count string
 * Delegates to whatever appender(s) is(are) defined to display the count and title
 * @param {String} date The jsdate string that is used for the countdown/up. Must be either a number of milliseconds or a string like MM/DD/YYYY HH:MM:SS
 * @param {Boolean} isUp Whether it's a countup or not (a countdown)
 */
wfi.CountEngine = function(date, isUp) {
	this._interval = null;
	this._date = date;
	this._ms = null;
	if(typeof this._date == "number" && !isNaN(this._date)) {
		this._ms = this._date;
	} else if(typeof this._date == "string") {
		var ms = wfi.DateUtils.getMsFromJsDate(this._date);
		if(!isNaN(ms)) {
			this._ms = ms;
		}
	}
	this._isUp = isUp;
	this._appenders = {};
};
wfi.CountEngine.prototype = {
	/**
	 * Start the interval
	 * @return {Boolean} True if the engine started properly, false if the date passed in the constructor could not be parsed and therefore the engine couldn't start
	 */
	start: function() {
		if(this._ms === null) {
			return false;
		}
		
		var that = this;
		this._interval = setInterval(function(){			
			if(that._isUp) {
				var difference = new Date().getTime() - that._ms;
			} else {
				var difference = that._ms - new Date().getTime();
			}
			
			var toBeDisplayed = {
				// Is it up
				isUp: that._isUp,
				// Is it over
				isOver: false,
				// Has it started
				hasNotStarted: false,
				// English sentence giving the current time "2 days, 12:34:12"
				count: "",
				// Numerical representation of the current remaining time, contains sub properties for days, hours, minutes, seconds and milliseconds
				data: {},
				// The total number of milliseconds that the target date represents
				targetDateMs: that._ms,
				// The number of milliseconds corresponding to the current counter time
				currentTimeMs: difference
			};

			if(difference < 0) {
				if(that._isUp) {
					toBeDisplayed.hasNotStarted = true;
				} else {
					toBeDisplayed.isOver = true;
				}
			} else {
				var daysDifference = Math.floor(difference/1000/60/60/24);
				difference = difference - daysDifference*1000*60*60*24;

				var hoursDifference = Math.floor(difference/1000/60/60);
				difference = difference - hoursDifference*1000*60*60;

				var minutesDifference = Math.floor(difference/1000/60);
				difference = difference - minutesDifference*1000*60;

				var secondsDifference = Math.floor(difference/1000);
				difference = difference - secondsDifference*1000;

				var string = '';

				if (daysDifference > 0) {
					string += daysDifference + ' day';
					if (daysDifference > 1) string +='s';
					string += ', ';
				}

				if((hoursDifference+"").length == 1)	hoursDifference = "0" + hoursDifference;
				if((minutesDifference+"").length == 1)	minutesDifference = "0" + minutesDifference;
				if((secondsDifference+"").length == 1)	secondsDifference = "0" + secondsDifference;

				string += hoursDifference + ':';
				string += minutesDifference + ':';
				string += secondsDifference;

				toBeDisplayed.count = string;
				toBeDisplayed.data = {
					"days": daysDifference,
					"hours": hoursDifference,
					"minutes": minutesDifference,
					"seconds": secondsDifference,
					"milliseconds": difference
				};
			}
			
			for(var i in that._appenders) {
				if(that._appenders[i].display) {
					that._appenders[i].display(toBeDisplayed);
				}
			}
		}, 1000);
		return true;
	},
	
	/**
	 * Stop the interval. This will have the effect of not calling the appender(s) anymore
	 */
	stop: function() {
		if(this._interval !== null) {
			clearInterval(this._interval);
		}
	},
	
	/**
	 * Add an appender to this countEngine. Any appender must implement the display(obj) method
	 * @param {String} name The name to register the appender under
	 * @param {wfi.AppenderInterface} appender The implemention of the appender
	 */
	addAppender: function(name, appender) {
		if(!this._appenders[name]) {
			this._appenders[name] = appender;
		}
	},
	
	/**
	 * Remove an appender by its name
	 * @param {String} name
	 */
	removeAppender: function(name) {
		if(this._appenders[name]) {
			delete this._appenders[name];
		}
	},
	
	getAppender: function(name) {
		return this._appenders[name];
	}
};