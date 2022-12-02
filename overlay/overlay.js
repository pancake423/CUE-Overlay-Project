//all color/style modification variables are at the top of the CSS file.


//global variables for HTML elements that can be modified while the overlay is running.
//all of these variables (or properties) are bound to their respective HTML element when the program runs.
/*exceptions:   INFO.series_length holds the numerical value of series length.
				INFO.t1_games_won and INFO.t2_games_won tracks the number of games won by each team.
				INFO.spectating is a boolean for whether or not a player is being spectated.
				INFO.overlay_shown is a boolean for whether or not the main overlay should be showing.
				SPEC_PLAYER.team is an int with 1 representing team 1 and 2 representing team 2.
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
	t1_games_won: 0,
	t2_games_won: 0,
	spectating: true,
	overlay_shown: false,
}

var SPEC_PLAYER = {
	name: "",
	goals: 0,
	shots: 0,
	saves: 0,
	assists: 0,
	boost: 0,
	score: 0,
	team: 1,
}
var boostCanvas;
var TEAM_1_COLOR;
var TEAM_2_COLOR;

var socket;


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
	TEAM_1.series_score = document.getElementById("t1-ticker-canvas").getContext("2d");
	TEAM_2.series_score = document.getElementById("t2-ticker-canvas").getContext("2d");
	TEAM_1.series_score.lineCap = "round";
	TEAM_2.series_score.lineCap = "round";
	TEAM_1.boost_meters = document.getElementById("t1-boost-div");
	TEAM_2.boost_meters = document.getElementById("t2-boost-div");


	INFO.game_desc = document.getElementById("current-game-info");
	INFO.match_desc = document.getElementById("bottom-bar-content");

	SPEC_PLAYER.name = document.getElementById("spectated-player-name");
	SPEC_PLAYER.score = document.getElementById("spectated-player-score");
	SPEC_PLAYER.goals = document.getElementById("spectated-player-goals");
	SPEC_PLAYER.shots = document.getElementById("spectated-player-shots");
	SPEC_PLAYER.assists = document.getElementById("spectated-player-assists");
	SPEC_PLAYER.saves = document.getElementById("spectated-player-saves");
	SPEC_PLAYER.boost = document.getElementById("boost-amount");

	boostCanvas = document.getElementById('boost-amount-display').getContext("2d");
	boostCanvas.canvas.width = 200;
	boostCanvas.canvas.height = 200;
	boostCanvas.lineCap = "round";
	boostCanvas.lineJoin = "round";
	TEAM_1_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--t1-color');
	TEAM_2_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--t2-color');

	UPDATE_OVERLAY();
	initWebSocket();
}
function update(updateParameters) {
	/*
	update(obj) -> undefined

	updates the values of any specified overlay elements. the following object property names correspond to overlay elements:
	{
		timer, //string, current clock time.
		t1name, //string, name of team 1.
		t2name, //string, name of team 2
		t1score, //string or int, number of goals that team 1 has.
		t2score, //string or int, number of goals that team 2 has.
		t1ss, //int, team 1 series score.
		t2ss, //int, team 2 series score
		numplayers, //int, number of players on each team.
		serieslength, //int, maximum length of series in games (ie. best of 7)
		t1boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 1)
		t2boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 2)
		t1names, //list of strings. each entry corresponds to one player's name on team 1.
		t2names, //list of strings. each entry corresponds to one player's name on team 2.
		specscore, //int, score of the currently spectated player.
		specgoals, //int, number of goals of the current spectated player.
		specsaves, //int, number of saves of currently spectated player.
		specassists, //int, number of assists of currently spectated player
		specshots, //int, number of shots of currently spectated player.
		specboost, //int, boost amount 0-100 of currently spectated player.
		specshow, //boolean, true if spectated player info should be shown.
		specteam, //int, 1 for team 1 (orange) and 2 for team 2 (blue)
		specname //string, name of spectated player.
		gamestarted //boolean, always true, event fired when a game starts.
	}
	*/
	function check(propertyName) {
		if (updateParameters[propertyName] === undefined) {
			return false;
		}
		parameterUpdateFunctions[propertyName]();
	}
	const parameterUpdateFunctions = {
		'timer': function() {TIMER.innerHTML = updateParameters['timer']},
		't1name': function() {TEAM_1.name.innerHTML = updateParameters['t1name']},
		't2name': function() {TEAM_2.name.innerHTML = updateParameters['t1name']}, 
		't1score': function() {TEAM_1.score.innerHTML = updateParameters['t1score']},
		't2score': function() {TEAM_2.score.innerHTML = updateParameters['t2score']}, 
		't1ss': function() {drawTeam1Tickers(parseInt(updateParameters["t1ss"]), INFO.series_length)},
		't2ss': function() {drawTeam2Tickers(parseInt(updateParameters["t2ss"]), INFO.series_length)},
		'numplayers': function() {setNumPlayers(parseInt(updateParameters['numplayers']))},
		'serieslength': function() {INFO.series_length = updateParameters['serieslength']}, 
		't1boostamts': function() {
			for(let i = 0; i < updateParameters["t1boostamts"].length; i++) {
				drawCardBoostMeter(document.getElementsByClassName("card-canvas")[i].getContext('2d'), updateParameters["t1boostamts"][i], 1);
			}
		},
		't2boostamts': function() {
			for(let i = updateParameters["t2boostamts"].length; i < updateParameters["t2boostamts"].length * 2; i++) {
				drawCardBoostMeter(document.getElementsByClassName("card-canvas")[i].getContext('2d'), updateParameters["t2boostamts"][i - updateParameters["t2boostamts"].length], 2);
			}
		},
		't1names': function() {
			for(let i = 0; i < updateParameters["t1names"].length; i++) {
				document.getElementsByClassName("card-name")[i].innerHTML = updateParameters["t1names"][i];
			}
		},
		't2names': function() {
			for(let i = 0; i < updateParameters["t2names"].length; i++) {
				document.getElementsByClassName("card-name")[i + updateParameters["t2names"].length].innerHTML = updateParameters["t2names"][i];
			}
		},
		'specscore': function() {SPEC_PLAYER.score.innerHTML = updateParameters['specscore']}, 
		'specgoals': function() {SPEC_PLAYER.goals.innerHTML = updateParameters['specgoals']},
		'specsaves': function() {SPEC_PLAYER.saves.innerHTML = updateParameters['specsaves']},
		'specassists': function() {SPEC_PLAYER.assists.innerHTML = updateParameters['specassists']},
		'specshots': function() {SPEC_PLAYER.shots.innerHTML = updateParameters['specshots']},
		'specboost': function() {
			SPEC_PLAYER.boost.innerHTML = updateParameters['specboost'];
			drawBoostMeter(parseInt(updateParameters['specboost']),SPEC_PLAYER.team);
		},
		'specshow': function() {INFO.spectating = updateParameters['specshow']},
		'specteam': function() {SPEC_PLAYER.team = updateParameters['specteam']},
		'specname': function() {SPEC_PLAYER.name.innerHTML = updateParameters['specname']},
		'gamestarted': function() {INFO.games_played++; INFO.game_desc.innerHTML = "Game " + (INFO.t1_games_won + INFO.t2_games_won + 1) + " | Best of " + INFO.series_length;}
	};
	const parameters = [
		'timer',
		't1name',
		't2name', 
		't1score',
		't2score', 
		't1ss', 
		't2ss',
		'numplayers',
		't1names',
		't2names', 
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
		'specteam',
		'specname',
		'gamestarted'
	];
	for (let i = 0; i < parameters.length; i++) {
		check(parameters[i]);
	}
}

function drawBoostMeter(amt, team) {
	/*
	drawBoostMeter(int amt, int team) -> undefined

	renders the boost meter based on the amount of boost 0-100 (amt), setting the color based on the team.
	*/
	if(team === 1) {
		boostCanvas.strokeStyle = TEAM_1_COLOR;
	} else {
		boostCanvas.strokeStyle = TEAM_2_COLOR;
	}
	boostCanvas.beginPath();
	boostCanvas.clearRect(0, 0, 200, 200);
	boostCanvas.lineWidth = 10;
	boostCanvas.arc(100, 100, 90, -Math.PI / 2, Math.PI * (amt / 50 - 0.5));
	boostCanvas.stroke();
}

function setNumPlayers(n) {
	/*
	setNumPlayers(int n,) -> undefined

	sets the number of player name/boost card child elements for each team.
	*/

	//remove all existing nodes
	while (TEAM_1.boost_meters.firstChild) {
        TEAM_1.boost_meters.removeChild(TEAM_1.boost_meters.firstChild);
        TEAM_2.boost_meters.removeChild(TEAM_2.boost_meters.firstChild);
    }
    //add new nodes
    for (let i = 0; i < n; i++) {
    	var card = document.createElement("div");
    	card.className = "player-card";
    	card.style.height = (100/(n+1)) + "%";
    	var name = document.createElement("p");
    	name.className = "card-name";
    	name.innerHTML = "name"
    	var boostMeter = document.createElement("canvas")
    	boostMeter.className = "card-canvas";

    	card.appendChild(name);
    	card.appendChild(boostMeter);
    	var card2 = card.cloneNode(true);
    	TEAM_1.boost_meters.appendChild(card);
    	TEAM_2.boost_meters.appendChild(card2);
    }
}
function drawCardBoostMeter(ctx, amt, team) {
	/*
	drawCardBoostMeter(CanvasRenderingContext2d ctx, int amt, int team) -> undefined

	draws a card-style boost meter for the specified canvas, boost amount, and team (1 or 2).
	*/
	const cw = ctx.canvas.width = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('width'));
	const ch = ctx.canvas.height = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('height'));
	ctx.lineCap = "round";
	ctx.strokeStyle = "#101010";
	ctx.clearRect(0, 0, cw, ch);
	ctx.beginPath();
	ctx.lineWidth = ch/2;
	ctx.moveTo(ch/2, ch/2);
	ctx.lineTo(cw - ch/2, ch/2);
	ctx.stroke();
	if(team === 1) {
		ctx.strokeStyle = TEAM_1_COLOR;
	} else {
		ctx.strokeStyle = TEAM_2_COLOR;
	}
	ctx.beginPath();
	ctx.lineWidth = ch/2;
	ctx.moveTo(ch/2, ch/2);
	ctx.lineTo((cw - ch) * amt/100 + ch/2, ch/2);
	ctx.stroke();
}

function drawTeam1Tickers(ts, ss) {
	const length = Math.ceil(ss / 2);
	var ctx = TEAM_1.series_score;
	const cw = ctx.canvas.width = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('width'));
	const ch = ctx.canvas.height = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('height'));
	ctx.lineWidth = ch / 2
	ctx.lineCap = "round";

	for(let i = 0; i < length; i++) {
		ctx.beginPath();
		if (i >= length - ts) {
			ctx.strokeStyle = TEAM_1_COLOR;
		} else {
			ctx.strokeStyle = "#101010";
		}
		ctx.moveTo(cw / length * (i + 0.25), ch / 2);
		ctx.lineTo(cw / length * (i + 0.75), ch / 2);
		ctx.stroke();
	}
}
function drawTeam2Tickers(ts, ss) {
	const length = Math.ceil(ss / 2);
	var ctx = TEAM_2.series_score;
	const cw = ctx.canvas.width = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('width'));
	const ch = ctx.canvas.height = parseFloat(getComputedStyle(ctx.canvas).getPropertyValue('height'));
	ctx.lineWidth = ch / 2
	ctx.lineCap = "round";

	for(let i = 0; i < length; i++) {
		ctx.beginPath();
		if (i < ts) {
			ctx.strokeStyle = TEAM_2_COLOR;
		} else {
			ctx.strokeStyle = "#101010";
		}
		ctx.moveTo(cw / length * (i + 0.25), ch / 2);
		ctx.lineTo(cw / length * (i + 0.75), ch / 2);
		ctx.stroke();
	}
}
/*
		timer, //string, current clock time.
		t1name, //string, name of team 1.
		t2name, //string, name of team 2
		t1score, //string or int, number of goals that team 1 has.
		t2score, //string or int, number of goals that team 2 has.
		t1ss, //int, team 1 series score.
		t2ss, //int, team 2 series score
		numplayers, //int, number of players on each team.
		serieslength, //int, maximum length of series in games (ie. best of 7)
		t1boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 1)
		t2boostamts, //list of ints 0-100. each entry corresponds to one player's current boost amount. (for team 2)
		t1names, //list of strings. each entry corresponds to one player's name on team 1.
		t2names, //list of strings. each entry corresponds to one player's name on team 2.
		specscore, //int, score of the currently spectated player.
		specgoals, //int, number of goals of the current spectated player.
		specsaves, //int, number of saves of currently spectated player.
		specassists, //int, number of assists of currently spectated player
		specshots, //int, number of shots of currently spectated player.
		specboost, //int, boost amount 0-100 of currently spectated player.
		specshow, //boolean, true if spectated player info should be shown.
		specteam, //int, 1 for team 1 (orange) and 2 for team 2 (blue)
		gamestarted //boolean, always true, event fired when a game starts.*/
function initWebSocket() {
	socket = new WebSocket("ws://localhost:49122");
	socket.onmessage = function(e) {
		const msg = JSON.parse(e.data);
		switch (msg.event) {
		case "game:update_state":
			if(msg.data.game.hasTarget) {
				const targetedPlayer = msg.data.players[msg.data.game.target];
				update({
					specscore: targetedPlayer.score,
					specgoals: targetedPlayer.goals,
					specshots: targetedPlayer.shots,
					specassists: targetedPlayer.assists,
					specsaves: targetedPlayer.saves,
					specboost: targetedPlayer.boost,
					specteam: targetedPlayer.team + 1,
					specname: targetedPlayer.name
				});
			}
			var t1playernames = [];
			var t2playernames = [];
			var t1playerboosts = [];
			var t2playerboosts = [];
			var numplayers = 0;
			for (const [pid, data] of Object.entries(msg.data.players)) {
  				if (data.team === 0) {
  					t1playernames.push(data.name);
  					t1playerboosts.push(data.boost);
  				} else {
  					t2playernames.push(data.name);
  					t2playerboosts.push(data.boost);
  				}
  				numplayers++;
			}
			update({
				timer: (msg.data.game.isOT ? "+": "") + Math.floor(msg.data.game.time_seconds / 60) + ":" + (msg.data.game.time_seconds % 60 < 10 ? ("0" + msg.data.game.time_seconds % 60) : msg.data.game.time_seconds % 60),
				specshow: msg.data.game.hasTarget,
				t1score: msg.data.game.teams[0].score,
				t2score: msg.data.game.teams[1].score,
				t1names: t1playernames,
				t2names: t2playernames,
				t1boostamts: t1playerboosts,
				t2boostamts: t2playerboosts,
				numplayers: numplayers / 2
			});
			break;
		case "game:match_ended":
			if(msg.data.winner_team_num === 0) {
				//team 1 wins
				INFO.t1_games_won++;
			} else {
				//team 2 wins
				INFO.t2_games_won++;
			}
			update ({
				t1ss: INFO.t1_games_won,
				t2ss: INFO.t2_games_won,

			});
			break;
		case "game:round_started_go":
			update({
				gamestarted: true, 
				t1ss: INFO.t1_games_won,
				t2ss: INFO.t2_games_won,
			});
			INFO.overlay_shown = true;
			break;
		}
	}
}


//runs on page load
window.onload = init;