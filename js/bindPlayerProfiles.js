$(document).on('pagebeforeshow', '#pagePlayersList', function () {    
    // Create List
    /*$.mobile.loading('show', {
	text: 'Preparing Player List',
	textVisible: true,
	theme: 'a',
    });*/
    
    var listDummy = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search Players..." data-dividertheme="a">'
                  + '<li data-role="list-divider">Favorites</li>[entries1]<li data-role="list-divider">All</li>[entries2]</ul>';
    var entryDummy = '<li data-filtertext="[filter]"><a href="player_details.html?pID=[id]">[image][dispName]</a></li>';
	
    app.dbFortune.query('SELECT pID, Name, Nickname, Image, displayNickname FROM ' + app.dbFortune.tables.Player.name +
			' WHERE isFavorite = "true" ORDER BY CASE pID WHEN "1" THEN pID END DESC, LOWER(Name)',
			[],
    function (tx, results) {
	var entries1 = new Array(results.rows.length);
	for (var i = 0; i < results.rows.length; i++) {
	    var row      = results.rows.item(i),
		filter   = row['Name'] + ' ' + row['Nickname'],
		dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		image    = (row['Image'] !== '') ? '<img src="' + row['Image'] + '" />' : '';
		
	    entries1[i] = entryDummy.replace('[filter]',   filter)
	                            .replace('[id]',       row['pID'])
				    .replace('[image]',    image)
				    .replace('[dispName]', dispName);
	}
	
	app.dbFortune.query('SELECT pID, Name, Nickname, displayNickname FROM ' + app.dbFortune.tables.Player.name + ' ORDER BY LOWER(Name)',
			    [],
	function (tx, results) {
	    var entries2 = new Array(results.rows.length);
	    for (var i = 0; i < results.rows.length; i++) {
		var row      = results.rows.item(i),
		    dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
		    filter   = row['Name'] + ' ' + row['Nickname'];
		
		entries2[i] = entryDummy.replace('[filter]',   filter)
					.replace('[id]',       row['pID'])
					.replace('[image]',    '')
					.replace('[dispName]', dispName);
	    }
	   
	    $('#playerList').html(
		listDummy.replace('[entries1]', entries1.join(''))
		         .replace('[entries2]', entries2.join(''))
	    ).trigger('create');
	    //$.mobile.loading('hide');
	});
    });
});

$(document).on('pagebeforeshow', '#pagePlayersAdd', function () {
    $('#addPlayer_Picture').css('display', 'none');
    
    // Check if this page was called from a game setup
    var url           = $.url( $.url().attr('fragment') ),
	setup         = url.param('setup'),
	fromNewPlayer = url.param('fromNewPlayer'), 
	redirect      = 'player_list.html';
    
    switch (setup) {
	case '141':
	    redirect = '../game141/game141_Setup.html?fromNewPlayer=' + fromNewPlayer;
	    break;
    }
    
    $('#addPlayer_Submit').data('redirect', redirect);
});

$(document).off('click', '#addPlayer_PictureTake')
           .on ('click', '#addPlayer_PictureTake', function (event) {
    event.preventDefault();
    
    app.getPicture(
	function (imgURI) {
	    $('#addPlayer_Picture').attr('src', imgURI).css('display', 'block');
	},
	function (message) {
	    app.alertDlg(
		'Oops! Something went wrong :( The message is: ' + message,
		app.dummyFalse,
		'Error',
		'OK'
	    );
	}
    );
});
	   
$(document).off('click', '#addPlayer_PictureDelete')
           .on ('click', '#addPlayer_PictureDelete', function (event) {
    event.preventDefault();
    
    $('#addPlayer_Picture').attr('src', '').css('display', 'none');
});
	   
$(document).off('click', '#addPlayer_Submit')
           .on('click', '#addPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#addPlayer_Name')            .val(),
	nickname        = $('#addPlayer_Nickname')        .val(),
	image           = $('#addPlayer_Picture')         .attr('src'),
	isFavorite      = ($('#addPlayer_IsFavorite')     .val() == "true"),
	displayNickname = ($('#addPlayer_DisplayNickname').val() == "true");
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    var msg = '';
    if (!name.valid) {
	msg = 'The name you entered is invalid! Your name has to be at least 3 characters long and should consist of both your first and last name.';
    }
    if (!nickname.valid) {
	msg = 'The nickname you entered is invalid. Nicknames are optional. However, if you choose to use one, it has to be at least 3 characters long.';
    }
    
    if (msg.length > 0) {
	app.alertDlg(
	    msg,
	    app.dummyFalse,
	    'Invalid name',
	    'OK'
	);
	
	return false;
    }

    var newPlayer = new Player(app.dbFortune);
    newPlayer.create(name.name, nickname.name, image, isFavorite, displayNickname, false, function () {
	$.mobile.changePage($('#addPlayer_Submit').data('redirect'));
    });
    
    return true;
});

$(document).on('pagebeforeshow', '#pagePlayerDetails', function () {
    var $btnDelete  = $('#playerDetailsDeleteButton'),
	$btnRefresh = $('#playerDetails_refreshStats');
    
    $('#pagePlayerDetailsEditPlayerHead').css('display', 'none');
    $('#pagePlayerDetailsEditPlayer')    .css('display', 'none');
    $('#playerDetails_Image')            .css('display', 'none');
    $('#editPlayer_Picture')             .css('display', 'none');
    
    // This is a weird glitch-workaround for the url being passed in a rather strange way
    var url = $.url( $.url().attr('fragment') ),
	pID = parseInt(url.param('pID'));
	
    // Hide delete button if it's the main user profile
    $btnDelete .button('enable');
    $btnRefresh.button('disable');
    if (pID == 1) {
	$btnDelete.button('disable');
    }
    
    app.Players.tmp = new Player();
    app.Players.tmp.load(pID, function () {
	$btnRefresh.button('enable');
	
	if (app.Players.tmp.image !== '') {
	    $('#playerDetails_Image').css('display', 'block')
	                             .attr('src', app.Players.tmp.image);
	    $('#editPlayer_Picture') .css('display', 'block')
	                             .attr('src', app.Players.tmp.image);
	}
	
	$('#playerDetails_Name')           .html(app.Players.tmp.name                            );
        $('#playerDetails_Nickname')       .html(app.Players.tmp.nickname       	         );
        $('#playerDetails_IsFavorite')     .html((app.Players.tmp.isFavorite)      ? "Yes" : "No");
	$('#playerDetails_DisplayNickname').html((app.Players.tmp.displayNickname) ? "Yes" : "No");
	
	$('#playerDetails_141_HS')          .html(app.Players.tmp.stats.game141.HS                                            );
	$('#playerDetails_141_GD')          .html(parseFloat(app.Players.tmp.stats.game141.GD)       .toFixed(2)              );
	$('#playerDetails_141_HGD')         .html(parseFloat(app.Players.tmp.stats.game141.HGD)      .toFixed(2)              );
	$('#playerDetails_141_GamesPlayed') .html(app.Players.tmp.stats.game141.gamesPlayed                                   );
	$('#playerDetails_141_Quota')       .html(parseFloat(100*app.Players.tmp.stats.game141.quota).toFixed(0) + '&thinsp;%');
	$('#playerDetails_141_TotalPoints') .html(app.Players.tmp.stats.game141.totalPoints                                   );
	$('#playerDetails_141_TotalInnings').html(app.Players.tmp.stats.game141.totalInnings                                  );
	
	$('#playerDetails_8910_GamesPlayed')         .html(app.Players.tmp.stats.game8910.gamesPlayed                                   );
	$('#playerDetails_8910_Quota')               .html(parseFloat(100*app.Players.tmp.stats.game8910.quota).toFixed(0) + '&thinsp;%');
	$('#playerDetails_8910_HighestStreak')       .html(app.Players.tmp.stats.game8910.HS                                            );
	$('#playerDetails_8910_HighestStreakRunouts').html(app.Players.tmp.stats.game8910.HSRunouts                                     );
	$('#playerDetails_8910_TotalRunouts')        .html(app.Players.tmp.stats.game8910.totalRunouts                                  );
	$('#playerDetails_8910_RacksPlayed')         .html(app.Players.tmp.stats.game8910.racksPlayed                                   );
	$('#playerDetails_8910_RacksWon')            .html(app.Players.tmp.stats.game8910.racksWon                                      );
    });
});

$(document).off('click', '#playerDetails_refreshStats')
           .on ('click', '#playerDetails_refreshStats', function (event) {
    event.preventDefault();
    
    app.confirmDlg(
	'This will recalculate all statistics based on only the games currently stored on your phone. Proceed?',
	function () {
	    app.Players.tmp.recalculateAllStatistics();
	    app.alertDlg(
		'This may take a moment. You need to navigate away and back to this page manually to see changes.',
		app.dummyFalse,
		'Recalculating',
		'OK'
	    );
	},
	app.dummyFalse,
	'Warning',
	'Yes,No'
    );
});
	   
$(document).off('click', '#playerDetailsDeleteButton')
           .on ('click', '#playerDetailsDeleteButton', function (event) {
    event.preventDefault();
    
    var pID = app.Players.tmp.pID;
    app.dbFortune.query(
	//'SELECT COUNT(*) AS ctr FROM ' + app.dbFortune.tables.Game141.name + ' WHERE Player1="' + pID + '" OR Player2="' + pID + '"',
	'SELECT COUNT(*) AS ctr FROM ('
	    + 'SELECT gID FROM ' + app.dbFortune.tables.Game141.name + ' WHERE Player1=' + pID + ' OR Player2=' + pID
	    + ' UNION ALL '
	    + 'SELECT gID FROM ' + app.dbFortune.tables.Game8910.name + ' WHERE Player1=' + pID + ' OR Player2=' + pID
	    + ')',
	[],
	function (tx, results) {
	    var ctr = results.rows.item(0)['ctr'];
	    
	    if (ctr == 0) {
		app.confirmDlg(
		    'Are you sure you want to delete this player? This action cannot be undone!',
		    function () {
			app.Players.tmp.remove(function () {
			    app.Players.tmp = undefined;
			    
			    $.mobile.changePage('player_list.html');
			});
		    },
		    app.dummyFalse,
		    'Confirm',
		    'Delete,Cancel'
		);
	    } else {
		app.alertDlg(
		    'Sorry, you cannot delete this player as long as you have games stored on your phone in which this person played!',
		    app.dummyFalse,
		    'Error',
		    'OK'
		);
	    }
	}
    );
});

$(document).off('click', '#pagePlayerDetailsEditLink')
           .on ('click', '#pagePlayerDetailsEditLink', function (event) {
    event.preventDefault();
	
    $('#pagePlayerDetailsOverviewHead').css('display', 'none');
    $('#pagePlayerDetailsOverview')    .css('display', 'none');
    
    $('#pagePlayerDetailsEditPlayerHead').css('display', 'block');
    $('#pagePlayerDetailsEditPlayer')    .css('display', 'block');
    
    $('#editPlayer_Name')           .val(app.Players.tmp.name           	);
    $('#editPlayer_Nickname')       .val(app.Players.tmp.nickname       	);
    $('#editPlayer_IsFavorite')     .val(String(app.Players.tmp.isFavorite)     ).slider('refresh');
    $('#editPlayer_DisplayNickname').val(String(app.Players.tmp.displayNickname)).slider('refresh');
    $('#editPlayer_Picture')        .attr('src', app.Players.tmp.image          );
    
    // Main player is always a favorite
    var $isFavorite = $('#editPlayer_IsFavorite');
    
    $isFavorite.slider('enable');
    if (app.Players.tmp.pID == 1) {
	$isFavorite.slider('disable');
    }
});
 
$(document).off('click', '#pagePlayerDetailsEditPlayerBackLink')
           .on ('click', '#pagePlayerDetailsEditPlayerBackLink', function (event) {
    event.preventDefault();
    
    $('#pagePlayerDetailsEditPlayerHead').css('display', 'none');
    $('#pagePlayerDetailsEditPlayer')    .css('display', 'none');
	
    $('#pagePlayerDetailsOverviewHead').css('display', 'block');
    $('#pagePlayerDetailsOverview')    .css('display', 'block');
    
    $('#pagePlayerDetails').trigger('pagebeforeshow');
});

$(document).off('click', 'editPlayer_Submit').on('click', '#editPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#editPlayer_Name').val(),
	nickname        = $('#editPlayer_Nickname').val(),
	image           = $('#editPlayer_Picture').attr('src'),
	isFavorite      = ($('#editPlayer_IsFavorite').val()      == "true"),
	displayNickname = ($('#editPlayer_DisplayNickname').val() == "true");
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	app.alertDlg('A name must consist of at least 3 characters.', app.dummyTrue, 'Invalid name', 'OK');
	return false;
    }
    
    app.Players.tmp.modify(['Name',     'Nickname',     'Image', 'isFavorite', 'displayNickname'],
			   [ name.name,  nickname.name,  image,   isFavorite,   displayNickname ],
    function () {
	$('#pagePlayerDetailsEditPlayerHead').css('display', 'none');
        $('#pagePlayerDetailsEditPlayer')    .css('display', 'none');
	
	$('#pagePlayerDetailsOverviewHead').css('display', 'block');
	$('#pagePlayerDetailsOverview')    .css('display', 'block');
	
	$('#pagePlayerDetails').trigger('pagebeforeshow');
    });
    return true;
});

$(document).off('click', '#editPlayer_PictureTake')
           .on ('click', '#editPlayer_PictureTake', function (event) {
    event.preventDefault();
    
    app.getPicture(
	function (imgURI) {
	    $('#editPlayer_Picture').attr('src', imgURI).css('display', 'block');
	},
	function (message) {
	    app.alertDlg(
		'Oops! Something went wrong :( The message is: ' + message,
		app.dummyFalse,
		'Error',
		'OK'
	    );
	}
    );
});
	   
$(document).off('click', '#editPlayer_PictureDelete')
           .on ('click', '#editPlayer_PictureDelete', function (event) {
    event.preventDefault();
    
    $('#editPlayer_Picture').attr('src', '').css('display', 'none');
});