import debounce from '../lib/debounce'

import {
    line as d3_line
    //curveBasis as d3_curveBasis
} from 'd3-shape';

import {
    select as d3_select,
    selectAll as d3_selectAll
} from 'd3-selection';

import { transition } from 'd3-transition';

import {
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

var parseTime = d3_timeParse("%d-%b-%y"); //("%Y-%m-%d"); //;

let dataset, localData;

let svgshell, svg, lines;


export default function() {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            dataset = JSON.parse(xhr.responseText);

            var spurs = [];
            var arsenal = [];

           for (var i = 0; i < dataset.attendances.length; i++) {
                dataset.attendances[i].d3Date = parseTime(new Date(dataset.attendances[i].date));
                //dataset.attendances[i].homeTeam == "Arsenal" ? arsenal.push(dataset.attendances[i]) : spurs.push(dataset.attendances[i]) ;



            }

            localData = dataset.attendances
            console.log(localData)

            buildVisual(localData);
        }
    }

    xhr.open('GET', '<%= path %>/assets/data/matches.json', true);
    xhr.send(null);


    function buildVisual(data) {    
    	var margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = 960 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		// parse the date / time
		//var parseTime = d3_timeParse("%d-%b-%y");

		// set the ranges
		var x = scaleTime().range([0, width]);
		var y = scaleLinear().range([height, 0]);

		// define the line
		var valueline = d3_line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.close); });

		// append the svg obgect to the body of the page
		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		var svg = d3_select(".attendance-chart").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		// Get the data

		  // format the data
		  data.forEach(function(d) {
		      d.date = d.d3Date;
		      d.close = +d.attendanceNum;
		  });

		  // Scale the range of the data
		  x.domain(d3_extent(data, function(d) { return d.d3Date; }));
		  y.domain([0, d3_max(data, function(d) { return d.close; })]);

		  // Add the valueline path.

		  

		  svg.append("path")
		      .data([data])
		      .attr("class", "line")
		      //.attr("d", valueline);
			
		let lineTypes = ['a', 't'];

		  lineTypes.forEach(function(l){
    		let typeGroup = svg.append("g")

    		typeGroup.append('path')
    			.attr("class", d => `riskLine riskLineBase ${l}`)
    			.attr("id", l)

    		typeGroup.append('path')
    			.attr("class", d => `riskLine riskLineUser ${l}`)
    			.attr("id", l)
    			
    		});
    		


		  // Add the X Axis
		  svg.append("g")
		      .attr("transform", "translate(0," + height + ")")
		      .call(d3_axisBottom(x));

		  // Add the Y Axis
		  svg.append("g")
		      .call(d3_axisLeft(y));

		
		drawVisual(data);	

    }

 	window.addEventListener('resize', function(){
 		resizeChart()
 	});

	var resizeChart = debounce(function() {
		//drawVisual();
	}, 250);




function drawVisual(data){
d3_selectAll('.riskLine')
			.attr('d', function(data){
				let type = d3_select(this).attr('id');

				let valueline = d3_line()
					//.curve(d3_curveBasis)
				    .x(function(d) { return xscale(d.d3Date); })
				    .y(function(d) { return yscale(d.attendanceNum); })


				return valueline(riskCurveData);
			})	
}




	function customXAxis(g) {
	  g.call(xaxis).tickValues(d3_range(0, 80000, 10000));
	  //g.select(".domain").remove();
	}

	function customYAxis() {
	  d3_select(".riskYaxis")
	  .select(".domain")
	  .remove().selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2")
	  .selectAll(".tick text").attr("x", 4).attr("dy", -12);
	}

	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {

	  var l = path.getTotalLength();

	  return function(d, i, a) {
	    return function(t) {
	      var p = path.getPointAtLength(t * l);
	      return "translate(" + p.x + "," + p.y + ")";
	    };
	  };
	}

	function measure(){
		let box = container.node().getBoundingClientRect();
		let WIDTH = box.width;
    	let HEIGHT = box.width * .5;//box.height;

			if(HEIGHT < 300){
				 HEIGHT = 300;
			}

		return {
			WIDTH: WIDTH,
			HEIGHT: HEIGHT
		}
	}

	return {
		init: buildVisual

	}

}