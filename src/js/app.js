//'<%= path %>/assets/data/matches.json'


function init(){

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		    if (xhr.readyState == XMLHttpRequest.DONE) {
		        formatData(JSON.parse(xhr.responseText));
		    }
		}
		xhr.open('GET', '<%= path %>/assets/data/matches.json', true);
		xhr.send(null);


		
}

function formatData(d){
	console.log(d);

	findPips()

}

function findPips(){



		[].slice.apply(document.querySelectorAll('.gv-list-item')).forEach(el => {
        //var data = el.className.replace('share-','');

        let s = el.className.split(" ")[1];

        var pips = el.querySelectorAll('.gv-goal-pip');
        
        highlightPips(s,pips)


    });



		
}

function highlightPips(s,pips){
	console.log(s);

	[].slice.apply(pips).forEach(el => {
        //var data = el.className.replace('share-','');

    

        if(el.classList.contains(s)){
        	el.classList.add("hl-pip")
        }



    });
}


init();