myApp.filter( 'domain', function () {
  return function ( input ) {
    var matches,
        output = "",
        urls = /\w+:\/\/([\w|\.]+)/;

    matches = urls.exec( input );

    if ( matches !== null ) output = matches[1];

    return output;
  };
});


myApp.controller("PageController", function ($scope) {

	
	    $scope.date = new Date();
        $scope.$apply();
	
	var DomainInfo = function(hasDuration,name,icon) {
    this.hasDuration = hasDuration;
	this.name = name;
	this.icon = icon;
};
var facebook = new DomainInfo(false,'www.facebook.com','img//clock.png');
var google = new DomainInfo(false,'www.google.com','img/favicon.ico');

// now add to array
$scope.definedDomains = [];
$scope.definedDomains.push(facebook);
$scope.definedDomains.push(google);
	
	 $scope.urlArray = [];

	$scope.change = function() {

			 $scope.buildTypedUrlList("typedUrl_div");
           };

$scope.buildTypedUrlList = function(divName) {

  
  var microsecondsPerHour = 1000 * 60 * 60  ;
  var oneHourAgo = $scope.date.getTime() - microsecondsPerHour;

  var numRequestsOutstanding = 0;
  debugger;
  chrome.history.search({
      'text': '',              // Return every history item....
      'startTime': oneHourAgo ,
	  'endTime': $scope.date.getTime()

    },
    function(historyItems) {
      // For each history item, get details on all visits.
	  
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        $scope.urlArray.push(url);
    }
      }
 
    )};

  });





