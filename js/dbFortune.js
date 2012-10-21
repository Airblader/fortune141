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
		'HGD',
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
		'REAL',
		'REAL',
		'REAL'
	    ),
            defaults : new Array(
		undefined,
                '""',
                undefined,
                undefined,
                '0',
                '0',
		'0',
		'0',
		'0',
		'0'
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
		'Mode',
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
		'INTEGER',
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
	    ((typeof arguments[1] !== 'undefined') ? arguments[1] : []),
	    ((typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse),
	    ((typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse)
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