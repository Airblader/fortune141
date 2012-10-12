/*
 *  Dummies function used to avoid creating too many
 *  anonymous functions
 */
function DummyFalse () { return false; }
function DummyTrue  () { return true;  }



/*
 *  MAIN APP CLASS
 */
function app () {
    var self = this;
    
    self.dbFortune = undefined;
    self.Players   = {
	main : undefined,
    };
    
    self.updateMainUser = function () {
	// Image
	$('#indexMainUserImg').attr('src', self.Players.main.image);
	
	// Name
	var name = self.Players.main.name.split(" ");
	
	$('#pageIndex .firstName').html(name.shift());
	$('#pageIndex .lastName').html(name.join(" "));
    }
    
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


function Player () {
    var self = this;
    
    self.db = app.dbFortune;
    
    /*
     *	Player information
     */
    self.pID 		 = -1;
    self.name 		 = '';
    self.nickname 	 = '';
    self.image 		 = '';
    self.isFavorite 	 = false;
    self.displayNickname = false;
    
    /*
     *	Create a new player and add to database
     */
    self.create = function (name, nickname, image, isFavorite, displayNickname, mainUser) {
	var cbSuccess = arguments[6] || DummyFalse,
	    cbError   = arguments[7] || DummyFalse;
	
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
		    + 'VALUES (NULL, ?, ?, ?, ?, ?)';
	
	query.add(sql,
		[name, nickname, image, isFavorite, displayNickname],
		function (tx, result) {
		    self.pID = result.insertId;
		}
	);

	query.execute(cbSuccess, cbError);
    }
    
    self.load = function (pID) {
	var cbSuccess = arguments[1] || DummyFalse,
	    cbError   = arguments[2] || DummyFalse;
	
	self.db.query('SELECT * FROM ' + self.db.tables.Player.name + ' WHERE pID = "' + pID + '" LIMIT 1', [],
	function (tx, results) {
	    if (results.rows.length == 0) {
		cbError();
		return false;
	    }
	    
	    var row = results.rows.item(0);
	    
	    self.name            = row['Name'];
	    self.nickname        = row['Nickname'];
	    self.image           = row['Image'];
	    self.isFavorite      = (row['isFavorite']      == "true") ? true : false;
	    self.displayNickname = (row['displayNickname'] == "true") ? true : false;
	    
	    cbSuccess();
	    return true;
	}, cbError);
    }
}


/*
 *  Query Class
 */
function dbFortuneQuery () {
    var self = this;
    
    self.db	    = app.dbFortune.db;
    self.statements = new Array();
    
    /*
     *	Add SQL Statement to Query
     *		Takes optional parameters
     */
    self.add = function (sql) {
	var args      = arguments[1] || [],
            cbSuccess = arguments[2] || DummyFalse,
            cbError   = arguments[3] || DummyFalse;
	
	self.statements.push({
	    sql       : sql,
	    args      : args,
	    cbSuccess : cbSuccess,
	    cbError   : cbError,
	});
    }
    
    /*
     *	Execute the Query
     *		Takes optional parameters
     */
    self.execute = function () {
	var cbSuccess = arguments[0] || DummyFalse,
	    cbError   = arguments[1] || DummyFalse;
	
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
 *  Wrapper class for database interactions
 */
function dbFortune () {
    var self = this;
    
    self.dbName = 'Fortune';
    self.dbSize = 5 * 1024 * 1024;
    self.dbDesc = 'Fortune 14/1 Database';
    
    /*
     *  Definition of all WebSQL Tables created/used by the app
     */
    self.tables = {
        Player : {
                    name   : 'Player',
                    fields : new Array(
                                'pID',
                                'Name',
                                'Nickname',
                                'Image',
                                'isFavorite',
                                'displayNickname'
                             ),
                    types : new Array('INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                                      'TEXT NOT NULL',
                                      'TEXT',
                                      'TEXT',
                                      'BIT',
                                      'BIT'),
                    defaults : new Array(undefined,
                                         '""',
                                         undefined,
                                         undefined,
                                         0,
                                         0),
                 },
    };
    
    /*
     *  Opens database connection and creates all tables
     *  if they didn't exist yet
     *      - cbFirstRun    : callback function to be executed if it was a first run
     *      - cbNotFirstRun : callback function to be executed if it was NOT a first run
     *          (optional)
     */
    self.open = function (cbFirstRun) {
	// optional second argument
        var cbNotFirstRun = arguments[1] || DummyTrue;
        
        // Open Database
        self.db = window.openDatabase(self.dbName,
                                      '1.0',
                                      self.dbDesc,
                                      self.dbSize);
        
        // Check if app was opened for the first time
        self.checkForFirstRun(
            function () {
		// no tables should exist at this point anyway, but this makes sure we get a clean start
		self.dropAllTables();
		
                cbFirstRun();
            },
	    function () {
		// load main user
		app.Players.main = new Player();
		app.Players.main.load(1, cbNotFirstRun);
	    }
        );
    }
    
    /*
     *  Will perform a given string as a query
     *  Optional parameters (in this order) are
     *      - args      : Array of arguments
     *      - cbSuccess : Callback function on success
     *      - cbError   : Callback function on error
     */
    self.query = function (sql) {
	var query = new dbFortuneQuery();
	query.add(
	    sql,
	    arguments[1] || [],
	    arguments[2] || DummyFalse,
	    arguments[3] || DummyFalse
	);
	query.execute();
    }
    
    /*
     *	Returns all table fields in a string in the way it is used in queries
     *		Example: "(id, name, third_field)"
     */
    self.getTableFields_String = function (table) {
	var types    = (typeof arguments[1] !== 'undefined') ? arguments[1] : false,
	    defaults = (typeof arguments[2] !== 'undefined') ? arguments[2] : false;
	
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
    
    self.getCreateTableStatement = function (table) {	
	var sql  = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' ' + self.getTableFields_String(table, true, true);
	return sql;
    }
    
    self.createTable = function (table) {
        var cbSuccess = arguments[1] || DummyFalse,
            cbError   = arguments[2] || DummyFalse;
        
	var sql = self.getCreateTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
    }
    
    self.createAllTables = function () {
	var cbSuccess = arguments[0] || DummyFalse,
            cbError   = arguments[1] || DummyFalse;
	    
	var query = new dbFortuneQuery();
	    
	$.each(self.tables, function (name, obj) {
	    query.add( self.getCreateTableStatement(self.tables[name]) );
	});
	
	query.execute(cbSuccess, cbError);
    }
    
    self.getDropTableStatement = function (table) {
	return 'DROP TABLE IF EXISTS ' + table.name;
    }
    
    self.dropTable = function (table) {
	var cbSuccess = arguments[1] || DummyFalse,
            cbError   = arguments[2] || DummyFalse;
        
        var sql  = self.getDropTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
    }
    
    self.dropAllTables = function () {
	var cbSuccess = arguments[0] || DummyFalse,
            cbError   = arguments[1] || DummyFalse;
	
	var query = new dbFortuneQuery();
	    
	$.each(self.tables, function (name, obj) {
	    query.add( self.getDropTableStatement(self.tables[name]) );
	});
	
	query.execute(cbSuccess, cbError);
    }
    
    /*
     *  Checks whether the application is opened for the first time
     */
    self.checkForFirstRun = function (cbFirstRun, cbNotFirstRun) {
        var cbError = arguments[2];

        self.query('SELECT COUNT(*) AS firstRun FROM sqlite_master WHERE type="table" AND name="' + self.tables.Player.name + '"',
                    [],
                    
                    function (tx, res) {                // Query Success
                        var row = res.rows.item(0);
                        
                        if (parseInt(row['firstRun']) != 0) {
                            cbNotFirstRun();
                            return false;
                        }
                        
                        cbFirstRun();
                        return false;
                    },
                    function (error) {                       // Query Failure
                        if (typeof cbError !== 'undefined') {
                            cbError();
                            return false;
                        }
                        
                        cbFirstRun();
                        return false;
                    }
        );
	
	return true;
    }
}


/*
 *	INDEX
 */


/*
 *  First Run -- Main User Configuration
 */
$(document).off('click', '#firstRunMainUser_Submit').on('click', '#firstRunMainUser_Submit', function (event) {
    event.preventDefault();
    
    var name            = $('#firstRunMainUser_Name').val(),
	nickname        = $('#firstRunMainUser_Nickname').val(),
	image           = 'img/players/playerDummy.jpg',
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
        app.Players.main = new Player(app.dbFortune);
        app.Players.main.create(name.name, nickname.name, image, isFavorite, displayNickname, true, function () {
	    app.updateMainUser();
	    $('#popupFirstRunMainUser').popup('close');
	});
    });
    
    // kill this button to prevent any double-firing (we dont need it anymore anyway)
    $(document).off('click', '#firstRunMainUser_Submit');
});


/*
 *	PLAYER PROFILES
 */

$(document).on('pageshow', '#pagePlayersList', function () {
    // Create List
    // ToDo : enhance with pictures and stuff and make clickable
    var html  = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search Players..." data-dividertheme="a">';
	html += '<li data-role="list-divider">Favorites</li>';
    app.dbFortune.query('SELECT * FROM ' + app.dbFortune.tables.Player.name + ' WHERE isFavorite = "true"',
			[],
    function (tx, results1) {
	for (var i = 0; i < results1.rows.length; i++) {
	    var row   = results1.rows.item(i);
	    var image = (row['Image'] !== '') ? '<img src="' + row['Image'] + '" class="userPictureSmall" />' : '';
	    
	    html += '<li><a href="#">' + image + row['Name'] + '</a></li>';
	}
	
	html += '<li data-role="list-divider">All</li>';
	app.dbFortune.query('SELECT * FROM ' + app.dbFortune.tables.Player.name,
			    [],
	function (tx, results2) {
	    for (var i = 0; i < results2.rows.length; i++) {
		var row = results2.rows.item(i);
		
		html += '<li><a href="#">' + row['Name'] + '</a></li>';
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
	image           = 'img/players/playerDummy.jpg',
	isFavorite      = ($('#addPlayer_IsFavorite').val()      == "true") ? true : false,
	displayNickname = ($('#addPlayer_DisplayNickname').val() == "true") ? true : false;
    
    // Validation
    name     = app.validateName(name,     true );
    nickname = app.validateName(nickname, false);
    
    if (!name.valid || !nickname.valid) {
	return false;
    }

    var newPlayer = new Player(app.dbFortune);
    newPlayer.create(name.name, nickname.name, image, isFavorite, displayNickname, false, function () {
        $('#popupNewPlayer').popup('close');
        $('#pagePlayersList').trigger('pageshow');
    });
});

$(document).on('popupafterclose', '#popupNewPlayer', function () {
    // reset form
    $('#addPlayer_Name').val('');
    $('#addPlayer_Nickname').val('');
    $('#addPlayer_IsFavorite').val('false').slider('refresh');
    $('#addPlayer_DisplayNickname').val('false').slider('refresh');
});