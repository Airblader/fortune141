/*
 *  Wrapper class for database interactions
 */
function dbFortune () {
    var self = this;
    
    self.dbName = 'Fortune';
    self.dbSize = 5 * 1024 * 1024;
    self.dbDesc = 'Fortune 14/1 Database';
    
    // Use localStorage to check for first run?
    self.localStorage_useForCheck = false;
    self.localStorage_hadFirstRun = "hadFirstRun";
    
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
        var cbNotFirstRun = arguments[1] || function () { return true; };
        
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
                    window.localStorage.setItem(self.localStorage_hadFirstRun, "true");  
                }, function (error) {
                    // Error
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
    self.query = function (query) {
        var args      = arguments[1] || [],
            cbSuccess = arguments[2] || function () { },
            cbError   = arguments[3] || function () { };

        self.db.transaction(function (tx) {
            tx.executeSql(query, args, cbSuccess, cbError);
        });
    }
    
    
    self.createTable = function (table) {
        var cbSuccess = arguments[1] || undefined,
            cbError   = arguments[2] || undefined;
        
        var sql  = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (';
        for (var i = 0; i < table.fields.length; i++) {
            sql += table.fields[i] + ' ' + table.types[i];
            
            if (typeof table.defaults[i] !== 'undefined') {
                sql += ' DEFAULT ' + table.defaults[i];
            }
            
            sql += (i == table.fields.length-1) ? '' : ', ';
        }
        sql += ')';
        
        self.query(sql, [], cbSuccess, cbError);
    }
    
    /*
     *  Checks whether the application is opened for the first time
     */
    self.checkForFirstRun = function (cbFirstRun, cbNotFirstRun) {
        var cbError = arguments[2];
        
        // For simplicity reasons, we first check the HTML5 LocalStorage
        if (self.localStorage_useForCheck && window.localStorage.getItem(self.localStorage_hadFirstRun) === "true") {
            cbNotFirstRun();
            return false;
        }
        
        // If it gets here, localStorage check wasn't successful, so let's get more nifty and
        // see whether the Players table exists
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
    }
    
    /*
     *  
     */
    self.queryMainUser = function () {
        
    }
}