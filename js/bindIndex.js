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
	var query1 = new dbFortuneQuery();
	query1.add(
	    'INSERT INTO '
		+ app.dbFortune.tables.Game141Profile.name + ' '
		+ app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141Profile)
		+ ' VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
	    ['Default', 60, 0, 1, 0, 0, 1, 1, 0, 0]
	);
	
	query1.execute();
	
	// Fill with default game modes
	var query2 = new dbFortuneQuery();
	query2.add(
	    'INSERT INTO '
		+ app.dbFortune.tables.GameModes.name + ' '
		+ app.dbFortune.getTableFields_String(app.dbFortune.tables.GameModes)
		+ ' VALUES (NULL, ?)',
	    ['Practice Game']
	);
	query2.add(
	    'INSERT INTO '
		+ app.dbFortune.tables.GameModes.name + ' '
		+ app.dbFortune.getTableFields_String(app.dbFortune.tables.GameModes)
		+ ' VALUES (NULL, ?)',
	    ['League Game']
	);
	
	query2.execute();
    });
    
    // kill this button to prevent any double-firing (we dont need it anymore anyway)
    $(document).off('click', '#firstRunMainUser_Submit');
    return true;
});