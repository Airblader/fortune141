/*
 *	INDEX PAGE
 */

$(document).bind("mobileinit", function () {
    $.mobile.defaultPageTransition   = "none";
    $.mobile.defaultDialogTransition = "none";

    app = new FortuneApp();
    app.dbFortune = new dbFortune();
    app.dbFortune.open(function () {
	$('#pageIndexHead').hide();
        $('#pageIndexBody').hide();
        $('#pageIndexFirstRunMainUser').show();
    }, function() {
	app.updateMainUser();    
    });
});

$(document).on('pageshow', '#pageIndex', function () {
    $('#pageIndexFirstRunMainUser').hide();
});


$(document).off('click', '#firstRunMainUser_Submit').on('click', '#firstRunMainUser_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#firstRunMainUser_Name').val(),
	nickname        = $('#firstRunMainUser_Nickname').val(),
	image           = '',
	isFavorite      = true,
	displayNickname = ($('#firstRunMainUser_DisplayNickname').val() == "true") ? true : false;
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	return false;
    }
    
    // submit button was pressed, so let's create the tables, the main user and get started!
    app.dbFortune.createAllTables(function () {
        app.Players.main = new Player();
        app.Players.main.create(name.name, nickname.name, image, isFavorite, displayNickname, true, function () {
	    app.updateMainUser();
	    $('#pageIndexHead').show();
	    $('#pageIndexBody').show();
	    $('#pageIndexFirstRunMainUser').hide();
	});
	
	// Fill with default game profiles
	var query = new dbFortuneQuery();
	query.add('INSERT INTO '
		    + app.dbFortune.tables.Game141Profile.name + ' '
		    + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141Profile)
		    + ' VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		  ['Default', 60, 0, 0, 0, 1, 1, 0, 0]
	);
	
	query.execute();
    });
    
    // kill this button to prevent any double-firing (we dont need it anymore anyway)
    $(document).off('click', '#firstRunMainUser_Submit');
    return true;
});

/*
 *	RESUME GAME
 */

$(document).on('pageshow', '#pageResumeGame', function () {
    // empty list
    $('#resumeGameList').html('');
    
    function output141 (rows, idx) {
	var row = rows.item(idx);
	
	var date  = new Date(1000 * parseInt(row['Timestamp'])),
	    year  = date.getFullYear(),
	    month = date.getMonth(),
	    day   = date.getDate();
	    
	app.Players.tmp = new Player();
	
	app.Players.tmp.load(parseInt(row['Player1']), function () {
	    var name1 = app.Players.tmp.getDisplayName();
	    
	    app.Players.tmp.load(parseInt(row['Player2']), function () {
		var name2 = app.Players.tmp.getDisplayName();
		
		var html  = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'141\').data(\'gID\', ' + row['gID'] + ').popup(\'open\');">';
			
		html += '<p><strong>' + name1 + ' vs. ' + name2 + '</strong></p>';
		html += '<p>Score: ' + row['PointsPlayer1'] + ' &ndash; ' + row['PointsPlayer2'] + '</p>';
		html += '<p>Straight Pool to ' + row['ScoreGoal'] + '</p>';
		html += '<p class="ui-li-aside">' + (month+'/'+day+'/'+year) + '</p>';
		    
		html += '</a></li>';
			
		$('#resumeGameList').append(html).listview('refresh');
		if (idx < rows.length-1) {
		    output141(rows, idx+1);
		}
	    });
	});
    }
    
    
    app.dbFortune.query('SELECT '
			+ 'gID, Timestamp, Player1, Player2, PointsPlayer1, PointsPlayer2, ScoreGoal FROM '
			+ app.dbFortune.tables.Game141.name
			+ ' WHERE isFinished="0" ORDER BY Timestamp DESC',
			[],
	function (tx, result) {
	    var rows = result.rows;
	    if (rows.length == 0) {
		return false;
	    }

	    output141(rows, 0);	    
	    return true;
	}
    );
});

$(document).off('click', '#resumeGameResumeButton')
           .on ('click', '#resumeGameResumeButton', function (event) {
    event.preventDefault();
    
    var redirect;
    switch ($('#resumeGamePopup').data('gType')) {
	case '141':
	    redirect = 'game141/game141.html';
	    break;
	default:
	    return false;
    }
    
    $.mobile.changePage(redirect, {
	data : {
	    gID : parseInt( $('#resumeGamePopup').data('gID') ),
	}	
    });
    
    return true;
});
	   
$(document).off('click', '#resumeGameDeleteButton')
	   .on ('click', '#resumeGameDeleteButton', function (event) {
    event.preventDefault();
    
    var table;
    switch ($('#resumeGamePopup').data('gType')) {
	case '141':
	    table = app.dbFortune.tables.Game141;
	    break;
	default:
	    return false;
    }
    
    var gID = parseInt( $('#resumeGamePopup').data('gID') );

    app.vibrate(300);
    app.confirmDlg(
	'Are you sure that you want to delete this game?',
	function () {
	    app.dbFortune.query(
		'DELETE FROM ' + table.name + ' WHERE gID="' + gID + '"',
		[],
		app.dummyFalse,
		app.dummyFalse
	    );
	    
	    $('#resumeGamePopup').popup('close');
	    $('#pageResumeGame') .trigger('pageshow');
	},
	function () {
	    $('#resumeGamePopup').popup('close');
	    $('#pageResumeGame') .trigger('pageshow');
	},
	'Delete Game',
	'Delete, Cancel'
    );
    
    return true;
});


/*
 *	GAME STRAIGHT POOL
 */

function game141SetPlayer (idx, pID) {
    app.Players.ingame[idx] = new Player();
    app.Players.ingame[idx].load(pID, function () {
	var dispName = app.Players.ingame[idx].getDisplayName(),
	    image    = (app.Players.ingame[idx].image.length > 0) ? app.Players.ingame[idx].image : ('../../' + app.imgPlayerPath + 'playerDummy.jpg');
	$('#game141SetupPlayer' + idx + 'Name').html(dispName)
                                               .data('pid', app.Players.ingame[idx].pID);
	$('#game141SetupPlayer' + idx + 'Img') .attr('src', image);
	
	$('#game141SetupSubmitButton').button('disable');
	if (($('#game141SetupPlayer0Name').data('pid') != '-1' && $('#game141SetupPlayer1Name').data('pid') != '-1') &&
	    (app.Players.ingame[1-idx].pID != pID)) {
	    $('#game141SetupSubmitButton').button('enable'); 
	}
    });
}

$(document).on('pageshow', '#pageGame141Setup', function () {
    $('#game141Setup2')           .hide();
    $('#game141SetupSubmitButton').button('disable');
    
    // set locally saved score goal if available
    var scoreGoal = window.localStorage.getItem('game141_ScoreGoal') || 60;
    $('#game141SetupScoreGoal').val(scoreGoal).slider('refresh');
    
    
    // Set up the main player per default
    game141SetPlayer(0, app.Players.main.pID);
    
    // create profile list
    app.dbFortune.query('SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' ORDER BY Usage DESC', [],
	function (tx, results) {
	    if (results.rows.length == 0) {
		$('#game141SetupLoadProfileSelect').append(
		    '<option value="-1">None</option>'
		).trigger('change');
		
		return false;
	    }
	    
	    for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		
		$('#game141SetupLoadProfileSelect').append(
		    '<option value="' + row['ID'] + '">' + row['Name'] + '</option>'
		).trigger('change');
	    }
	    
	    return true;
	}
    );
    
    // create player list
    var html  = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search Players..." data-dividertheme="a">';
	html += '<li data-role="list-divider">Favorites</li>';
    app.dbFortune.query('SELECT pID, Name, Nickname, Image, displayNickname FROM ' + app.dbFortune.tables.Player.name +
			' WHERE isFavorite = "true" ORDER BY CASE pID WHEN "1" THEN pID END DESC, LOWER(Name)',
			[],
    function (tx, results) {
	for (var i = 0; i < results.rows.length; i++) {
	    var row      = results.rows.item(i),
		filter   = row['Name'] + ' ' + row['Nickname'],
		dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		image    = (row['Image'] !== '') ? '<img src="' + row['Image'] + '" />' : '';
	    
	    html += '<li data-filtertext="' + filter + '">'
	         +  '<a href="#" onClick="javascript:game141SetPlayer($(\'#game141Setup2\').data(\'player\'), ' + row['pID'] + '); '
		 +  '$(\'#game141Setup2\').hide(); $(\'#game141Setup1\').show();">' + image
	         +  dispName + '</a></li>';
	}
	
	html += '<li data-role="list-divider">All</li>';
	app.dbFortune.query('SELECT pID, Name, Nickname, displayNickname FROM ' + app.dbFortune.tables.Player.name + ' ORDER BY LOWER(Name)',
			    [],
	function (tx, results) {
	    for (var i = 0; i < results.rows.length; i++) {
		var row      = results.rows.item(i),
		    dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		    filter   = row['Name'] + ' ' + row['Nickname'];
		
		html += '<li data-filtertext="' + filter + '">'
		     +  '<a href="#" onClick="javascript:game141SetPlayer($(\'#game141Setup2\').data(\'player\'), ' + row['pID'] + '); '
		     +  '$(\'#game141Setup2\').hide(); $(\'#game141Setup1\').show();">'
		     +  dispName + '</a></li>';
	    }
	   
	    html += '</ul>';
	    $('#game141Setup2').html(html).trigger('create');
	});
    });
});

$(document).off('click', '#game141SetupLoadProfileButton')
	   .on ('click', '#game141SetupLoadProfileButton', function (event) {
    event.preventDefault();
    
    var profileID = parseInt( $('#game141SetupLoadProfileSelect').val() );
    app.dbFortune.query(
	'SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' WHERE ID="' + profileID + '" LIMIT 1', [],
	function (tx, result) {
	    if (result.rows.length == 0) {
		return false;
	    }
	    
	    var row = result.rows.item(0);
	    $('#game141SetupScoreGoal')      .val(row['ScoreGoal']           ).slider('refresh');
	    $('#game141SetupMaxInnings')     .val(row['MaxInnings']          ).slider('refresh');
	    $('#game141SetupIsTrainingsGame').val(row['isTrainingsGame']     ).slider('refresh');
	    $('#game141SetupHandicap1')      .val(row['HandicapPlayer1']     ).slider('refresh');
	    $('#game141SetupHandicap2')      .val(row['HandicapPlayer2']     ).slider('refresh');
	    $('#game141SetupMultiplicator1') .val(row['MultiplicatorPlayer1']).slider('refresh');
	    $('#game141SetupMultiplicator2') .val(row['MultiplicatorPlayer2']).slider('refresh');
	    
	    // increase usage counter
	    app.dbFortune.query(
		'UPDATE ' + app.dbFortune.tables.Game141Profile.name + ' SET Usage="' + (parseInt(row['Usage'])+1) + '" WHERE ID="' + profileID + '"'
	    );
	    
	    return true;
	}
    );
});

$(document).off('click', '#game141SetupSubmitButton')
	   .on ('click', '#game141SetupSubmitButton', function (event) {
    event.preventDefault();
    
    // save score goal locally
    window.localStorage.setItem('game141_ScoreGoal', $('#game141SetupScoreGoal').val());
    
    $.mobile.changePage('game141.html', {
	data : {
	    player0         : $('#game141SetupPlayer0Name')    .data('pid'),
	    player1         : $('#game141SetupPlayer1Name')    .data('pid'),
	    scoreGoal       : $('#game141SetupScoreGoal')      .val()      ,
	    maxInnings      : $('#game141SetupMaxInnings')     .val()      ,
	    isTrainingsGame : $('#game141SetupIsTrainingsGame').val()      ,
	    handicap0	    : $('#game141SetupHandicap1')      .val()      ,
	    handicap1       : $('#game141SetupHandicap2')      .val()      ,
	    multiplicator0  : $('#game141SetupMultiplicator1') .val()      ,
	    multiplicator1  : $('#game141SetupMultiplicator2') .val()      ,
	}	
    });
});

$(document).off('click', '#game141SetupPlayerGrid div')
	   .on ('click', '#game141SetupPlayerGrid div', function (event) {
    event.preventDefault();
    
    var element_id = $(this).attr('id'),
	idx	   = element_id.substr(element_id.length-1, 1);
	
    $('#game141Setup1').hide();
    $('#game141Setup2').data('player', idx)
		       .show();
});

$(document).on('pageshow', '#pageGame141', function () {
    var url = $.url( $.url().attr('fragment') );
    
    var gID  = parseInt(url.param('gID')),
	load = true;
    if (typeof gID === 'undefined' || isNaN(gID)) {
	load = false;
	
	var pID0            = parseInt(url.param('player0'        )),
	    pID1            = parseInt(url.param('player1'        )),
	    scoreGoal       = parseInt(url.param('scoreGoal'      )),
	    maxInnings      = parseInt(url.param('maxInnings'     )),
	    isTrainingsGame = parseInt(url.param('isTrainingsGame')),
	    handicap0       = parseInt(url.param('handicap0'      )),
	    handicap1       = parseInt(url.param('handicap1'      )),
	    multiplicator0  = parseInt(url.param('multiplicator0' )),
	    multiplicator1  = parseInt(url.param('multiplicator1' ));
    }
    
    $.getScript('../../js/game141.js', function() {
	app.currentGame = new StraightPool();
	if (load) {
	    app.currentGame.loadGame(gID,
		function () {
		    setTimeout(app.currentGame.initUI, 500);
		}
	    );
	}
	else {
	    app.currentGame.initNewGame(scoreGoal, maxInnings, isTrainingsGame, [handicap0, handicap1], [multiplicator0, multiplicator1]);
	    app.currentGame.setPlayers(pID0, pID1,
		function () {
		    setTimeout(app.currentGame.initUI, 500);
		}
	    );
	}
    });
});


/*
 *	PLAYER PROFILES PAGE
 */

$(document).on('pageshow', '#pagePlayersList', function () {
    $('#pagePlayersListNewPlayerHead').hide();
    $('#pagePlayersListNewPlayer')    .hide();
    
    // Create List
    var html  = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search Players..." data-dividertheme="a">';
	html += '<li data-role="list-divider">Favorites</li>';
    app.dbFortune.query('SELECT pID, Name, Nickname, Image, displayNickname FROM ' + app.dbFortune.tables.Player.name +
			' WHERE isFavorite = "true" ORDER BY CASE pID WHEN "1" THEN pID END DESC, LOWER(Name)',
			[],
    function (tx, results) {
	for (var i = 0; i < results.rows.length; i++) {
	    var row      = results.rows.item(i),
		filter   = row['Name'] + ' ' + row['Nickname'],
		dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		image    = (row['Image'] !== '') ? '<img src="' + row['Image'] + '" />' : '';
	    
	    html += '<li data-filtertext="' + filter + '"><a href="player_details.html?pID=' + row['pID'] + '">' + image
	         +  dispName + '</a></li>';
	}
	
	html += '<li data-role="list-divider">All</li>';
	app.dbFortune.query('SELECT pID, Name, Nickname, displayNickname FROM ' + app.dbFortune.tables.Player.name + ' ORDER BY LOWER(Name)',
			    [],
	function (tx, results) {
	    for (var i = 0; i < results.rows.length; i++) {
		var row      = results.rows.item(i),
		    dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		    filter   = row['Name'] + ' ' + row['Nickname'];
		
		html += '<li data-filtertext="' + filter + '"><a href="player_details.html?pID=' + row['pID'] + '">'
		     +  dispName + '</a></li>';
	    }
	   
	    html += '</ul>';
	    $('#playerList').html(html).trigger('create');
	});
    });
});

$(document).off('click', '#pagePlayersListNewPlayerLink')
           .on ('click', '#pagePlayersListNewPlayerLink', function (event) {
    event.preventDefault();

    $('#playerListHead').hide();
    $('#playerList')    .hide();
    
    $('#pagePlayersListNewPlayerHead').show();
    $('#pagePlayersListNewPlayer')    .show();
});
	   
$(document).off('click', '#pagePlayersListNewPlayerBackLink')
           .on ('click', '#pagePlayersListNewPlayerBackLink', function (event) {
    event.preventDefault();
    
    $('#playerListHead').show();
    $('#playerList')    .show();
    
    $('#pagePlayersListNewPlayerHead').hide();
    $('#pagePlayersListNewPlayer')    .hide();
    
    // reset form
    $('#addPlayer_Name')           .val('');
    $('#addPlayer_Nickname')       .val('');
    $('#addPlayer_IsFavorite')     .val('false').slider('refresh');
    $('#addPlayer_DisplayNickname').val('false').slider('refresh');
});

$(document).off('click', '#addPlayer_Submit').on('click', '#addPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#addPlayer_Name').val(),
	nickname        = $('#addPlayer_Nickname').val(),
	image           = '',
	isFavorite      = ($('#addPlayer_IsFavorite').val()      == "true") ? true : false,
	displayNickname = ($('#addPlayer_DisplayNickname').val() == "true") ? true : false;
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	app.alertDlg('A name must consist of at least 3 characters.', app.dummyTrue, 'Invalid name', 'OK');
	return false;
    }

    var newPlayer = new Player(app.dbFortune);
    newPlayer.create(name.name, nickname.name, image, isFavorite, displayNickname, false, function () {
        $('#pagePlayersListNewPlayerHead').hide();
	$('#pagePlayersListNewPlayer')    .hide();
	
	$('#playerListHead').show();
	$('#playerList')    .show();
	
	// reset form
	$('#addPlayer_Name')           .val('');
        $('#addPlayer_Nickname')       .val('');
        $('#addPlayer_IsFavorite')     .val('false').slider('refresh');
        $('#addPlayer_DisplayNickname').val('false').slider('refresh');
	
	$('#pagePlayersList').trigger('pageshow');
    });
    return true;
});

$(document).on('pageshow', '#pagePlayerDetails', function () {
    $('#pagePlayerDetailsEditPlayerHead').hide();
    $('#pagePlayerDetailsEditPlayer')    .hide();
    
    // This is a weird glitch-workaround for the url being passed in a rather strange way
    var url = $.url( $.url().attr('fragment') ),
	pID = parseInt(url.param('pID'));
	
    // Hide delete button if it's the main user profile
    $('#playerDetailsDeleteButton').button('enable');
    if (pID == 1) {
	$('#playerDetailsDeleteButton').button('disable');
    }
    
    app.Players.tmp = new Player();
    app.Players.tmp.load(pID, function () {
	if (app.Players.tmp.image !== '') {
	    $('#playerDetails_Image').show()
	                             .attr('src', '../../' + app.imgPlayerPath + app.Players.tmp.image);
	}
	else{
	    $('#playerDetails_Image').hide();
	}
	
	$('#playerDetails_Name')           .html(app.Players.tmp.name                            );
        $('#playerDetails_Nickname')       .html(app.Players.tmp.nickname       	         );
        $('#playerDetails_IsFavorite')     .html((app.Players.tmp.isFavorite)      ? "Yes" : "No");
	$('#playerDetails_DisplayNickname').html((app.Players.tmp.displayNickname) ? "Yes" : "No");
	
	$('#playerDetails_HS')   .html(app.Players.tmp.hs                                            );
	$('#playerDetails_GD')   .html(parseFloat(app.Players.tmp.gd)       .toFixed(2)              );
	$('#playerDetails_HGD')  .html(parseFloat(app.Players.tmp.hgd)      .toFixed(2)              );
	$('#playerDetails_Quota').html(parseFloat(100*app.Players.tmp.quota).toFixed(0) + '&thinsp;%');
    });
});

$(document).off('click', '#playerDetailsDeleteConfirm').on('click', '#playerDetailsDeleteConfirm', function (event) {
    event.preventDefault();
    
    app.Players.tmp.remove(function () {
	// Bugfix: Changing the page screwed up the history stack, by going back in the history
	//	   we can fix this.
	history.go(-2);
    });
});

$(document).off('click', '#pagePlayerDetailsEditLink')
           .on ('click', '#pagePlayerDetailsEditLink', function (event) {
    event.preventDefault();
	
    $('#pagePlayerDetailsOverviewHead').hide();
    $('#pagePlayerDetailsOverview')    .hide();
    
    $('#pagePlayerDetailsEditPlayerHead').show();
    $('#pagePlayerDetailsEditPlayer')    .show();
    
    $('#editPlayer_Name')           .val(app.Players.tmp.name           	);
    $('#editPlayer_Nickname')       .val(app.Players.tmp.nickname       	);
    $('#editPlayer_IsFavorite')     .val(String(app.Players.tmp.isFavorite)     ).slider('refresh');
    $('#editPlayer_DisplayNickname').val(String(app.Players.tmp.displayNickname)).slider('refresh');
    
    // Main player is always a favorite
    $('#editPlayer_IsFavorite').slider('enable');
    if (app.Players.tmp.pID == 1) {
	$('#editPlayer_IsFavorite').slider('disable');
    }
});
 
$(document).off('click', '#pagePlayerDetailsEditPlayerBackLink')
           .on ('click', '#pagePlayerDetailsEditPlayerBackLink', function (event) {
    event.preventDefault();
    
    $('#pagePlayerDetailsEditPlayerHead').hide();
    $('#pagePlayerDetailsEditPlayer')    .hide();
	
    $('#pagePlayerDetailsOverviewHead').show();
    $('#pagePlayerDetailsOverview')    .show();
});

$(document).off('click', 'editPlayer_Submit').on('click', '#editPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#editPlayer_Name').val(),
	nickname        = $('#editPlayer_Nickname').val(),
//	image           = 'playerDummy.jpg',
	isFavorite      = ($('#editPlayer_IsFavorite').val()      == "true") ? true : false,
	displayNickname = ($('#editPlayer_DisplayNickname').val() == "true") ? true : false;
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	app.alertDlg('A name must consist of at least 3 characters.', app.dummyTrue, 'Invalid name', 'OK');
	return false;
    }
    
    app.Players.tmp.modify(['Name',     'Nickname',     'isFavorite', 'displayNickname'],
			   [ name.name,  nickname.name,  isFavorite,   displayNickname ],
    function () {
	$('#pagePlayerDetailsEditPlayerHead').hide();
        $('#pagePlayerDetailsEditPlayer')    .hide();
	
	$('#pagePlayerDetailsOverviewHead').show();
	$('#pagePlayerDetailsOverview')    .show();
	
	$('#pagePlayerDetails').trigger('pageshow');
    });
    return true;
});