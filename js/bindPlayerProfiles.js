$(document).on('pageshow', '#pagePlayersList', function () {
    $('#pagePlayersListNewPlayerHead').hide();
    $('#pagePlayersListNewPlayer')    .hide();
    
    // Create List
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

$(document).off('click', '#addPlayer_Submit')
           .on('click', '#addPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#addPlayer_Name')            .val(),
	nickname        = $('#addPlayer_Nickname')        .val(),
	image           = $('#pagePlayersListNewPlayer')  .data('image') || '',
	isFavorite      = ($('#addPlayer_IsFavorite')     .val() == "true") ? true : false,
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
	   
$(document).off('click', '#addPlayer_Picture')
           .on ('click', '#addPlayer_Picture', function (event) {
    event.preventDefault();
    
    app.getPicture(
	function (imgURI) {
	    $('#pagePlayersListNewPlayer').data('image', imgURI);
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

$(document).on('pageshow', '#pagePlayerDetails', function () {
    var $btnDelete = $('#playerDetailsDeleteButton');
    
    $('#pagePlayerDetailsEditPlayerHead').hide();
    $('#pagePlayerDetailsEditPlayer')    .hide();
    
    // This is a weird glitch-workaround for the url being passed in a rather strange way
    var url = $.url( $.url().attr('fragment') ),
	pID = parseInt(url.param('pID'));
	
    // Hide delete button if it's the main user profile
    $btnDelete.button('enable');
    if (pID == 1) {
	$btnDelete.button('disable');
    }
    
    app.Players.tmp = new Player();
    app.Players.tmp.load(pID, function () {
	if (app.Players.tmp.image !== '') {
	    $('#playerDetails_Image').show()
	                             .attr('src', app.Players.tmp.image);
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
	   
$(document).off('click', '#playerDetailsDeleteButton')
           .on ('click', '#playerDetailsDeleteButton', function (event) {
    event.preventDefault();
    
    var pID = app.Players.tmp.pID;
    app.dbFortune.query(
	'SELECT COUNT(*) AS ctr FROM ' + app.dbFortune.tables.Game141.name + ' WHERE Player1="' + pID + '" OR Player2="' + pID + '"',
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
	    }
	    else {
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
	
    $('#pagePlayerDetailsOverviewHead').hide();
    $('#pagePlayerDetailsOverview')    .hide();
    
    $('#pagePlayerDetailsEditPlayerHead').show();
    $('#pagePlayerDetailsEditPlayer')    .show();
    
    $('#editPlayer_Name')           .val(app.Players.tmp.name           	);
    $('#editPlayer_Nickname')       .val(app.Players.tmp.nickname       	);
    $('#editPlayer_IsFavorite')     .val(String(app.Players.tmp.isFavorite)     ).slider('refresh');
    $('#editPlayer_DisplayNickname').val(String(app.Players.tmp.displayNickname)).slider('refresh');
    
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
    
    $('#pagePlayerDetailsEditPlayerHead').hide();
    $('#pagePlayerDetailsEditPlayer')    .hide();
	
    $('#pagePlayerDetailsOverviewHead').show();
    $('#pagePlayerDetailsOverview')    .show();
    
    $('#pagePlayerDetails').trigger('pageshow');
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

$(document).off('click', '#editPlayer_Picture')
           .on ('click', '#editPlayer_Picture', function (event) {
    event.preventDefault();
    
    app.getPicture(
	function (imgURI) {
	    app.Players.tmp.modify(
		['Image'],
		[imgURI],
		function () {
		    $.mobile.changePage('player_details.html?pID=' + app.Players.tmp.pID);
		}
	    );
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