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

$(document).off('click', '#addPlayer_Submit')
           .on('click', '#addPlayer_Submit', function (event) {
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

$(document).off('click', '#playerDetailsDeleteConfirm')
           .on('click', '#playerDetailsDeleteConfirm', function (event) {
    event.preventDefault();
    
    var pID = app.Players.tmp.pID;
    app.dbFortune.query(
	'SELECT COUNT(*) AS ctr FROM ' + app.dbFortune.tables.Game141.name + ' WHERE Player1="' + pID + '" OR Player2="' + pID + '"',
	[],
	function (tx, results) {
	    var ctr = results.rows.item(0)['ctr'];
	    
	    if (ctr == 0) {
		app.Players.tmp.remove(function () {
		    // Bugfix: Changing the page screwed up the history stack, by going back in the history
		    //	       we can fix this.
		    history.go(-2);
		});
	    }
	    else {
		app.alertDlg(
		    'Sorry, you cannot delete this player as long as you have games stored on your phone in which this person played!',
		    function () {
			$('#popupDeletePlayer').popup('close');
		    },
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