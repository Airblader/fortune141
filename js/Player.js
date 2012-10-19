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