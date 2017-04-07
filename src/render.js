import Mustache from 'mustache'
import fs from 'file-system'
import rp from 'request-promise'

import headSliceTemplate from './src/templates/headSlice.html!text'
import teamGamesTemplate from './src/templates/teamGames.html!text'
import teamGoalsTemplate from './src/templates/teamGoals.html!text'
import scorersTemplate from './src/templates/scorers.html!text'
import { whitespaceFixRemoveSpaceAndAccents } from './js/lib/utils'


var scorersTotal = [];
var aWins = [];
var tWins = [];
var draws = [];

var aCountGoals = 0;
var tCountGoals = 0;
//remote
//"https://raw.githubusercontent.com/cfen/merseysideDerby/master/src/assets/data/arseSpurs.json",

export async function render() {
    let data = formatData(await rp({
        uri: 'https://interactive.guim.co.uk/docsdata-test/1tf32QpWXqQWOvDhN1ycO_cu0mrZzNyGvgmRcQyoQ7ic.json',
        json: true
    }));

    // console.log(data)

    let headSliceHTML = headSliceTemplate;

    let teamGamesHTML = Mustache.render(teamGamesTemplate, data);

    let teamGoalsHTML = Mustache.render(teamGoalsTemplate, data);

    let scorersHTML = Mustache.render(scorersTemplate, {  "data": data.scorerChart });

    fs.writeFileSync("./.build/assets/data/matches.json", JSON.stringify(data));

    return `${headSliceHTML}${teamGamesHTML}${teamGoalsHTML}${scorersHTML}`;
}




function initView(data) {
	var editHtml = Mustache.render(mainTemplate, data);  
    return editHtml;
}

function formatData(data) {

    var allData = {}

    var tempID = 0;

    let allMatches = data.sheets.Sheet1.map((match) => {


        match.aGoals = getGoals(match['Arsenal goalscorers'], match);
        match.tGoals = getGoals(match['Tottenham goalscorers'], match);
        match.ID = tempID;
        tempID ++;
        delete match['Arsenal goalscorers'];
        delete match['Tottenham goalscorers'];

        match.outcome = getOutcome(match);
        match.aGoalsTally = match.aGoals.length;
        match.tGoalsTally = match.tGoals.length;

        aCountGoals += match.aGoals.length;
        tCountGoals += match.tGoals.length;

        match.printResult = getPrintResult(match);
        if (match.Venue == 'Spurs') {   
                match.printHomeTeam = "Tottenham" ; 
                match.printScore = " " + match.tGoals.length + " – " + match.aGoals.length; 
                match.printAwayTeam = "Arsenal"; 
                match.HomeGoals = match.tGoals;  
                match.AwayGoals = match.aGoals;   
                                    }
        else if (match.Venue == 'Arsenal')  {  
            match.printHomeTeam = "Arsenal" ; 
            match.printScore = " " + match.aGoals.length + " – " + match.tGoals.length; 
            match.printAwayTeam = "Tottenham"; 
            match.HomeGoals = match.aGoals;  
            match.AwayGoals = match.tGoals;  
        }


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
    if (match.Venue == 'Spurs') {  t = "Tottenham " + " " + match.tGoals.length + " – " + match.aGoals.length + " Arsenal" }
    else if (match.Venue == 'Arsenal')  {  t = "Arsenal " + " " + match.aGoals.length + " – " + match.tGoals.length + " Tottenham" }

    return  t;
}

function getMobilePrintResult(match) {
    var t;
    if (match.Venue == 'Spurs') { t = "TOT " + " " + match.tGoals.length + " – " + match.aGoals.length + " ARS" }
    else if (match.Venue == 'Arsenal'){ t = "ARS " + " " + match.aGoals.length + " – " + match.tGoals.length + " TOT" }
    return t;
}


function getTopScorerChart(a) {
    var temp = [];

    let minGoals = 5;

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

		            if (tempArr[0]) { goal.scorer = tempArr[0]; goal.scorerRef = whitespaceFixRemoveSpaceAndAccents(tempArr[0])}
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
        newObj.scorerRef = whitespaceFixRemoveSpaceAndAccents(s);
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
        newObj.scorerRef = whitespaceFixRemoveSpaceAndAccents(s);
        newObj.goalTally = 1;
        newObj.printScorer = s.split("-").join(" ");
        newObj.matches = [];
        newObj.matches.push(m);
        scorersTotal.push(newObj);
        scorerFound = true;
    }

}