import debounce from '../lib/debounce'
import groupArray from 'group-array'

import {
    line as d3_line,
    curveStep as d3_curveStep
    //curveBasis as d3_curveBasis
} from 'd3-shape';

import {
    select as d3_select,
    selectAll as d3_selectAll

} from 'd3-selection';

import { transition } from 'd3-transition';

import {
    min as d3_min,
    max as d3_max,
    sum as d3_sum,
    extent as d3_extent,
    range as d3_range,
    bisector as d3_Bisector
} from 'd3-array'

import {
    scalePoint,
    scaleLinear,
    scaleTime
} from 'd3-scale';

import {
    axisLeft as d3_axisLeft,
    axisRight as d3_axisRight,
    axisBottom as d3_axisBottom
} from 'd3-axis';

import {
    timeFormat as d3_timeParse
} from 'd3-time-format';

var parseTime = d3_timeParse("%Y-%m-%d"); //("%d-%b-%y"); //;

let dataset, localData;
let svgshell, svg, lines;


export default function() {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            dataset = JSON.parse(xhr.responseText);

           // for (var i = 0; i < dataset.attendances.length; i++) {
           //      dataset.attendances[i].d3Date = parseTime(new Date(dataset.attendances[i].date));
           //      //dataset.attendances[i].homeTeam == "Arsenal" ? arsenal.push(dataset.attendances[i]) : spurs.push(dataset.attendances[i]) ;
           //  }

            //localData = dataset.attendances;

            //console.log(dataset);

           initViz(dataset)
			    
		


            //buildVisual(localData);

        }
    }

    xhr.open('GET', '<%= path %>/assets/data/scorers.json', true);
    xhr.send(null);


    function initViz(data){

    	let seasonContainers = document.querySelectorAll(".season-container");

    	var margin = {top: 20, right: 20, bottom: 30, left: 30}, width = 145, height = 120;

    	data.forEach(function(dataEl){
    		var targetContainers = [];
    		let a = dataEl.scorerRef;
	    		seasonContainers.forEach(function(el){
	    			let b = el.getAttribute("player");
	    			let c = el.getAttribute("season");

	    			if(a==b){ targetContainers.push(el) }
	    		})
	    	buildCharts(a,targetContainers,dataEl)
    	})

		var tooltip = d3_select(".gv-scorer-wrapper")
		    .append("div")
		    .style("position", "absolute")
		    .style("z-index", "10")
		    .style("visibility", "hidden")
		    .text("a simple tooltip");

    }


    function buildCharts(player,containers,data){
    	let a = data.seasonsPlayed;

    	a.forEach(function(season){  
    		containers.forEach(function(el){
	    		if(el.getAttribute("player")==player && el.getAttribute("season")==season){
	    			addChart(el,data,season)
	    		}
	    	})
    	})
    }


    function addChart(el,data,season){

    	let matchData = [];

    	console.log(data)

    	data.matches.forEach(function(match){
    		if(match.season==season){
    			matchData.push(match)
    		}
    	})

    	var margin = {top: 20, right: 20, bottom: 30, left: 30},
		    width = 140,
		    height = 120;

    	var minDate = new Date(season.split("-")[0],7,1);
    	var maxDate = new Date(season.split("-")[1],6,1);

    	var container = d3_select(el);

    	var x = scaleLinear().range([0, width]); 
    	var y = scaleTime().range([height, 0]);  
		x.domain([0, 10]); 
    	y.domain([minDate, maxDate]);

    	var matchline = d3_line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.close); });
		
    	var svg = container.append("svg")
		    .attr("width", width)
		    .attr("height", height);

		  //Add the Y Axis
		  svg.append("g")
		  	.append("line")
            .attr("x1", (width/2)-0.5)
            .attr("y1", 0)
            .attr("x2",  (width/2)-0.5)
            .attr("y2", height);

          svg.append("text")
              .attr("x", 0)
              .attr("y", 10)
              .text( function () { return season })
              .attr("class", "season-label");  

        matchData.forEach(function(match){
        	match.date = new Date(match.Date);

        	let yPos = y(match.date)

        	let goalW = 10;
        	
        	let matchG = svg.append("g")
			  	.append("line")
			  	.attr("class","matchline")
	            .attr("x1", 0)
	            .attr("y1", yPos)
	            .attr("x2",  width)
	            .attr("y2", yPos);

			// addGoals
	        for(var i = 0; i < match.AwayGoals.length; i++){
	        	var newX = Math.ceil(width/2);
	        	var rectangle = svg.append("g")
	        		.append("rect")
	        		.attr("scorer", match.AwayGoals[i].scorerRef)
	        		.attr("team", match.printAwayTeam)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("x", ((width/2)+2) + (i*11))
                    .attr("y", yPos - 5)
                    .attr("class",getClass(match.printAwayTeam,match.AwayGoals[i].scorerRef, data.scorerRef))
	        }  

	        // addGoals
	        for(var i = 0; i < match.HomeGoals.length; i++){
	        	var rectangle = svg.append("g")
	        		.append("rect")  
	        		.attr("scorer", match.HomeGoals[i].scorerRef)
	        		.attr("team", match.printHomeTeam)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("x", ((width/2)-2) - (i*11) - 11)
                    .attr("y", yPos - 5)
                    .attr("class",getClass(match.printHomeTeam,match.HomeGoals[i].scorerRef, data.scorerRef))
                    .on("mouseover", function(){return tooltip.style("visibility", "visible");})
					//.on("mousemove", function(){return tooltip.style("top", (d3_pageY-10)+"px").style("left",(d3_pageX+10)+"px");})
					.on("mouseout", function(){return tooltip.style("visibility", "hidden");});
                    
	        }         

        })

    }

    function getClass(r,s, t){
    	let c = "neutral-team";
    	if(r == "Tottenham" && s==t){ c = "Tottenham" } 
    	if(r == "Arsenal" && s==t){ c = "Arsenal" }
    	return c;
    }

 	window.addEventListener('resize', function(){
 		resizeChart()
 	});

	var resizeChart = debounce(function() {
		//drawVisual();
	}, 250);


}




