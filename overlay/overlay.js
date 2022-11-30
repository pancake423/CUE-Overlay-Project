//all color/style modification variables are at the top of the CSS file.


//global variables for HTML elements that can be modified while the overlay is running.
//all of these variables (or properties) are bound to their respective HTML element when the program runs.
/*exceptions:   INFO.series_length holds the numerical value of series length.
				INFO.spectating is a boolean for whether or not a player is being spectated.
*/
var TIMER = "";

var TEAM_1 = {
	name: "",
	score: 0,
	series_score: 0,
	boost_meters: 0
}

var TEAM_2 = {
	name: "",
	score: 0,
	series_score: 0,
	boost_meters: 0
}

var INFO = {
	game_desc: "",
	match_desc: "",
	series_length: 3,
	spectating: true
}

var SPEC_PLAYER = {
	name: "",
	goals: 0,
	shots: 0,
	saves: 0,
	assists: 0,
	boost: 0,
	score: 0,
	team: 0,
}


//utility functions
function init() {
	/*
	init() -> undefined

	pairs up all global variables to the correct HTML element.
	*/
	TIMER = document.getElementById("timer");
	TEAM_1.name = document.getElementById("t1name");
	TEAM_2.name = document.getElementById("t2name");
	TEAM_1.score = document.getElementById("t1score");
	TEAM_2.score = document.getElementById("t2score");
	TEAM_1.series_score = document.getElementById("t1-ticker-div");
	TEAM_2.series_score = document.getElementById("t2-ticker-div");
	TEAM_1.boost_meters = document.getElementById("t1-boost-div");
	TEAM_2.boost_meters = document.getElementById("t2-boost-div");


	INFO.game_desc = document.getElementById("current-game-info-div");
	INFO.match_desc = document.getElementById("bottom-bar-content");

	SPEC_PLAYER.name = document.getElementById("spectated-player-name");
	SPEC_PLAYER.score = document.getElementById("spectated-player-score");
	SPEC_PLAYER.goals = document.getElementById("spectated-player-goals");
	SPEC_PLAYER.shots = document.getElementById("spectated-player-shots");
	SPEC_PLAYER.assists = document.getElementById("spectated-player-assists");
	SPEC_PLAYER.saves = document.getElementById("spectated-player-saves");
	SPEC_PLAYER.boost = document.getElementById("boost-amount");
}
function update(updateParameters) {
	/*
	update(obj) -> undefined

	updates the values of any specified overlay elements. the following object property names correspond to overlay elements:
	{
		t1name, //string, name of team 1.
		t2name, //string, name of team 2
		t1score, //string or int, number of goals that team 1 has.
		t2score, //string or int, number of goals that team 2 has.
		t1ss, //int, team 1 series score.
		t2ss, //int, team 2 series score
		t1numplayers, //int, number of players on team 1.
		t2numplayers, //int, number of players on team 2.
		serieslength, //int, maximum length of series in games (ie. best of 7)
		t1boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 1)
		t2boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 2)
		specscore, //int, score of the currently spectated player.
		specgoals, //int, number of goals of the current spectated player.
		specsaves, //int, number of saves of currently spectated player.
		specassists, //int, number of assists of currently spectated player
		specshots, //int, number of shots of currently spectated player.
		specboost, //int, boost amount 0-100 of currently spectated player.
		specshow, //boolean, true if spectated player info should be shown.
	}
	*/
	function check(propertyName) {
		if (updateParameters.propertyName === undefined) {
			return false;
		}
		parameterUpdateFunctions[propertyName]();
	}
	const parameterUpdateFunctions = {
		't1name': function() {TEAM_1.name.innerHTML = updateParameters['t1name']},
		't2name': function() {TEAM_2.name.innerHTML = updateParameters['t1name']}, 
		't1score': function() {TEAM_1.score.innerHTML = updateParameters['t1score']},
		't2score': function() {TEAM_2.score.innerHTML = updateParameters['t2score']}, 
		't1ss', 
		't2ss', 
		't1numplayers',
		't2numplayers',
		'serieslength',
		't1boostamts',
		't2boostamts',
		'specscore',
		'specgoals',
		'specsaves',
		'specassists',
		'specshots',
		'specboost',
		'specshow',
	};
	const parameters = [
		't1name',
		't2name', 
		't1score',
		't2score', 
		't1ss', 
		't2ss', 
		't1numplayers',
		't2numplayers',
		'serieslength',
		't1boostamts',
		't2boostamts',
		'specscore',
		'specgoals',
		'specsaves',
		'specassists',
		'specshots',
		'specboost',
		'specshow',
	];
	for (let i = 0; i < parameters.length; i++) {
		check(parameters[i]);
	}
}

//runs on page load
window.onload = init;