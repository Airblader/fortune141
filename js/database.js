/*
 *  Dummies function used to avoid creating too many
 *  anonymous functions
 */
function DummyFalse () { return false; }
function DummyTrue  () { return true;  }


function Player (database) {
    var self = this;
    
    self.db = database;
    
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
    self.create = function (name, nickname, image, isFavorite, displayNickname) {
	var mainUser = (typeof arguments[5] !== 'undefined') ? arguments[5] : false,
	    query    = new dbFortuneQuery(self.db.db);
	    
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
	
	query.execute();
    }
    
    self.load = function (pID) {
	// ToDo
    }
}

/*
 *  Query Class
 */
function dbFortuneQuery (database) {
    var self = this;
    
    self.db	    = database;
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
                // Create Tables if neccessary
                self.createTable(self.tables.Player, function () {
                    //
                }, function (error) {
                    console.log('Error [dbFortune.checkForFirstRun]: ' + error.message + ' (Code: ' + error.code + ')');
                });
                
                cbFirstRun();
            },
            cbNotFirstRun
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
	var query = new dbFortuneQuery(self.db);
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
        var cbSuccess = arguments[1] || undefined,
            cbError   = arguments[2] || undefined;
        
	var sql = self.getCreateTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
    }
    
    self.getDropTableStatement = function (table) {
	return 'DROP TABLE IF EXISTS ' + table.name;
    }
    
    self.dropTable = function (table) {
	var cbSuccess = arguments[1] || undefined,
            cbError   = arguments[2] || undefined;
        
        var sql  = self.getDropTableStatement(table);
        self.query(sql, [], cbSuccess, cbError);
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
