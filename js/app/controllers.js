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


    var EventInfo = function(id, duration, url, timeOfVisit, title) {
        this.id = id;
        this.duration = duration;
        this.url = url;
        this.title = title;
        this.timeOfVisit = timeOfVisit;
        this.domain = $filter('domain')(url);
    };

    var ChartInfo = function(domain, time, index, url, title) {
        this.domain = domain;
        this.time = time;
        this.url = url;
        this.title = title;
        this.index = index;
    };

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

    $scope.nextWeek = function(index) {


    };

    $scope.prevWeek = function(index) {


    };

    $scope.buildTypedUrlList = function() {


        var microsecondsPerHour = 1000 * 60 * 60;

        var startTime = $scope.date.getTime();
        var endTime = $scope.date.getTime() + microsecondsPerHour;

        var numberProcessed = 0;

        var processVisits = function(url, index, visitItems) {
            for (var ii = 0; ii < visitItems.length; ii++) {
                //this id is always the same for all visits, it just checks the time
                if (visitItems[ii].id == $scope.urlArray[index].id && visitItems[ii].visitTime > startTime && visitItems[ii].visitTime <= endTime) {
                    $scope.urlArray[index].timeOfVisit = new Date(visitItems[ii].visitTime);
                    //without break it is always showing the last occurance
                    //break;
                }
            }

            if (!--numberProcessed) {
                onAllVisitsProcessed();
            }
        };

        var onAllVisitsProcessed = function() {
            $scope.chartArray = [];
            var currentIndex = 0;
            for (var ii = 0; ii < $scope.urlArray.length; ii++) {
                var found = false;
                var indexToAdd = 0;
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
                    $scope.chartArray.push(new ChartInfo($scope.urlArray[ii].domain, $scope.urlArray[ii].timeOfVisit.getMinutes(), indexToAdd, $scope.urlArray[ii].url, title));
                    currentIndex++;
                }
            }
            //had to put this - view was not getting updated after one click
            $scope.draw();
            $scope.$apply();
        };
        chrome.history.search({
                'text': '', // Return every history item....
                'endTime': endTime,
                'startTime': startTime
            },
            function(historyItems) {
                // For each history item, get details on all visits.
                $scope.urlArray = [];
                numberProcessed = historyItems.length;
                for (var i = 0; i < historyItems.length; ++i) {
                    var url = historyItems[i].url;
                    var title = historyItems[i].title;
                    console.log(title);
                    $scope.urlArray.push(new EventInfo(historyItems[i].id, 0, url, 0, title));
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

        var chart = d3.select('#scatterplot')
            .append('svg:svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class', 'chart');



        var main = chart.append('g')
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
            .enter().append('image').attr('class', 'plot')
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
    };


});