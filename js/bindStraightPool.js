function game141SetPlayer (idx, pID) {
    var anonName = (typeof arguments[2] !== 'undefined') ? arguments[2] : '';
    
    app.Players.ingame[idx] = new Player();
    app.Players.ingame[idx].load(pID, function () {
	var dispName = app.Players.ingame[idx].getDisplayName(),
	    image    = (app.Players.ingame[idx].image.length > 0) ? app.Players.ingame[idx].image : ('../../' + app.imgPlayerPath + 'playerDummy.jpg');
	
	if (pID == app.ANONYMOUSPLAYERPID) {
	    app.Players.ingame[idx].name = anonName;
	    dispName                     = anonName;
	}
	    
	$('#game141SetupPlayer' + idx + 'Name').html(dispName)
                                               .data('pid', app.Players.ingame[idx].pID);
	$('#game141SetupPlayer' + idx + 'Img') .attr('src', image);
	
	$('#game141SetupSubmitButton').button('disable');
	if (($('#game141SetupPlayer0Name').data('pid') != '-1' && $('#game141SetupPlayer1Name').data('pid') != '-1') &&
	   ((app.Players.ingame[1-idx].pID != pID) || (app.Players.ingame[idx].pID == app.ANONYMOUSPLAYERPID))) {
	    $('#game141SetupSubmitButton').button('enable'); 
	}
    });
}

$(document).on('pageshow', '#pageGame141Setup', function () {
    $('#game141Setup2')               .hide();
    $('#game141SetupAnonPlayer')      .hide();
    $('#game141SetupChoosePlayerHead').hide();
    $('#game141SetupSubmitButton')    .button('disable');
    
    // tutorial
    app.triggerTutorial('tutorial141TapholdSelectPlayer');
    
    // set locally saved score goal if available
    var scoreGoal = window.localStorage.getItem('game141_ScoreGoal') || 60;
    $('#game141SetupScoreGoal').val(scoreGoal).slider('refresh');
    
    // Set up the main player per default
    game141SetPlayer(0, app.Players.main.pID);
    
    // Bugfix: Binding this the usual way somehow doesn't work
    $('#game141SetupPlayerGrid div').off('taphold')
                                    .on ('taphold', game141TapHoldSelectPlayer);
    
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
		);
	    }
	    $('#game141SetupLoadProfileSelect').trigger('change');
	    
	    return true;
	}
    );
    
    // create game modes list
    app.dbFortune.query(
	'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
	[],
	function (tx, results) {
	    if (results.rows.length == 0) {
		$('#game141SetupGameMode').append(
		    '<option value="-1">None</option>'
		).trigger('change');
		
		return false;
	    }
	    
	    for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		
		$('#game141SetupGameMode').append(
		    '<option value="' + row['ID'] + '">' + row['Name'] + '</option>'
		);
	    }
	    $('#game141SetupGameMode').trigger('change');
	    
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
		 +  '$(\'#game141Setup2\').hide(); $(\'#game141SetupChoosePlayerHead\').hide(); $(\'#game141Setup1\').show(); $(\'#game141SetupHead\').show();">'
	         +  image + dispName + '</a></li>';
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
		     +  '$(\'#game141Setup2\').hide(); $(\'#game141SetupChoosePlayerHead\').hide(); $(\'#game141Setup1\').show(); $(\'#game141SetupHead\').show();">'
		     +  dispName + '</a></li>';
	    }
	   
	    html += '</ul>';
	    $('#game141Setup2').html(html).trigger('create');
	});
    });
});

$(document).off('click', '#game141SetupChoosePlayerHeadBackLink')
           .on ('click', '#game141SetupChoosePlayerHeadBackLink', function (event) {
    event.preventDefault();
    
    $('#game141SetupChoosePlayerHead').hide();
    $('#game141Setup2')               .hide();
    $('#game141SetupAnonPlayer')      .hide();
    
    $('#game141SetupHead').show();
    $('#game141Setup1')   .show();
});

$(document).off('click', '#pageGame141MainBackLink')
           .on ('click', '#pageGame141MainBackLink', function (event) {
    event.preventDefault();
    
    app.confirmDlg(
	'If you leave this game, you will be able to resume it, but any actions prior to this point cannot be undone anymore. Are you sure you want to leave?',
	function () {
	    app.dbFortune.dropTable(app.dbFortune.tables.Game141History);
	    $.mobile.changePage('../../index.html');
	    return true;
	},
	app.dummyFalse,
	'Leave Game',
	'Yes, No'
    );
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
	    $('#game141SetupScoreGoal')       .val(row['ScoreGoal']           ).slider('refresh');
	    $('#game141SetupMaxInnings')      .val(row['MaxInnings']          ).slider('refresh');
	    $('#game141SetupInningsExtension').val(row['InningsExtension']    ).slider('refresh');
	    $('#game141SetupGameMode')        .val(row['GameMode']     )       .trigger('change');
	    $('#game141SetupHandicap1')       .val(row['HandicapPlayer1']     ).slider('refresh');
	    $('#game141SetupHandicap2')       .val(row['HandicapPlayer2']     ).slider('refresh');
	    $('#game141SetupMultiplicator1')  .val(row['MultiplicatorPlayer1']).slider('refresh');
	    $('#game141SetupMultiplicator2')  .val(row['MultiplicatorPlayer2']).slider('refresh');
	    
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
	    player0          : $('#game141SetupPlayer0Name')     .data('pid'),
	    player1          : $('#game141SetupPlayer1Name')     .data('pid'),
	    scoreGoal        : $('#game141SetupScoreGoal')       .val()      ,
	    maxInnings       : $('#game141SetupMaxInnings')      .val()      ,
	    inningsExtension : $('#game141SetupInningsExtension').val()      ,
	    gameMode         : $('#game141SetupGameMode')        .val()      ,
	    handicap0	     : $('#game141SetupHandicap1')       .val()      ,
	    handicap1        : $('#game141SetupHandicap2')       .val()      ,
	    multiplicator0   : $('#game141SetupMultiplicator1')  .val()      ,
	    multiplicator1   : $('#game141SetupMultiplicator2')  .val()      ,
	}	
    });
});

$(document).off('click', '#game141SetupPlayerGrid div')
	   .on ('click', '#game141SetupPlayerGrid div', function (event) {
    event.preventDefault();
    
    var element_id = $(this).attr('id'),
	idx	   = element_id.substr(element_id.length-1, 1);
	
    $('#game141Setup1')   .hide();
    $('#game141SetupHead').hide();
    $('#game141Setup2').data('player', idx)
		       .show();
    $('#game141SetupChoosePlayerHead').show();
});
	   

/*
 *  Will be bound to taphold on pageshow
 *  For some reason doesn't work the usual way
 */
function game141TapHoldSelectPlayer (event) {
    event.preventDefault();
    
    var element_id = $(this).attr('id'),
	idx	   = element_id.substr(element_id.length-1, 1);
	
    $('#game141Setup1')   .hide();
    $('#game141SetupHead').hide();
    $('#game141SetupAnonPlayer').data('player', idx)
                                .show();
    $('#game141SetupChoosePlayerHead').show();
}
	   
$(document).off('click', '#game141AnonPlayer_Submit')
           .on ('click', '#game141AnonPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name = app.validateName($('#game141AnonPlayer_Name').val(), true);
    
    if (name.valid) {
	$('#game141AnonPlayer_Name')      .val('');
	$('#game141SetupAnonPlayer')      .hide();
	$('#game141SetupChoosePlayerHead').hide();
	$('#game141Setup1')               .show();
	$('#game141SetupHead')            .show();
	
	var idx = parseInt( $('#game141SetupAnonPlayer').data('player') );
	game141SetPlayer(
	    idx,
	    app.ANONYMOUSPLAYERPID,
	    name.name
	);
    }
    else {
	app.alertDlg(
	    'The name you entered is invalid. A valid name consists of at least three characters.',
	    app.dummyFalse,
	    'Error',
	    'OK'
	);
    }
});

$(document).on('pageshow', '#pageGame141', function () {
    var url = $.url( $.url().attr('fragment') );
    
    var gID  = parseInt(url.param('gID')),
	load = true;
    if (typeof gID === 'undefined' || isNaN(gID)) {
	load = false;
	
	var pID0             = parseInt(url.param('player0'         )),
	    pID1             = parseInt(url.param('player1'         )),
	    scoreGoal        = parseInt(url.param('scoreGoal'       )),
	    maxInnings       = parseInt(url.param('maxInnings'      )),
	    inningsExtension = parseInt(url.param('inningsExtension')),
	    gameMode         = parseInt(url.param('gameMode'        )),
	    handicap0        = parseInt(url.param('handicap0'       )),
	    handicap1        = parseInt(url.param('handicap1'       )),
	    multiplicator0   = parseInt(url.param('multiplicator0'  )),
	    multiplicator1   = parseInt(url.param('multiplicator1'  ));
    }
    
    app.currentGame = new StraightPool();
    if (load) {
	app.currentGame.loadGame(
	    gID,
	    app.currentGame.initUI
	);
    }
    else {
	app.currentGame.initNewGame(scoreGoal, maxInnings, inningsExtension, gameMode, [handicap0, handicap1], [multiplicator0, multiplicator1],
	    function () {
		app.currentGame.setPlayers(
		    app.currentGame.initUI
		);
		
		// tutorial
		app.triggerTutorial('tutorial141TapholdSevereFoul');
	    }
	);
    }
});