/*
 *  MAIN PLAYER CLASS
 */
function Player () {
    var self = this;
    
    this.db = app.dbFortune;
    
    // Player properties
    this.pID 		 = -1;
    this.name 		 = '';
    this.nickname 	 = '';
    this.image 		 = '';
    this.isFavorite 	 = false;
    this.displayNickname = false;
    
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
    this.create = function (name, nickname, image, isFavorite, displayNickname, mainUser) {
	var cbSuccess = (typeof arguments[6] !== 'undefined') ? arguments[6] : app.dummyFalse,
	    cbError   = (typeof arguments[7] !== 'undefined') ? arguments[7] : app.dummyFalse;
	
	var query = new dbFortuneQuery();
	
	self.name 	     = name;
	self.nickname 	     = nickname;
	self.image 	     = image;
	self.isFavorite      = isFavorite;
	self.displayNickname = displayNickname;
	self.stats           = self.dummyStats();

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
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?)';
	
	query.add(sql,
		[name, nickname, image, isFavorite, displayNickname, self.statsToString()],
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
    this.modify = function (fields, values) {
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
    this.remove = function () {
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
    this.load = function (pID) {
	var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
	    cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
	    
	// anonymous player
	if (pID == app.ANONYMOUSPLAYERPID) {
	    self.pID = app.ANONYMOUSPLAYERPID;
	    
	    self.name            = 'Anonymous';
	    self.nickname        = '';
	    self.image           = '';
	    self.isFavorite      = false;
	    self.displayNickname = false;
	    self.stats           = self.dummyStats();
	    
	    cbSuccess();
	    return true;
	}
	
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
	    self.isFavorite      = (row['isFavorite']      == "true");
	    self.displayNickname = (row['displayNickname'] == "true");
	    self.stats           = self.stringToStats(row['Stats']);
	    
	    cbSuccess();
	    return true;
	},
	cbError);
	return true;
    }
    
    this.dummyStats = function () {
	return {
	    game141 : {
		gamesPlayed : 0,
		gamesWon    : 0,
		gamesPlayedForGD : 0,
		gamesWonForGD : 0,
		totalPoints : 0,
		totalInnings : 0,
		HS : 0,
		GD : 0.0,
		HGD : 0.0,
		quota : 0,
	    },
	    game8  : this.dummy8910Stats(),
	    game9  : this.dummy8910Stats(),
	    game10 : this.dummy8910Stats(),
	};
    }
    
    this.dummy8910Stats = function () {
	return {
	    gamesPlayed : 0,
	    gamesWon : 0,
	    racksPlayed : 0,
	    racksWon : 0,
	    totalRunouts : 0,
	    HS : 0,
	    HSRunouts : 0,
	    quota : 0,  
	};
    }
    
    this.stringToStats = function (str) {
	if (str.length > 0) {
	    return JSON.parse(str);
	} else {
	    return this.dummyStats();
	}
    }
    
    this.statsToString = function () {
	return JSON.stringify(self.stats);
    }
    
    /*
     *	Returns either name or nickname depending on whether the nickname should
     *	be used and is not empty
     */
    this.getDisplayName = function () {
	return (self.displayNickname && self.nickname.length != 0) ? self.nickname : self.name;
    }
    
    /**
     *	Force-recompute all statistics based on the games stored
     */
    this.recalculateAllStatistics = function () {
	self.stats = self.dummyStats();
	
	self.modify(
	    ['Stats'],
	    [self.statsToString()],
	    function () {
		app.dbFortune.query(
		    'SELECT gID FROM '
			+ app.dbFortune.tables.Game141.name
			+ ' WHERE isFinished=1',
		    [],
		    function (tx, results) {
			for (var i = 0; i < results.rows.length; i++) {
			    var row = results.rows.item(i);
			    
			    self.addGameToStatistics(parseInt(row['gID']), '141');
			}
		    }
		);
		
		app.dbFortune.query(
		    'SELECT gID FROM '
			+ app.dbFortune.tables.Game8910.name
			+ ' WHERE isFinished=1',
		    [],
		    function (tx, results) {
			for (var i = 0; i < results.rows.length; i++) {
			    var row = results.rows.item(i);
			    
			    self.addGameToStatistics(parseInt(row['gID']), '8910');
			}
		    }
		);
	    }
	);
    }
    
    /**
     *	Add information of a game to players' statistics
     */
    this.addGameToStatistics = function (gID, gType) {
	var cbSuccess = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse,
	    cbError   = (typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse;
	
	var tmpGame;
	
	switch (gType) {
	    case '141':
		tmpGame = new StraightPool();
		
		tmpGame.loadGame(gID, function () {
		    var idxPlayer  = (tmpGame.players[0].obj.pID == self.pID) ? 0 : 1,
			isFinished = tmpGame.isFinished,
			isWinner   = (tmpGame.winner == self.pID),
			isApplicableForGD = (   tmpGame.multiplicator[0] == 1
					     && tmpGame.multiplicator[1] == 1
					     && tmpGame.handicap[0] == 0
					     && tmpGame.handicap[1] == 0);
		    
		    if (!isFinished) {
			return;
		    }
		    
		    self.stats.game141.gamesPlayed++;
		    if (isWinner) {
			self.stats.game141.gamesWon++;
		    }
		    self.stats.game141.quota = self.stats.game141.gamesWon / self.stats.game141.gamesPlayed;
		    
		    if (isApplicableForGD) {
			self.stats.game141.gamesPlayedForGD++;
			if (isWinner) {
			    self.stats.game141.gamesWonForGD++;
			}
		    }
		    
		    self.stats.game141.totalPoints  += tmpGame.players[idxPlayer].points;
		    
		    var inningsThisGame = tmpGame.innings.length;
		    if (tmpGame.innings[tmpGame.innings.length-1].ptsToAdd[idxPlayer] != -1) {
			inningsThisGame--;
		    }
		    self.stats.game141.totalInnings += inningsThisGame;
		    
		    if (isApplicableForGD) {
			for (var i = 0; i < tmpGame.innings.length; i++) {
			    self.stats.game141.HS = Math.max(self.stats.game141.HS, tmpGame.innings[i].points[idxPlayer]);
			}
			var GDThisGame = 0;
			if (inningsThisGame != 0) {
			    GDThisGame = tmpGame.players[idxPlayer].points / inningsThisGame;
			}
			
			self.stats.game141.GD  = (self.stats.game141.GD * (self.stats.game141.gamesPlayedForGD-1) + GDThisGame) / (self.stats.game141.gamesPlayedForGD);
			self.stats.game141.HGD = Math.max(self.stats.game141.HGD, GDThisGame);
		    }
		    
		    self.modify(
			['Stats'],
			[self.statsToString()],
			cbSuccess,
			cbError
		    );
		});
		break;
	    case '8910':
		tmpGame = new Game8910();
		var stats;
		
		tmpGame.loadGame(gID, function () {
		    var idxPlayer  = (tmpGame.players[0].obj.pID == self.pID) ? 0 : 1,
			isFinished = tmpGame.isFinished,
			isWinner   = (tmpGame.winner == self.pID);
			
		    if (!isFinished) {
			return;
		    }

		    switch (tmpGame.gameType) {
			case 8:
			    stats = self.stats.game8;
			    break;
			case 9:
			    stats = self.stats.game9;
			    break;
			case 10:
			    stats = self.stats.game10;
			    break;
		    }
		    
		    stats.gamesPlayed++;
		    if (isWinner) {
			stats.gamesWon++;
		    }
		    stats.quota = stats.gamesWon / stats.gamesPlayed;
		    
		    var HS        = 0,
			HSRunouts = 0;
		    for (var i = 0; i < tmpGame.sets.length; i++) {
			for (var j = 0; j < tmpGame.sets[i].racks.length; j++) {
			    if (tmpGame.sets[i].racks[j].wonByPlayer === -1) {
				break;
			    }
			    
			    stats.racksPlayed++;
			    if (idxPlayer === tmpGame.sets[i].racks[j].wonByPlayer) {
				stats.racksWon++;
				HS++;
				
				if (tmpGame.sets[i].racks[j].runOut) {
				    stats.totalRunouts++;
				    HSRunouts++;
				} else {
				    HSRunouts = 0;
				}
			    } else {
				HS = 0;
			    }
			}
		    }
		    
		    stats.HS        = Math.max(stats.HS,        HS);
		    stats.HSRunouts = Math.max(stats.HSRunouts, HSRunouts);
		    
		    switch (tmpGame.gameType) {
			case 8:
			    self.stats.game8 = stats;
			    break;
			case 9:
			    self.stats.game9 = stats;
			    break;
			case 10:
			    self.stats.game10 = stats;
			    break;
		    }
		    
		    self.modify(
			['Stats'],
			[self.statsToString()],
			cbSuccess,
			cbError
		    );
		});
		break;
	}
    }
}