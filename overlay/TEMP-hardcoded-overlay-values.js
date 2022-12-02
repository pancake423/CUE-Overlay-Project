/*
	TEMPORARY FILE. I don't have time to build the overlay controller right now, so for now you can modify the values in here and then refresh the overlay to update.

	Note: if you have to reset the overlay for ANY REASON during a series, you need to manually set the series score. It will get automatically updated from that point,
	but it will reset to 0-0.
	remember to save your changes to this file before refreshing the overlay on StreamLabs.
	*/

HARDCODED_OVERLAY_VALUES = {
	//===========================================================================================================================
	//you can modify these values safely (only change the right-hand side)
	team_1_name: "Concord University",
	team_2_name: "Sacred Heart University",
	series_length: 7,
	//if the overlay automatic update feature breaks or the overlay gets reset somehow, you can set the starting team scores here.
	team_1_starting_series_score: 0,
	team_2_starting_series_score: 0,
	match_description: "ECAC Division A Playoffs | Round 2",
	//ok don't touch anything else :)
	//===========================================================================================================================
}





function UPDATE_OVERLAY() {
	INFO.series_length = HARDCODED_OVERLAY_VALUES.series_length;
	INFO.team_1_starting_series_score = HARDCODED_OVERLAY_VALUES.t1_games_won;
	INFO.team_2_starting_series_score = HARDCODED_OVERLAY_VALUES.t2_games_won;
	INFO.match_desc.innerHTML = HARDCODED_OVERLAY_VALUES.match_description;
	TEAM_1.name.innerHTML = HARDCODED_OVERLAY_VALUES.team_1_name;
	TEAM_2.name.innerHTML = HARDCODED_OVERLAY_VALUES.team_2_name;
}
