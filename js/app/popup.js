//---------FILTERS----------------------
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

myApp.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

myApp.filter( 'formatTime', function () {
  return function ( input ) {
    if(input < 10)
	   return "0" + input;
	else
		return input;
  };
});
//--------END FILTERS------------------------

myApp.controller("PageController", function ($scope) {

	
      $scope.date = new Date();
	  $scope.date.setMinutes(0);
	  $scope.daysOfWeek = [ { name:'Sunday', index:0},{ name:'Monday', index:1},{ name:'Tuesday', index:2},{ name:'Wednesday', index:3},{ name:'Thursday', index:4},{ name:'Friday', index:5},{ name:'Saturday', index:6}];
	  $scope.selectedDay = $scope.date.getDay();
	  $scope.selectedHour = $scope.date.getHours();
	  
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

	$scope.init = function() {

			 $scope.buildTypedUrlList();
           };
		   
	$scope.changeDay = function(index) {
		//we need another variable to keep track of backward/forward to multiply weeks
		$scope.date.setDate($scope.date.getDate() - ($scope.date.getDay() - index));
		$scope.buildTypedUrlList();
		$scope.selectedDay = index;
		
	};
	
	$scope.changeTime = function(index) {
		$scope.date.setHours($scope.date.getHours() - ($scope.date.getHours() - index));
		$scope.buildTypedUrlList();
		$scope.selectedHour = index;
		
	};

$scope.buildTypedUrlList = function() {

  
  var microsecondsPerHour = 1000 * 60 * 60  ;
 
  var oneHourAgo = $scope.date.getTime() - microsecondsPerHour;


  chrome.history.search({
      'text': '',              // Return every history item....
      'startTime': oneHourAgo ,
	  'endTime': $scope.date.getTime()

    },
    function(historyItems) {
      // For each history item, get details on all visits.
	  $scope.urlArray = [];
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        $scope.urlArray.push(url);
    }
	//had to put this - view was not getting updated after one click
	  $scope.$apply();
      }
 
    )};

	
  });





