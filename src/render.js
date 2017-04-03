import Mustache from 'mustache'
import rp from 'request-promise'

import teamGamesTemplate from './src/templates/teamGames.html!text'
import teamGoalsTemplate from './src/templates/teamGoals.html!text'
import scorersTemplate from './src/templates/scorers.html!text'

var scorersTotal = [];
var aWins = [];
var tWins = [];
var draws = [];

var aCountGoals = 0;
var tCountGoals = 0;

export async function render() {
    let data = formatData(await rp({
        uri: "https://raw.githubusercontent.com/cfen/merseysideDerby/master/src/assets/data/arseSpurs.json",
        json: true
    }));


    console.log(data)


    let teamGamesHTML = Mustache.render(teamGamesTemplate, data);

    let teamGoalsHTML = Mustache.render(teamGoalsTemplate, data);

    let scorersHTML = Mustache.render(scorersTemplate, {  "data": data.scorerChart });



    return `${teamGamesHTML}${teamGoalsHTML}${scorersHTML}`;



}




function initView(data) {
	var editHtml = Mustache.render(mainTemplate, data);  

    return editHtml;
}

function formatData(data) {

    var allData = {}

    let allMatches = data.matches.map((match) => {
        match.aGoals = getGoals(match['Arsenal goalscorers'], match);
        match.tGoals = getGoals(match['Tottenham goalscorers'], match);

        delete match['Arsenal goalscorers'];
        delete match['Tottenham goalscorers'];

        match.outcome = getOutcome(match);
        match.aGoalsTally = match.aGoals.length;
        match.tGoalsTally = match.tGoals.length;
        aCountGoals += match.aGoals.length;
        tCountGoals += match.tGoals.length;
        match.printResult = getPrintResult(match);
        match.mobilePrintResult = getMobilePrintResult(match);

        if (match.outcome == "aWin") { aWins.push(match) }
        if (match.outcome == "tWin") { tWins.push(match) }
        if (match.outcome == "draw") { draws.push(match) }

        return match;
    });

    scorersTotal.sort(function(a, b) {
        return a.goalTally - b.goalTally
    })

    scorersTotal.reverse();

    allData.aWins = aWins;
    allData.tWins = tWins;
    allData.draws = draws;

    allData.aTotalGoals = aCountGoals;
    allData.tTotalGoals = tCountGoals;

    allData.aWinsTally = aWins.length;
    allData.tWinsTally = tWins.length;
    allData.drawsTally = draws.length;

    allData.matches = allMatches;

    var topScorerChart = getTopScorerChart(scorersTotal);

    allData.scorerChart = topScorerChart;

    return allData;
}


function getOutcome(match) {
    var t = "draw";
    if (match.aGoals.length > match.tGoals.length) { t = "aWin" }
    if (match.tGoals.length > match.aGoals.length) { t = "tWin" }

    return t;
}

function getPrintResult(match) {
    var t;
    if (match.Venue = "Spurs") { t = "Tottenham " + " " + match.tGoals.length + " – " + match.aGoals.length + " Arsenal" }
    if (match.Venue = "Arsenal") { t = "Arsenal " + " " + match.aGoals.length + " – " + match.tGoals.length + " Tottenham" }
    return t;
}

function getMobilePrintResult(match) {
    var t;
    if (match.Venue = "Spurs") { t = "TOT " + " " + match.tGoals.length + " – " + match.aGoals.length + " ARS" }
    if (match.Venue = "Arsenal") { t = "ARS " + " " + match.aGoals.length + " – " + match.tGoals.length + " TOT" }
    return t;
}


function getTopScorerChart(a) {
    var temp = [];

    let minGoals = 4;


    for (var i = 0; i < a.length; i++) {
        a[i].matches.sort(function(a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.Date) - new Date(a.Date);
        });



        if (a[i].goalTally >= minGoals) { temp.push(a[i]) }

    }

    return temp
}

function getGoals(s, m) {
    let a = s.split(",");

    let goals = [];

    if (a.length > 0) {

        for (var i = 0; i < a.length; i++) {

        	if(a[i] != ''){
	        		var goal = {};
		            var str = a[i].replace(/'/g, "");
		            str = str.replace(/\s+/g, ' ').trim();

		            var tempArr = str.split(" ");

		            if (tempArr[0]) { goal.scorer = tempArr[0]; }
		            if (tempArr[1]) { goal.minute = tempArr[1]; }
		            if (tempArr[2]) {
	                if (/pen/i.test(str)) { goal.pen = true } else if (/O.G/i.test(str)) { goal.og = true } }
		            if (!goal.og) { checkGoalTotals(tempArr[0], m) };
	            	goals.push(goal);
	        	}
        	}


            
    }

    return goals;


}


function checkGoalTotals(s, m) {
    let scorerFound = false;
    if (scorersTotal.length == 0) {
        var newObj = {};

        newObj.scorer = s;
        newObj.printScorer = s.split("-").join(" ");
        newObj.goalTally = 1;
        newObj.matches = [];
        newObj.matches.push(m);
        scorersTotal.push(newObj);
        scorerFound = true;
    } else {
        for (var i = 0; i < scorersTotal.length; i++) {
            if (scorersTotal[i].scorer == s) {
                scorersTotal[i].goalTally = scorersTotal[i].goalTally + 1;
                scorersTotal[i].matches.push(m);
                scorerFound = true;
            }
        }
    }

    if (!scorerFound) {
        var newObj = {};
        newObj.scorer = s;
        newObj.goalTally = 1;
        newObj.printScorer = s.split("-").join(" ");
        newObj.matches = [];
        newObj.matches.push(m);
        scorersTotal.push(newObj);
        scorerFound = true;
    }

}