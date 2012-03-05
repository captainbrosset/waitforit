if(!wfi) {var wfi = {};}


wfi.MenuBarManager = function() {
	this._resetFlags();
}
wfi.MenuBarManager.prototype = {
	hideAllItems: function() {
		$("#wfi-forms").hide();
		$("#wfi-urlForm, #wfi-shareForm, #wfi-whatsonForm").hide();
		$("#wfi-tools .toolShare, #wfi-tools .toolCreate, #wfi-tools .toolWhatson").removeClass("selected");
		this._resetFlags();
	},
	
	_resetFlags: function() {
		this._isWhatsonToolVisible = false;
		this._isShareToolVisible = false;
		this._isCreateToolVisible = false;
	},
	
	showItemCreate: function() {
		if(this._isCreateToolVisible) {
			this.hideAllItems();
		} else {
			this.hideAllItems();
			$("#wfi-urlForm").show();
			$("#wfi-forms").show().offset({left: 41, top: 28});
			$("#wfi-tools .toolCreate").addClass("selected");
			this._isCreateToolVisible = true;
		}
	},
	
	showItemShare: function() {
		if(this._isShareToolVisible) {
			this.hideAllItems();
		} else {
			this.hideAllItems();
			$("#wfi-shareForm").show();
			$("#wfi-forms").show().offset({left: 104, top: 28});
			$("#wfi-shortUrl").focus();
			$("#wfi-tools .toolShare").addClass("selected");
			this._isShareToolVisible = true;
		}
	},
	
	showItemWhatson: function() {
		if(this._isWhatsonToolVisible) {
			this.hideAllItems();
		} else {
			this.hideAllItems();
			$("#wfi-whatsonForm").show();
			$("#wfi-forms").show().offset({left: 174, top: 28});
			$("#wfi-tools .toolWhatson").addClass("selected");
			this._isWhatsonToolVisible = true;
		}
	}
};

$(document).ready(function() {
	var mbm = new wfi.MenuBarManager();
	$("#wfi-tools .toolCreate").click(function(evt){mbm.showItemCreate()});
	$("#wfi-tools .toolShare").click(function(evt){mbm.showItemShare()});
	$("#wfi-tools .toolWhatson").click(function(evt){mbm.showItemWhatson()});
	$("#wfi-tools .toolRandom").click(function() {
		document.location.href = "/random";
	});
	
	$("#wfi-bookmark").mouseenter(function(){
		$("li.wfi-bookmark-item", this).animate({
			"height": 30
		}, 150);
	});
	$("#wfi-bookmark").mouseleave(function(){
		$("li.wfi-bookmark-item", this).animate({
			"height": 0
		}, 150);
	});
});