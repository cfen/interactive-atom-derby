//'<%= path %>/assets/data/matches.json'
import attendanceChart from './lib/attendanceChart'


// var parseTime = d3.timeParse("%B %d, %Y");
function init(){
	addView();
	let attendanceChartRender = attendanceChart();
	console.log(attendanceChartRender);	
}

function addView(){
	findPips();
}

function findPips(){
		[].slice.apply(document.querySelectorAll('.gv-list-item')).forEach(el => {
	        let s = el.getAttribute("data-scorer");
	        var pips = el.querySelectorAll('.gv-goal-pip');	        
	        highlightPips(s,pips);
    });

}

function highlightPips(s,pips){
	// console.log(s);

	[].slice.apply(pips).forEach(el => {
        //var data = el.className.replace('share-','');
    	//console.log(s==el.getAttribute("data-scorer"),s,el.getAttribute("data-scorer"));

        if(s == el.getAttribute("data-scorer")){
        	el.getAttribute("data-club") == "Arsenal" ? el.classList.add("arsenal") :  el.classList.add("spurs") 
        }

    });
}


init();