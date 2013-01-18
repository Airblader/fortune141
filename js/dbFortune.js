/*
 *  DATABASE CLASS
 *  	Wraps database access into a new class for stability
 */
function dbFortune () {
    var self = this;
    
    this.dbName = 'Fortune';
    this.dbSize = 5 * 1000 * 1000;
    this.dbDesc = 'Fortune 14/1 Database';
    
    /*
     *  Definition of database tables
     */
    this.tables = {
        PlayerOLD : { // outdated as of v1.0.0
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
	Player : { // included as of v1.0.0
            name : 'Player',
            fields : new Array(
                'pID',
                'Name',
                'Nickname',
                'Image',
                'isFavorite',
                'displayNickname',
		'Stats'
            ),
            types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                'TEXT NOT NULL',
                'TEXT',
                'TEXT',
                'BIT',
                'BIT',
		'TEXT'
	    ),
            defaults : new Array(
		undefined,
                '""',
                undefined,
                undefined,
                '0',
                '0',
		undefined
	    ),
        },
	Game141 : {
	    name : 'Game141',
	    fields : new Array(
		'gID',
		'Timestamp',
		'Player1',
		'Player1Name',
		'Player2',
		'Player2Name',
		'PointsPlayer1',
		'PointsPlayer2',
		'ScoreGoal',
		'MaxInnings',
		'InningsExtension',
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
		'SwitchButton',
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
		'TEXT',
		'INTEGER NOT NULL',
		'TEXT',
		'INTEGER',
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
		undefined,
		'-1',
		undefined,
		'0',
		'0',
		undefined,
		'0',
		'1',
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
		'0',
		'-1',
		undefined,
		'0',
		'0'
	    ),
	},
	Game141History : {
	    name : 'Game141History',
	    fields : new Array(
		'ID',
		'PointsPlayer1',
		'PointsPlayer2',
		'InningsPlayer1',
		'InningsPlayer2',
		'FoulsPlayer1',
		'FoulsPlayer2',
		'BallsOnTable',
		'CurrPlayer',
		'FirstShot',
		'SwitchButton'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'INTEGER',
		'INTEGER',
		'TEXT',
		'TEXT',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'BIT',
		'BIT'
	    ),
	    defaults : new Array(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	    ),
	},
	Game141Profile : {
	    name : 'Game141Profile',
	    fields : new Array(
		'ID',
		'Name',
		'ScoreGoal',
		'MaxInnings',
		'InningsExtension',
		'HandicapPlayer1',
		'HandicapPlayer2',
		'MultiplicatorPlayer1',
		'MultiplicatorPlayer2',
		'GameMode',
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
		'INTEGER',
		'INTEGER',
		'INTEGER'
	    ),
	    defaults : new Array(
		undefined,
		'"PROFILE"',
		undefined,
		'0',
		'1',
		'0',
		'0',
		'1',
		'1',
		undefined,
		'0'
	    ),
	},
	Game8910 : {
	    name : 'Game8910',
	    fields : new Array(
		'gID',
		'gameType',
		'StartTimestamp',
		'EndTimestamp',
		'Player1Name',
		'Player2Name',
		'Player1',
		'Player2',
		'CurrPlayer',
		'NumberOfSets',
		'RacksPerSet',
		'Score',
		'TempScore',
		'FoulsPlayer1',
		'FoulsPlayer2',
		'breakType',
		'firstBreak',
		'Mode',
		'isFinished',
		'Winner',
		'Comment',
		'isUploaded',
		'isReadyForDeletion',
		'Shotclock',
		'ExtensionTime',
		'ExtensionsPerRack',
		'ShotclockUseSound',
		'ExtensionsCalledPlayer1',
		'ExtensionsCalledPlayer2'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'INTEGER',
		'TEXT',
		'TEXT',
		'TEXT',
		'TEXT',
		'INTEGER NOT NULL',
		'INTEGER NOT NULL',
		'BIT',
		'INTEGER',
		'INTEGER',
		'TEXT',
		'TEXT',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'INTEGER',
		'TEXT',
		'BIT',
		'BIT',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'INTEGER',
		'INTEGER'
	    ),
	    defaults : new Array(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		'-1',
		'-1',
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	    ),
	},
	Game8910History : {
	    name : 'Game8910History',
	    fields : new Array(
		'ID',
		'Score',
		'FoulsPlayer1',
		'FoulsPlayer2',
		'CurrPlayer',
		'ExtensionsCalledPlayer1',
		'ExtensionsCalledPlayer2'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'TEXT',
		'INTEGER',
		'INTEGER',
		'BIT',
		'INTEGER',
		'INTEGER'
	    ),
	    defaults : new Array(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	    )
	},
	Game8910Profile : {
	    name : 'Game8910Profile',
	    fields : new Array(
		'ID',
		'Name',
		'GameType',
		'BreakType',
		'NumberOfSets',
		'RacksPerSet',
		'Shotclock',
		'ExtensionTime',
		'ExtensionsPerRack',
		'ShotclockUseSound',
		'GameMode',
		'Usage'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'TEXT',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'INTEGER',
		'BIT',
		'INTEGER',
		'INTEGER'
	    ),
	    defaults : new Array(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	    )
	},
	GameModes : {
	    name : 'GameModes',
	    fields : new Array(
		'ID',
		'Name'
	    ),
	    types : new Array(
		'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
		'TEXT'
	    ),
	    defaults : new Array(
		undefined,
		'""'
	    ),
	}
    };
    
    /*
     *	Opens the database connection and checks whether this is the first time
     *	the connection was made (e.g. the app was started). If this is not the
     *	case, this function also loads the main player
     *		cbFirstRun               : callback function if it was the first start
     *		cbNotFirstRun (optional) : callback function if it was *not* the first start
     */
    this.open = function (cbFirstRun) {
        var cbNotFirstRun = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyTrue;
        
        self.db = window.openDatabase(self.dbName, '', self.dbDesc, self.dbSize);
	
	var Migrator = new dbFortuneMigrator();
	Migrator.init(self.db);
	
	// TODO This is for forcing new installation. Obviously this shouldnt stay here forever...
	/*if (window.localStorage.getItem('requireNewInstallation1') !== '0'
	    && Migrator.getCurrentVersion() !== 0) {
	    app.alertDlg(
		'Please do a complete reinstall of this app first!',
		navigator.app.exitApp,
		'Update',
		'OK'
	    );
	    return;
	}*/
	
	// Initial installation setup
	Migrator.addMigration(
	    1,
	    function (tx) {
		// drop all tables (just to be safe)
		$.each(self.tables, function (name, obj) {
		    tx.executeSql( self.getDropTableStatement(self.tables[name]) );
		});
		
		tx.executeSql( self.getCreateTableStatement(self.tables['PlayerOLD'])      );
		
		tx.executeSql( self.getCreateTableStatement(self.tables['Game141'])        );
		tx.executeSql( self.getCreateTableStatement(self.tables['Game141History']) );
		tx.executeSql( self.getCreateTableStatement(self.tables['Game141Profile']) );
		
		tx.executeSql( self.getCreateTableStatement(self.tables['Game8910'])       );
		tx.executeSql( self.getCreateTableStatement(self.tables['Game8910History']));
		tx.executeSql( self.getCreateTableStatement(self.tables['Game8910Profile']));
		
		tx.executeSql( self.getCreateTableStatement(self.tables['GameModes'])      );
		
		// Fill with default game profiles
		tx.executeSql(
		    'INSERT INTO '
			+ app.dbFortune.tables.Game141Profile.name + ' '
			+ app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141Profile)
			+ ' VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		    ['Default', 60, 0, 1, 0, 0, 1, 1, 0, 0]
		);
		tx.executeSql(
		    'INSERT INTO '
			+ app.dbFortune.tables.Game8910Profile.name + ' '
			+ app.dbFortune.getTableFields_String(app.dbFortune.tables.Game8910Profile)
			+ ' VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		    ['Default', 9, 0, 1, 5, 0, 30, 1, 1, 0, 0]
		);
		
		// Fill with default game modes
		tx.executeSql(
		    'INSERT INTO '
			+ app.dbFortune.tables.GameModes.name + ' '
			+ app.dbFortune.getTableFields_String(app.dbFortune.tables.GameModes)
			+ ' VALUES (NULL, ?)',
		    ['Practice Game']
		);
		tx.executeSql(
		    'INSERT INTO '
			+ app.dbFortune.tables.GameModes.name + ' '
			+ app.dbFortune.getTableFields_String(app.dbFortune.tables.GameModes)
			+ ' VALUES (NULL, ?)',
		    ['League Game']
		);
		
		//window.localStorage.setItem('requireNewInstallation1', '0');
	    }
	);
	
	// switch to new statistics system
	Migrator.addMigration(
	    2,
	    function (tx) {
		// Step 1: Rename old players table
		tx.executeSql(
		    'ALTER TABLE '
			+ app.dbFortune.tables.PlayerOLD.name
			+ ' RENAME TO Player_outdated'
		);
	    }
	);
	
	Migrator.addMigration(
	    3,
	    function (tx) {
		// Step 2: Create new players table
		tx.executeSql(
		    self.getCreateTableStatement( self.tables['Player'] )
		);
	    }
	);
	
	Migrator.addMigration(
	    4,
	    function (tx) {	
		// Step 3: Migrate data
		tx.executeSql(
		    'INSERT INTO '
			+ app.dbFortune.tables.Player.name
			+ ' SELECT pID, Name, Nickname, Image, isFavorite, displayNickname, "" FROM Player_outdated'
		);
	    }
	);
	  
	Migrator.addMigration(
	    5,
	    function (tx) {  
		// Step 4: Delete old table
		tx.executeSql(
		    'DROP TABLE Player_outdated'
		);
	    }
	);
	
	
	Migrator.start(
	    function (initialVersion) {
		switch (initialVersion) {
		    case 0:
			app.tooltips.resetAll();
			cbFirstRun();
			
			break;
		    default:
			app.Players.main = new Player();
			app.Players.main.load(
			    1,
			    cbNotFirstRun
			);
			
			break;
		}
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
    this.query = function (sql) {
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
    this.getTableFields_String = function (table) {
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
    this.getCreateTableStatement = function (table) {	
	var sql  = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' ' + self.getTableFields_String(table, true, true);
	return sql;
    }
    
    /*
     *	Creates a table
     *		table                 : table to create
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.createTable = function (table) {
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
    this.createAllTables = function () {
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
    this.getDropTableStatement = function (table) {
	return 'DROP TABLE IF EXISTS ' + table.name;
    }
    
    /*
     *	Deletes a table from the database
     *		table                 : table to drop
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.dropTable = function (table) {
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
    this.dropAllTables = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
            cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	var query = new dbFortuneQuery();
	    
	$.each(self.tables, function (name, obj) {
	    query.add( self.getDropTableStatement(self.tables[name]) );
	});
	
	query.execute(cbSuccess, cbError);
    }
}