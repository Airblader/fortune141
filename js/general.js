var app;

/*
 *  MAIN APP CLASS
 */
function FortuneApp () {
    var self = this;
    
    self.dbFortune = undefined;
    
    self.Players   = {
	main : undefined,	// Main User
	tmp  : undefined,	// Temporarily used user (modifying users, ...)
	ingame : new Array(),	// for games
    };
    
    self.imgPlayerPath = 'img/players/';
    
    // holds the currently running game
    self.currentGame = undefined;
    
    // key names for running games
    self.keyActiveGame = {
	id   : 'activeGame',
	type : 'activeGameType', 
    };
    
    // Dummy functions to avoid unneccessary anonymous functions
    self.dummyFalse = function () { return false; }
    self.dummyTrue  = function () { return true;  }
    
    /*
     *	Updates information about main user on index page
     */
    self.updateMainUser = function () {
	// Image
	$('#indexMainUserImg').attr('src', self.imgPlayerPath + self.Players.main.image);
	
	// Name
	var name = self.Players.main.name.split(" ");
	
	$('#pageIndex .firstName').html(name.shift());
	$('#pageIndex .lastName') .html(name.join(" "));
	
	// Stats
	$('#pageIndex #indexMainUserGD')   .html(parseFloat(self.Players.main.gd)   .toFixed(2)              );
	$('#pageIndex #indexMainUserHS')   .html(self.Players.main.hs                                        );
	$('#pageIndex #indexMainUserQuota').html(parseFloat(self.Players.main.quota).toFixed(0) + '&thinsp;%');
    }
    
    /*
     *	Validate a name
     *		name     : string to be checked
     *		required : whether the name can be empty
     *
     *	Returns an object with the properties
     *		name  : name after validation
     *		valid : whether the name is valid
     */
    self.validateName = function (name, required) {
	var validated = {
	    name  : self.trim(name),
	    valid : true,
	};
	
	if (required && validated.name.length == 0) {
	    validated.valid = false;
	}
	else if (validated.name.length != 0 && validated.name.length < 3) {
	    validated.valid = false;
	}
	
	return validated;
    }
    
    self.trim = function (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}


/*
 *  MAIN PLAYER CLASS
 */
function Player () {
    var self = this;
    
    self.db = app.dbFortune;
    
    // Player properties
    self.pID 		 = -1;
    self.name 		 = '';
    self.nickname 	 = '';
    self.image 		 = '';
    self.isFavorite 	 = false;
    self.displayNickname = false;
    self.hs		 = 0;
    self.gd		 = 0;
    self.quota		 = 0;
    
    /*
     *	Create a new player and add to database
     *		name,
     *		nickname,
     *		image,
     *		isFavorite,
     *		displayNickname       : player properties
     *		mainUser              : whether this is the main user account (reinitializes player table)
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.create = function (name, nickname, image, isFavorite, displayNickname, mainUser) {
	var cbSuccess = (typeof arguments[6] !== 'undefined') ? arguments[6] : app.dummyFalse,
	    cbError   = (typeof arguments[7] !== 'undefined') ? arguments[7] : app.dummyFalse;
	
	var query = new dbFortuneQuery();
	
	self.name 	     = name;
	self.nickname 	     = nickname;
	self.image 	     = image;
	self.isFavorite      = isFavorite;
	self.displayNickname = displayNickname;

	// If the flag to create the main user is set, reinit the whole database
	if (mainUser) {
	    query.add(
		self.db.getDropTableStatement(self.db.tables.Player)
	    );
	    query.add(
		self.db.getCreateTableStatement(self.db.tables.Player)
	    );
	}
	
	var sql = 'INSERT INTO '
		    + self.db.tables.Player.name + ' '
		    + self.db.getTableFields_String(self.db.tables.Player, false, false) + ' '
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)';
	
	query.add(sql,
		[name, nickname, image, isFavorite, displayNickname, "0", "0", "0"],
		function (tx, result) {
		    // assign pID to object
		    self.pID = result.insertId;
		}
	);

	query.execute(cbSuccess, cbError);
    }
    
    /*
     *	Modify player information
     *		fields                : array containing the table fields to be altered
     *		values                : array containing the new values
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.modify = function (fields, values) {
	var cbSuccess = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse,
	    cbError   = (typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse;
	
	var sql  = 'UPDATE ' + self.db.tables.Player.name + ' SET ';
	    sql += fields.join('=?, ') + '=? ';
	    sql += 'WHERE pID = "' + self.pID + '"';
	
	self.db.query(sql, values, cbSuccess, cbError);
    }
    
    /*
     *	Permanently deletes player from database
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.remove = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	    
	// We don't allow deleting the main user
	if (self.pID == 1) {
	    cbError();
	    return false;
	}
	
	var sql = 'DELETE FROM ' + self.db.tables.Player.name + ' WHERE pID = "' + self.pID + '"';
	self.db.query(sql, [], cbSuccess, cbError);
	
	return true;
    }
    
    /*
     *	Load a player with given pID into the object
     *		pID                   : pID of the player to be loaded
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.load = function (pID) {
	var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
	    cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
	
	self.db.query('SELECT * FROM ' + self.db.tables.Player.name + ' WHERE pID = "' + pID + '" LIMIT 1', [],
	function (tx, results) {
	    // If the user doesn't exist, we call the error callback
	    if (results.rows.length == 0) {
		cbError();
		return false;
	    }
	    
	    // load information into the object
	    var row = results.rows.item(0);
	    
	    self.pID	         = parseInt(pID);
	    self.name            = row['Name'];
	    self.nickname        = row['Nickname'];
	    self.image           = row['Image'];
	    self.isFavorite      = (row['isFavorite']      == "true") ? true : false;
	    self.displayNickname = (row['displayNickname'] == "true") ? true : false;
	    self.hs		 = parseInt(row['HS']);
	    self.gd		 = row['GD'];
	    self.quota		 = row['Quota'];
	    
	    cbSuccess();
	    return true;
	},
	cbError);
    }
    
    /*
     *	Returns either name or nickname depending on whether the nickname should
     *	be used and is not empty
     */
    self.getDisplayName = function () {
	return (self.displayNickname && self.nickname.length != 0) ? self.nickname : self.name;
    }
}


/*
 *  QUERY CLASS
 *  	Represents a query wrapper that can handle several SQL statements
 */
function dbFortuneQuery () {
    var self = this;
    
    self.db	    = app.dbFortune.db;
    self.statements = new Array();
    
    /*
     *	Add an SQL statement to the query
     *		sql                   : SQL string to be executed
     *		args (optional)       : array containing values for '?'-placeholders 
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.add = function (sql) {
	var args      = (typeof arguments[1] !== 'undefined') ? arguments[1] : [],
            cbSuccess = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse,
            cbError   = (typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse;
	
	self.statements.push({
	    sql       : sql,
	    args      : args,
	    cbSuccess : cbSuccess,
	    cbError   : cbError,
	});
    }
    
    /*
     *	Execute the query
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.execute = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	self.db.transaction(function (tx) {
	    for (var i = 0; i < self.statements.length; i++) {
		tx.executeSql(
		    self.statements[i].sql,
		    self.statements[i].args,
		    self.statements[i].cbSuccess,
		    self.statements[i].cbError
		);
	    }
        }, cbError, cbSuccess);
    }
}


/*
 *  DATABASE CLASS
 *  	Wraps database access into a new class for stability
 */
function dbFortune () {
    var self = this;
    
    self.dbName = 'Fortune';
    self.dbSize = 5 * 1000 * 1000;
    self.dbDesc = 'Fortune 14/1 Database';
    
    /*
     *  Definition of database tables
     */
    self.tables = {
        Player : {
            name : 'Player',
            fields : new Array(
                'pID',
                'Name',
                'Nickname',
                'Image',
                'isFavorite',
                'displayNickname',
		'HS',
		'GD',
		'Quota'
            ),
            types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                'TEXT NOT NULL',
                'TEXT',
                'TEXT',
                'BIT',
                'BIT',
		'INTEGER',
		'TEXT',
		'TEXT'
	    ),
            defaults : new Array(
		undefined,
                '""',
                undefined,
                undefined,
                '0',
                '0',
		'0',
		'"0"',
		'"0"'
	    ),
        },
	Game141 : {
	    name : 'Game141',
	    fields : new Array(
		'gID',
		'Timestamp',
		'Player1',
		'Player2',
		'PointsPlayer1',
		'PointsPlayer2',
		'ScoreGoal',
		'MaxInnings',
		'HandicapPlayer1',
		'HandicapPlayer2',
		'MultiplicatorPlayer1',
		'MultiplicatorPlayer2',
		'InningsPlayer1',
		'InningsPlayer2',
		'FoulsPlayer1',
		'FoulsPlayer2',
		'BallsOnTable',
		'CurrPlayer',
		'FirstShot',
		'isTrainingGame',
		'isFinished',
		'Winner',
		'Comment',
		'isUploaded',
		'isReadyForDeletion'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'TEXT',
		'INTEGER NOT NULL',
		'INTEGER NOT NULL',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'TEXT',
		'TEXT',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'BIT',
		'BIT',
		'BIT',
		'INTEGER',
		'TEXT',
		'BIT',
		'BIT'
	    ),
	    defaults : new Array(
		undefined,
		undefined,
		'-1',
		'-1',
		'0',
		'0',
		undefined,
		'0',
		'0',
		'0',
		'1',
		'1',
		undefined,
		undefined,
		'0',
		'0',
		'0',
		'0',
		'0',
		'0',
		'0',
		'-1',
		undefined,
		'0',
		'0'
	    ),
	},
	Game141Profile : {
	    name : 'Game141Profile',
	    fields : new Array(
		'ID',
		'Name',
		'ScoreGoal',
		'MaxInnings',
		'HandicapPlayer1',
		'HandicapPlayer2',
		'MultiplicatorPlayer1',
		'MultiplicatorPlayer2',
		'isTrainingsGame',
		'Usage'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'TEXT NOT NULL',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'INTEGER'
	    ),
	    defaults : new Array(
		undefined,
		'"PROFILE"',
		undefined,
		'0',
		'0',
		'0',
		'1',
		'1',
		'0',
		'0'
	    ),
	},
    };
    
    /*
     *	Opens the database connection and checks whether this is the first time
     *	the connection was made (e.g. the app was started). If this is not the
     *	case, this function also loads the main player
     *		cbFirstRun               : callback function if it was the first start
     *		cbNotFirstRun (optional) : callback function if it was *not* the first start
     */
    self.open = function (cbFirstRun) {
        var cbNotFirstRun = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyTrue;
        
        self.db = window.openDatabase(self.dbName, '1.0', self.dbDesc, self.dbSize);
        
        // Check if this is the first connection attempt
        self.checkForFirstRun(
            function () {
		// no tables should exist at this point anyway, but we make sure to get a clean start
		self.dropAllTables();
		
                cbFirstRun();
            },
	    function () {
		// load the main player
		app.Players.main = new Player();
		app.Players.main.load(1, cbNotFirstRun);
	    }
        );
    }
    
    /*
     *	Performs a simple query directly
     *		sql                   : SQL statement
     *		args (optional)       : array containing values for '?'-placeholders
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.query = function (sql) {
	var query = new dbFortuneQuery();
	query.add(
	    sql,
	    (typeof arguments[1] !== 'undefined') ? arguments[1] : [],
	    (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse,
	    (typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse
	);
	query.execute();
    }
    
    /*
     *	Returns a string consisting of the complete field description of the given table
     *	Examples: '(id, name, another_field)', '(id INTEGER NOT NULL, name TEXT DEFAULT "anonym", another_field TEXT)'
     *		table               : table of which the string should be generated
     *		types (optional)    : whether to include the field types (defaults to false)
     *		defaults (optional) : whether to include the field defaults (requires 'types' to be true, defaults to false)
     */
    self.getTableFields_String = function (table) {
	var types    = (typeof arguments[1] !== 'undefined')          ? arguments[1] : false,
	    defaults = (typeof arguments[2] !== 'undefined' && types) ? arguments[2] : false;
	
	var desc = '(';
	for (var i = 0; i < table.fields.length; i++) {
	    desc += table.fields[i]
		 +  ((types) ? (' ' + table.types[i]) : '')
		 +  ((defaults && typeof table.defaults[i] !== 'undefined') ? (' DEFAULT ' + table.defaults[i]) : '')
		 +  ((i != table.fields.length-1) ? ', ' : '');
	}
	desc += ')';
	
	return desc;
    }
    
    /*
     *	Returns the SQL statement to create a table
     *		table : table for which to create the statement
     */
    self.getCreateTableStatement = function (table) {	
	var sql  = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' ' + self.getTableFields_String(table, true, true);
	return sql;
    }
    
    /*
     *	Creates a table
     *		table                 : table to create
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.createTable = function (table) {
        var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
            cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
        
	var sql = self.getCreateTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
    }
    
    /*
     *	Creates all tables
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.createAllTables = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
            cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	    
	var query = new dbFortuneQuery();
	    
	$.each(self.tables, function (name, obj) {
	    query.add( self.getCreateTableStatement(self.tables[name]) );
	});
	
	query.execute(cbSuccess, cbError);
    }
    
    /*
     * 	Returns the SQL statement to delete/drop a table
     *  	table : table for which to create the statement
     */
    self.getDropTableStatement = function (table) {
	return 'DROP TABLE IF EXISTS ' + table.name;
    }
    
    /*
     *	Deletes a table from the database
     *		table                 : table to drop
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.dropTable = function (table) {
	var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
            cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
        
        var sql  = self.getDropTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
    }
    
    /*
     *	Deletes all tables from the database
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    self.dropAllTables = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
            cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	var query = new dbFortuneQuery();
	    
	$.each(self.tables, function (name, obj) {
	    query.add( self.getDropTableStatement(self.tables[name]) );
	});
	
	query.execute(cbSuccess, cbError);
    }
    
    /*
     *	Checks whether the app has been started for the first time
     *		cbFirstRun,
     *		cbNotFirstRun      : callback functions
     *		cbError (optional) : callback function in case of an error
     *				     (if not defined, cbFirstRun will be used instead)
     */
    self.checkForFirstRun = function (cbFirstRun, cbNotFirstRun) {
        var cbError = (typeof arguments[2] !== 'undefined') ? arguments[2] : cbFirstRun;

        //self.query('SELECT COUNT(*) AS firstRun FROM sqlite_master WHERE type="table" AND name="' + self.tables.Player.name + '"',
	self.query('SELECT COUNT(*) AS firstRun FROM ' + self.tables.Player.name + ' WHERE pID="1"',
                    [],
                    
                    function (tx, res) {
                        var row = res.rows.item(0);
                        
                        if (parseInt(row['firstRun']) != 0) {
                            cbNotFirstRun();
                            return false;
                        }
                        
                        cbFirstRun();
                        return false;
                    },
                    function (error) {
                        cbError();
                        return false;
                    }
        );
	
	return true;
    }
}


/*
 *	INDEX PAGE
 */

$(document).bind("mobileinit", function () {
    $.mobile.defaultPageTransition   = "none";
    $.mobile.defaultDialogTransition = "none";

    app = new FortuneApp();
    app.dbFortune = new dbFortune();
    app.dbFortune.open(function () {
	setTimeout(function () {
	    $('#popupFirstRunMainUser').popup('open');
	}, 500);
    }, function() {
	app.updateMainUser();    
    });
});


$(document).off('click', '#firstRunMainUser_Submit').on('click', '#firstRunMainUser_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#firstRunMainUser_Name').val(),
	nickname        = $('#firstRunMainUser_Nickname').val(),
	image           = 'playerDummy.jpg',
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
	    $('#popupFirstRunMainUser').popup('close');
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
    
    navigator.notification.confirm(
	'Are you sure that you want to delete this game?',
	function (button) {
	    if (button == 1) {
		app.dbFortune.query(
		    'DELETE FROM ' + table.name + ' WHERE gID="' + gID + '"',
		    [],
		    app.dummyFalse,
		    app.dummyFalse
		);
	    }
	    
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
	var dispName = app.Players.ingame[idx].getDisplayName();//(app.Players.ingame[idx].displayNickname && app.Players.ingame[idx].nickname.length != 0) ? app.Players.ingame[idx].nickname : app.Players.ingame[idx].name;
	
	$('#game141SetupPlayer' + idx + 'Name').html(dispName)
                                               .data('pid', app.Players.ingame[idx].pID);
	$('#game141SetupPlayer' + idx + 'Img') .attr('src', '../../' + app.imgPlayerPath + app.Players.ingame[idx].image);
	
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
		image    = (row['Image'] !== '') ? '<img src="../../' + app.imgPlayerPath + row['Image'] + '" />' : '';
	    
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
		image    = (row['Image'] !== '') ? '<img src="../../' + app.imgPlayerPath + row['Image'] + '" />' : '';
	    
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

$(document).off('click', '#addPlayer_Submit').on('click', '#addPlayer_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#addPlayer_Name').val(),
	nickname        = $('#addPlayer_Nickname').val(),
	image           = 'playerDummy.jpg',
	isFavorite      = ($('#addPlayer_IsFavorite').val()      == "true") ? true : false,
	displayNickname = ($('#addPlayer_DisplayNickname').val() == "true") ? true : false;
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	navigator.notification.confirm('A name must consist of at least 3 characters.', function () { return true; }, 'Invalid name', 'OK');
	return false;
    }

    var newPlayer = new Player(app.dbFortune);
    newPlayer.create(name.name, nickname.name, image, isFavorite, displayNickname, false, function () {
        $('#popupNewPlayer') .popup('close');
        $('#pagePlayersList').trigger('pageshow');
    });
    return true;
});

$(document).on('popupafterclose', '#popupNewPlayer', function () {
    // reset form
    $('#addPlayer_Name')           .val('');
    $('#addPlayer_Nickname')       .val('');
    $('#addPlayer_IsFavorite')     .val('false').slider('refresh');
    $('#addPlayer_DisplayNickname').val('false').slider('refresh');
});

$(document).on('pageshow', '#pagePlayerDetails', function () {
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
	
	$('#playerDetails_HS')   .html(app.Players.tmp.hs                                        );
	$('#playerDetails_GD')   .html(parseFloat(app.Players.tmp.gd)   .toFixed(2)              );
	$('#playerDetails_Quota').html(parseFloat(app.Players.tmp.quota).toFixed(0) + '&thinsp;%');
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

$(document).on('popupafteropen', '#popupEditPlayer', function () {
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

$(document).on('popupafterclose', '#popupEditPlayer', function () {
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
	navigator.notification.confirm('A name must consist of at least 3 characters.', function () { return true; }, 'Invalid name', 'OK');
	return false;
    }
    
    app.Players.tmp.modify(['Name',     'Nickname',     'isFavorite', 'displayNickname'],
			   [ name.name,  nickname.name,  isFavorite,   displayNickname ],
    function () {
	$('#popupEditPlayer').popup('close');
    });
    return true;
});