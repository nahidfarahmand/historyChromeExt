var ctrls = angular.module('HistoryChromeEx.controllers', []);

ctrls.controller("PageController", function($scope, $filter) {
    
    $scope.date = new Date();
    $scope.date.setMinutes(0);
    $scope.weekCounter = 0;
    $scope.daysOfWeek = [{
        name: 'Sunday',
        index: 0
    }, {
        name: 'Monday',
        index: 1
    }, {
        name: 'Tuesday',
        index: 2
    }, {
        name: 'Wednesday',
        index: 3
    }, {
        name: 'Thursday',
        index: 4
    }, {
        name: 'Friday',
        index: 5
    }, {
        name: 'Saturday',
        index: 6
    }];
    $scope.selectedDay = $scope.date.getDay();
    $scope.selectedHour = $scope.date.getHours();
    
    var DayCountInfo = function (eventInfo , count) {
	this.eventInfoArray = [];
	this.eventInfoArray.push(eventInfo);
	this.count = count;
    };

    var CalendarChartInfo = function (startTime, endTime, index, summary) {
	this.startTime = startTime;
	this.endTime = endTime;
	this.index = index;
	this.summary = summary;
    };

    var EventInfo = function(id, url, timeOfVisit, title) {
        this.id = id;
        
        this.url = url;
        this.title = title;
        this.timeOfVisit = timeOfVisit;
        this.domain = $filter('domain')(url);
	this.duration = CalculateDuration(this.domain,url);
    };

    var ChartInfo = function(domain, time, index, url, title,duration) {
        this.domain = domain;
        this.time = time;
        this.url = url;
        this.title = title;
        this.index = index;
	this.duration = duration;
    };
    
    var GetVideoId = function(url) {
    
        var splitted = url.split('v=');
	if(splitted.length <= 1)
		return video_id = '';
	var video_id = splitted[1];
	
	var ampersandPosition = video_id.indexOf('&');
	if(ampersandPosition != -1) 
		video_id = video_id.substring(0, ampersandPosition);
	return video_id;

    };

    
    var CalculateYouTubeDuration = function(url) {
	var video_id = GetVideoId(url);
	var duration = 0;
	if(video_id != '')
	{
		$.ajax({
			url: 'http://gdata.youtube.com/feeds/api/videos/'+video_id+'?v=2&alt=jsonc',
			dataType: 'json',
			async: false,
			success: function(data) {
				duration = data.data.duration;
			}
		});
     
	}
	return duration;

    };
    

    
    var CalculateDuration = function(domain,url) {
	switch(domain) {
		case 'www.youtube.com':
		 return CalculateYouTubeDuration(url);
		break;
		default:
		return 0;
	}
    };

    $scope.urlArray = [];
    $scope.urlDayArray = new Object();
    $scope.timeArray = [];

    $scope.init = function() {
	$scope.dayView = false;
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
    
    $scope.hourViewEnabled = function() {
        $scope.dayView = false;

    };
    
    $scope.dayViewEnabled = function() {
        $scope.dayView = true;

    };

    $scope.nextWeek = function(index) {


    };

    $scope.prevWeek = function(index) {


    };

    $scope.buildTypedUrlList = function() {


        var microsecondsPerHour = 1000 * 60 * 60;

        var startTime = $scope.date.getTime();
        var endTime = $scope.date.getTime() + microsecondsPerHour;
	var startOfDayDate = new Date($scope.date);
	startOfDayDate.setHours(0,0,0,0);
	var endOfDayDate = new Date($scope.date).setHours(12,59,59,999);
	var startOfDay = startOfDayDate.getTime();
	var endOfDay = startOfDay +  1000 * 60 * 60 * 24;


        var numberProcessed = 0;

        var processVisits = function(url, index, visitItems) {
            for (var ii = 0; ii < visitItems.length; ii++) {
	    
                //this id is always the same for all visits, it just checks the time
                if (visitItems[ii].id == $scope.historyArray[index].id && visitItems[ii].visitTime >= startTime && visitItems[ii].visitTime <= endTime) {
                    $scope.urlArray.push(new EventInfo($scope.historyArray[index].id, url, new Date(visitItems[ii].visitTime), $scope.historyArray[index].title));

                }
		
		if (visitItems[ii].id == $scope.historyArray[index].id && visitItems[ii].visitTime >= startOfDay && visitItems[ii].visitTime <= endOfDay) {
		     var time = new Date(visitItems[ii].visitTime);
		     time.setMinutes(time.getMinutes(),0,0);
		     if($scope.timeArray.indexOf(time.getTime()) == -1)
			$scope.timeArray.push(time.getTime());
		     var timeVal = time.getTime();
		     var eventInfo = new EventInfo($scope.historyArray[index].id, url, time, $scope.historyArray[index].title);
		     //console.log($scope.urlDayArray[time]);
		    if($scope.urlDayArray[timeVal] !== undefined) {
		    
			var found = false;
			//console.log($scope.urlDayArray[time].count);
			for(var j = 0 ; j < $scope.urlDayArray[timeVal].eventInfoArray.length ; j++)
			{
				if($scope.urlDayArray[timeVal].eventInfoArray[j].url == url)
				{
					found = true;
					break;
				}
			}
			if(!found)
			{
				$scope.urlDayArray[timeVal].eventInfoArray.push(eventInfo);
				$scope.urlDayArray[timeVal].count++;
				
			}
			
		    }
		    else
		    {
			
			$scope.urlDayArray[timeVal] = new DayCountInfo(eventInfo,1);
			
		    }
		    
                }
            }

            if (!--numberProcessed) {
                onAllVisitsProcessed();
            }
        };

        var onAllVisitsProcessed = function() {
            $scope.chartArray = [];
	    $scope.chartArrayWithDuration = [];
	    $scope.chartDayArray = new Object();
	    
	    
	    //sort the timeArray
	    $scope.timeArray.sort();
	    console.log($scope.timeArray.length);
	    	var millisecondPerMinute = 1000 * 60;
	
		//to get the count every 1 minutes
		var interval = 5;
	
		for (var ii = 0; ii < $scope.timeArray.length; ii++) 
		{
			var indexToAdd = 0;
			var time = new Date($scope.timeArray[ii]);
			var time2 = new Date($scope.timeArray[ii]);
			var timeMin = time.getMinutes() -  time.getMinutes() % interval;
			
			time.setMinutes(timeMin,0,0);
			
			//item is already there 
			if( $scope.chartDayArray[time] !== undefined) {
			     //loop through all events to avoid adding the same url
			    
			     for(var i = 0 ; i < $scope.urlDayArray[$scope.timeArray[ii]].eventInfoArray.length ; i++)
			     {
				var found = false;
				for(var j = 0 ; j < $scope.chartDayArray[time].eventInfoArray.length ; j++)
				{
				if($scope.chartDayArray[time].eventInfoArray[j].url == $scope.urlDayArray[$scope.timeArray[ii]].eventInfoArray[i].url)
					found = true;
					break;
				}
				if(!found)
				 {
					$scope.chartDayArray[time].eventInfoArray.push($scope.urlDayArray[$scope.timeArray[ii]].eventInfoArray[i]);
					$scope.chartDayArray[time].count+= 1;					
				 }
			     }
			}
			else
			{
				$scope.chartDayArray[time] = $scope.urlDayArray[$scope.timeArray[ii]];
				
			    
			}

		}    

            var currentIndex = 0;
	    var currentIndexWithDuration = 0;
            for (var ii = 0; ii < $scope.urlArray.length; ii++) {
                var found = false;
		var foundWithDuration = false;
                var indexToAdd = 0;
		var indexToAddWithDuration = 0;
		console.log($scope.urlArray[ii].duration);
		if($scope.urlArray[ii].duration == 0)
		{
			for (var j = 0; j < currentIndex; j++) {
			    if ($scope.chartArray[j].time == $scope.urlArray[ii].timeOfVisit.getMinutes() && $scope.chartArray[j].domain == $scope.urlArray[ii].domain) {
				found = true;
				break;
			    }
			    if ($scope.chartArray[j].time == $scope.urlArray[ii].timeOfVisit.getMinutes())
				indexToAdd++;

			}
			if (!found) {
			    var title = ($scope.urlArray[ii].title.length > 0) ? $scope.urlArray[ii].title: "(no title)";
			    $scope.chartArray.push(new ChartInfo($scope.urlArray[ii].domain, $scope.urlArray[ii].timeOfVisit.getMinutes(), indexToAdd, $scope.urlArray[ii].url, title,$scope.urlArray[ii].duration));
			    currentIndex++;
			}
		}
		else
		{
			for (var j = 0; j < currentIndexWithDuration; j++) {
			    if ($scope.chartArrayWithDuration[j].time == $scope.urlArray[ii].timeOfVisit.getMinutes() && $scope.chartArrayWithDuration[j].url == $scope.urlArray[ii].url) {
				foundWithDuration = true;
				break;
			    }
			    if ($scope.chartArrayWithDuration[j].time <= $scope.urlArray[ii].timeOfVisit.getMinutes() && $scope.urlArray[ii].timeOfVisit.getMinutes() <= ($scope.chartArrayWithDuration[j].time + $scope.chartArrayWithDuration[j].duration/60) )
				indexToAddWithDuration++;

			}
			if (!foundWithDuration) {
			    var title = ($scope.urlArray[ii].title.length > 0) ? $scope.urlArray[ii].title: "(no title)";
			    $scope.chartArrayWithDuration.push(new ChartInfo($scope.urlArray[ii].domain, $scope.urlArray[ii].timeOfVisit.getMinutes(), indexToAddWithDuration, $scope.urlArray[ii].url, title,$scope.urlArray[ii].duration));
			    currentIndexWithDuration++;
			}		
		}

            }
            //had to put this - view was not getting updated after one click
            $scope.draw();
	    
	    var url =  "https://www.googleapis.com/calendar/v3/calendars/cjsk8q0sg1l9ieq5tdj8m5k0g8@group.calendar.google.com/events?singleEvents=true&key=AIzaSyAk_t13UHYrFkVhHjFYwGGJicZrMCmZHLI";
	    $.getJSON(url, function(data) {

		$scope.chartArrayEvents = [];
		var currentIndex = 0;
		for(var ii = 0 ; ii < data['items'].length ; ii++)
		{
			var indexToAdd = 0;
			var startTime = new Date(data['items'][ii].start.dateTime);
			var endTime = new Date(data['items'][ii].end.dateTime);
			if(startTime >= endOfDayDate || endTime <= startOfDayDate)
				continue;
			for (var j = 0; j < currentIndex; j++) {
			    if ($scope.chartArrayEvents[j].startTime <= startTime && $scope.chartArrayEvents[j].endTime >= endTime)
				indexToAdd++;
			}
			console.log(startTime.getHours() + "  " +endTime.getHours());
			$scope.chartArrayEvents.push(new CalendarChartInfo(startTime, endTime, indexToAdd, data['items'][ii].summary));
			currentIndex++;

		}    
    
	     $scope.drawEvents();
    
    });
            $scope.$apply();
        };
        chrome.history.search({
                'text': '', // Return every history item....
                'endTime': endOfDay,
                'startTime': startOfDay
            },
            function(historyItems) {
                // For each history item, get details on all visits.
                $scope.urlArray = [];
		$scope.urlDayArray = new Object();
		$scope.timeArray = [];
		$scope.historyArray = historyItems;
                numberProcessed = historyItems.length;
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    var title = historyItems[i].title;
                    var processVisitsWithUrl = function(url, index) {
                        return function(visitItems) {
                            processVisits(url, index, visitItems);
                        };
                    };

                    chrome.history.getVisits({
                        url: url
                    }, processVisitsWithUrl(url, i));
                }
                if (!numberProcessed) {
                    onAllVisitsProcessed();
                }
            });


    };



    $scope.draw = function() {

        var oneHour = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
        var margin = {
                top: 20,
                right: 10,
                bottom: 30,
                left: 10
            },
            width = 60*18,
            height = 400 - margin.top - margin.bottom;
        var x = d3.scale.linear()
            .domain([d3.min(oneHour), d3.max(oneHour)])
            .range([0, width]);
        var y = d3.scale.linear()
            .domain([0, 100])
            .range([height, 0]);
        var r = d3.scale.linear()
            .range([5, 35]);

        var scatter = document.getElementById('scatterplot')
        while (scatter.firstChild) {
            scatter.removeChild(scatter.firstChild);
        }

        $scope.chart = d3.select('#scatterplot');
	var scatterChart = $scope.chart
            .append('svg:svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class', 'chart');



        var main = scatterChart.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'main')
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        main.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'main axis date')
            .call(xAxis);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        main.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'main axis-hide')
            .call(yAxis);

        var g = main.append("svg:g");

        g.selectAll('#scatterplot')
            .data($scope.chartArray) // using the values in the yFemaleLE array
            .enter().append('image').attr('class', 'history-item history-ax-item')
            .attr('data-original-title', function(d){return d.title;})
            .attr('data-trigger', 'manual')
            .attr('data-placement', 'top')
            .attr('data-container', 'body')
            .attr("xlink:href", function(d, i) {
                return "http://g.etfv.co/http://" + $scope.chartArray[i].domain;
            })
            .attr("y", function(d, i) {
                return y(($scope.chartArray[i].index * 8) + 10);
            })
            .attr("x", function(d, i) {
                return x($scope.chartArray[i].time);
            }).attr("width", 15).attr("height", 15).on("click", function(d) {
                window.open(d.url, "_blank");
            }).on("mouseover", function(){
                $(this).tooltip("show");
            }).on("mouseout", function(){
                $(this).tooltip("hide");
            });
	    
	    //Drawing the lines for pages with duration
	    
	   var svg = $scope.chart.append("svg")
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
                .attr('width', width)
		.attr('height',80);
		
	
	    for(var i = 0 ; i < $scope.chartArrayWithDuration.length ; i++)
	   {

		var line = svg.append("line");
		line
		.attr('x1',x($scope.chartArrayWithDuration[i].time))
		.attr('x2',x($scope.chartArrayWithDuration[i].time + ($scope.chartArrayWithDuration[i].duration/60)))
		.attr('y1', $scope.chartArrayWithDuration[i].index * 8 + 2)
		.attr('y2', $scope.chartArrayWithDuration[i].index * 8 + 2)
		.attr('stroke','#b31217').attr('stroke-width',4)
         .attr('data-original-title', $scope.chartArrayWithDuration[i].title)
        .attr('data-trigger', 'manual')
        .attr('data-placement', 'bottom')
        .attr('data-container', 'body')
        .attr('class','youtube-item history-bx-item')
		.attr('name',$scope.chartArrayWithDuration[i].url)
        .on("click", function() {
            window.open($(this).attr('name'), "_blank");
        })
        .on("mouseover", function(){
            $(this).tooltip("show");
        })
        .on("mouseout", function(){
            $(this).tooltip("hide");
        })
        .append("svg:title").html($scope.chartArrayWithDuration[i].title)

		
		
    }

};

    $scope.drawEvents = function() {
	var getHourDiff = function(date1,date2) {
	   return (((date2 - date1) % 86400000) / 3600000);
	};
	var getMinDiff = function(date1,date2) {
	   return (((date2 - date1) % 86400000)  % 3600000) / 60000;
	};
        var oneDay = [];
	for(var i = 0 ; i < 24 ;i+=1)
	 oneDay.push(i);
	var oneHour = [];
	for(var i = 0 ; i < 60 ;i+=5)
	 oneHour.push(i);	
        var margin = {
                top: 20,
                right: 10,
                bottom: 30,
                left: 30
            },
            width = 1000 - margin.left - margin.right,
            height = 25 * 13;
        var x = d3.scale.linear()
            .domain([0, 24])
            .range([0, width]);
        var y = d3.scale.linear()
            .domain([0, 60])
            .range([height, 0]);
        var r = d3.scale.linear()
            .range([5, 35]);

        var scatter = document.getElementById('scatterplot2')
        while (scatter.firstChild) {
            scatter.removeChild(scatter.firstChild);
        }

        $scope.chart2 = d3.select('#scatterplot2');
	var scatterChart = $scope.chart2
            .append('svg:svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class', 'chart');



        var main = scatterChart.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'main')
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
	    .tickValues(d3.range(0, 24, 1));

        main.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'main axis date')
            .call(xAxis);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        main.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'main axis date')
            .call(yAxis);

      
	    //Drawing the lines for events
	    
	   var svg = $scope.chart2.append("svg")
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
                .attr('width', width)
		.attr('height',80);
		
	
	    for(var i = 0 ; i < $scope.chartArrayEvents.length ; i++)
	   {
		console.log(x($scope.chartArrayEvents[i].startTime.getHours()) + " " + ($scope.chartArrayEvents[i].startTime.getHours()));
		var line = svg.append("line");
		line
		.attr('x1',margin.left + x($scope.chartArrayEvents[i].startTime.getHours() + $scope.chartArrayEvents[i].startTime.getMinutes()/60))
		.attr('x2',margin.left + x($scope.chartArrayEvents[i].endTime.getHours() + $scope.chartArrayEvents[i].endTime.getMinutes()/60))
		.attr('y1', $scope.chartArrayEvents[i].index * 8 + 2)
		.attr('y2', $scope.chartArrayEvents[i].index * 8 + 2)
		.attr('stroke','blue').attr('stroke-width',4)
		.attr('data-original-title', $scope.chartArrayEvents[i].summary)
		.attr('data-trigger', 'manual')
		.attr('data-placement', 'bottom')
		.attr('data-container', 'body')
		.on("mouseover", function(){
			$(this).tooltip("show");
		})
		.on("mouseout", function(){
			$(this).tooltip("hide");
		})
		.append("svg:title").html($scope.chartArrayEvents[i].summary);

		
		
	   }

	    
	var g2 = main.append("svg:g");
        g2.selectAll('#scatterplot2')
            .data(d3.entries($scope.chartDayArray)) // using the values in the yFemaleLE array
            .enter().append('svg:circle')
            .attr('data-original-title', function(d){return d;})
            .attr('data-trigger', 'manual')
            .attr('data-placement', 'top')
            .attr('data-container', 'body')
            .attr("fill","orange")
	    .attr("class", "clickable")
	    .attr("r", function(d, i) {
	        return 10;
            })
            .attr("cy", function(d, i) {
	        return y( new Date(d.key).getMinutes() + 2.5);
            })
            .attr("cx", function(d, i) {
                return x( new Date(d.key).getHours());
            })
	    .on("click", function(d) {
		$scope.selectedCircle = d.value;
		$scope.$apply();
        })
	    .attr("data-toggle","modal")
	    .attr("data-target","#myModal");
	    
	g2.selectAll('#scatterplot2')
		.data(d3.entries($scope.chartDayArray))
		.enter().append("text") //Add a text element
		.attr("y", function (d,i) { return y(new Date(d.key).getMinutes() + 2.5 );})
		.attr("x", function (d,i) { return x( new Date(d.key).getHours()); })
		.attr("dx", function(d,i){ return -3;})
		.attr("dy", function(d,i){ return +3;})
		.attr('class', 'small')
		.text(function(d, i){ return d.value.count;});



};

});
