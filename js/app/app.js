var myApp = angular.module('HistoryChromeEx', ['HistoryChromeEx.filters', 'HistoryChromeEx.services', 'HistoryChromeEx.directives', 'HistoryChromeEx.controllers']);
var activities = [];

chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab){
	console.log("updated:");
	if(tab.status = "complete") {
		var activity = new Object();
		activity.timestamp = new Date();
		activity.tab = tab;
		activity.tabId = tabId;
		activity.message = "updated";
		activities.push(activity);
	}
});


chrome.tabs.onCreated.addListener(function(tab){
	console.log("created:");
	var activity = new Object();
	activity.timestamp = new Date();
	activity.tab = tab;
	activity.tabId = tab.id;
	activity.message = "created";
	activities.push(activity);
});

chrome.tabs.onActivated.addListener(function(activeInfo){
	console.log("activated:");
	var activity = new Object();
	activity.timestamp = new Date();
	activity.tabId = activeInfo.tabId;
	activity.message = "activated";
	activities.push(activity);
});


chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	console.log("activated:");
	var activity = new Object();
	activity.timestamp = new Date();
	activity.tabId = tabId;
	var cause = removeInfo.isWindowClosing?"_window_" + removeInfo.windowId : "_tab";
	activity.message = "closed" + cause;
	activities.push(activity);
});
