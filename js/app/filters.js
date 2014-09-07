var filters = angular.module('HistoryChromeEx.filters', []);

filters.filter( 'domain', function () {
  return function ( input ) {
    var matches,
        output = "",
        urls = /\w+:\/\/([\w|\.]+)/;

    matches = urls.exec( input );

    if ( matches !== null ) output = matches[1];

    return output;
  };
});

filters.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

filters.filter( 'formatTime', function () {
  return function ( input ) {
    if(input < 10)
	   return "0" + input;
	else
		return input;
  };
});

filters.filter( 'itemTitle', function () {
  return function ( input ) {
    if(input.length > 0)
      return input;
    else
      return "(no title)";
  };
});