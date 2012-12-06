/*
 *  BALLRACK CLASS
 *  	This class handles the visual ball rack for straight pool games
 */
function BallRack () {
    var self = this;
    
    // debugMode:
    //	true  : for usage on computers (mouse events)
    //  false : for usage on mobile devices (touch events)
    this.debugMode = app.debugMode;
    
    // size for the div containing the rack
    var divWidth,
        divHeight = 0;
    
    this.ballsOnTable = 15;
    this.selectedBall = this.ballsOnTable;
    
    this.ballSizeSmall = 60;
    
    var ballPositions = new Array();
    
    // caching for better performance
    var $balls   = new Array(16),
	$shadows = new Array(16);
    for (var i=0; i<=15; i++) {
	$balls[i]   = $('#ball'   + i);
	$shadows[i] = $('#shadow' + i);
    }
    
    if (this.debugMode) {
        var touchCommands = "mousedown";
    } else {
        var touchCommands = 'touchstart touchmove touchend';
    }
    
    /*
     *	Calculate the ball positions.
     */
    this.calcBallPositions = function () {
	// we only need to calculate these positions once
        if (ballPositions.length > 0) {
            return;
        }
        
	// defines after which balls in a rack a new row begins
        var idxRowBreaks = new Array(2, 4, 7, 11);
    
        var ballRadiusSmall = self.ballSizeSmall/2;
        
        var stepX = self.ballSizeSmall,
            stepY = Math.ceil(ballRadiusSmall * Math.sqrt(3));
            
        var currX = 2 * stepX + ballRadiusSmall,
            currY = ballRadiusSmall;
            
	// the 0-th ball will be the cue ball, but its position depends on other balls'
	// positions, so we just create a dummy entry for it for now
        ballPositions.push({x: 0, y: 0});
	
        for (var i=1; i<=15; i++) {
	    // check whether we have to begin a new row
            var idxOf = idxRowBreaks.indexOf(i);
            if (idxOf != -1) {
                currX  = 2 * stepX - idxOf * ballRadiusSmall;
                currY += stepY;
            }
            
            ballPositions.push({x: currX, y: currY});
            currX += stepX;
        }
        
        // we can now position the 0-th ball
        ballPositions[0].x = ballPositions[11].x + ballRadiusSmall/2;
        ballPositions[0].y = (ballPositions[2].y + ballPositions[1].y)/2;
        
	// size of the div containing the rack
        divWidth  = 4 * stepX + self.ballSizeSmall;
        divHeight = self.ballSizeSmall + 4 * stepY;
    }
    
    /*
     *	Sets up the balls into the right positions
     */
    this.drawRack = function () {
	// first we set up the surrounding div element
        $('#ballRack').css('width',       divWidth      + 'px')
                      .css('height',      divHeight     + 'px')
                      .css('left',        '50'          + '%' )
                      .css('margin-left', (-divWidth/2) + 'px');
        
	// this factor defines how much the shadow is spread around the balls
	var shadowFactor = 1.35;
	
        for (var i = 0; i <= 15; i++) {
            $balls[i].css('position',      'absolute'                  )
		     .css('width',         self.ballSizeSmall    + 'px')
		     .css('height',        self.ballSizeSmall    + 'px')
		     .css('margin-left', (-self.ballSizeSmall/2) + 'px')
		     .css('margin-top',  (-self.ballSizeSmall/2) + 'px')
		     .css('left',          ballPositions[i].x    + 'px')
		     .css('top',           ballPositions[i].y    + 'px'); 

            $shadows[i].css('position',      'absolute'                               )
		       .css('width',         shadowFactor*self.ballSizeSmall    + 'px')
		       .css('height',        shadowFactor*self.ballSizeSmall    + 'px')
		       .css('margin-left', (-shadowFactor*self.ballSizeSmall/2) + 'px')
		       .css('margin-top',  (-shadowFactor*self.ballSizeSmall/2) + 'px')
		       .css('left',          ballPositions[i].x                 + 'px')
		       .css('top',           ballPositions[i].y                 + 'px'); 
        }
    }
    
    /*
     *	Update a ball in the rack according to its state
     *		idx               : index of the ball
     *		active (optional) : whether the ball is active or inactive (defaults to true)
     */
    this.setActiveBall = function (idx) {
        var active = true;
        if (typeof arguments[1] !== 'undefined') {
            active = arguments[1];
        }
	
        var opacity = (active) ? '1.0' : '0.4';
        $balls[idx].css('opacity', opacity);
		
	if (active) {
	    $shadows[idx].addClass('ballShadow');
	} else {
	    $shadows[idx].removeClass('ballShadow');
	}
    }
    
    /*
     *	Update all balls
     */
    this.redraw = function() {
        for (var i = 0; i <= 15; i++) {
            var isActive = false;
            if (i <= self.selectedBall) {
                isActive = true;
            }
            
            self.setActiveBall(i, isActive);
        }
    }
    
    /*
     *	Activate touch events
     */
    this.setHandler = function () {
	$('body').on(touchCommands, '#ballRack', self.ballSelectHandler);
    }

    /*
     *	Deactivate touch events
     */
    this.unsetHandler = function () {
        $('body').off(touchCommands, '#ballRack');
    }
    
    /*
     *	This function deals with the user clicking on any ball of the rack,
     *	determines which ball was clicked and redraws the rack accordingly.
     *	It also checks if the click was legal (clicked ball is accessible)
     */
    this.ballSelectHandler = function (event) {
        event.preventDefault();
	
	// Bugfix : Android devices require us to unset the handler in order to allow
	//          dragging the finger across the screen. Otherwise the touch coordinates
	//          won't be updated during the movement.
        self.unsetHandler();
        
	// depending on mouse or touch events we need to access the coordinates differently
	var base = (self.debugMode) ? event : (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]),
	    x    = base.pageX,
	    y    = base.pageY;
        
	// figure out which ball was clicked
        var currElement = document.elementFromPoint(x, y),
	    id          = $(currElement).attr('id');
	
        // check if it was actually a ball that was clicked
        if (typeof id !== 'undefined' && id.substr(0, 4) == 'ball') {
	    // either use the selected ball (if accessible) or the highest accessible ball
            self.selectedBall = (parseInt(id.substr(4)) <= self.ballsOnTable) ? parseInt(id.substr(4)) : self.ballsOnTable;
        }
        
        self.redraw();
        
	// Bugfix : Undo what we did above
        self.setHandler();
    }
}

/*
 *  STRAIGHT POOL CLASS
 *  	This class handles straight pool games
 */
function StraightPool () {
    var self = this;
    
    var $page = $('#pageGame141'),
	$activePlayer = $('#activePlayer'),
	
	$btnAccept = $('#usrAccept'),
	$btnFoul = $('#usrFoulDisplay'),
	$btnSafety = $('#usrSafeDisplay'),
	$btnPlayerSwitch = $('#playerSwitch'),
	$btnUndo = $('#btnDetailsUndo'),
	
	$detailsPanel = $('#panelDetails'),
	$panelRackAndMenu = $('#panelRackAndMenu'),
	
	$ptsPlayer = new Array($('#ptsPlayer0'), $('#ptsPlayer1')),
	
	$foulDisplay = $('#foulDisplay'),
	$foulDisplayName = $('#foulDisplayName'),
	
	$safetyDisplay = $('#safetyDisplay'),
	
	$ballRack = $('#ballRack'),
	
	$popupSevereFoul       = $('#popupSevereFoul'),
	$popupSevereFoulPoints = $('#popupSevereFoulPoints'),
	$popupSevereFoulRerack = $('#popupSevereFoulRerack');
    
    
    this.debugMode = app.debugMode;
    
    this.gameID       = -1;
    this.historyStack = new Array();
    
    var btnAcceptPressed = false,
        yesno            = new Array("Yes", "No");
    
    /*
     *	Returns a dummy object for a player
     */
    this.dummyPlayer = function () {
        return {
	    fouls : 0,
            points: 0,
	    obj   : undefined,	// holds the Player object
        };
    }
    
    /*
     *	Returns a dummy objects for an inning
     */
    this.dummyInning = function () {
        return {
            number   : 1,				// number of the inning
            points   : new Array(0, 0),			// points made in this inning
            foulPts  : new Array(0, 0),			// foul points in this inning
            ptsToAdd : new Array(0, 0),			// unprocessed/non-final points
            safety   : new Array(false, false),		// whether this inning ended in a safety
        };
    }
    
    /*
     *	Initizalize a new game by resetting variables
     */
    this.initNewGame = function (scoreGoal, maxInnings, inningsExtension, mode, handicap, multiplicator) {
	var cbSuccess = (typeof arguments[6] !== 'undefined') ? arguments[6] : app.dummyFalse;
	
        self.players         = new Array(self.dummyPlayer(),
					 self.dummyPlayer());
        self.currPlayer      = 0;
        self.innings         = new Array(self.dummyInning());
	
	self.players[0].points = handicap[0];
	self.players[1].points = handicap[1];
	
	self.scoreGoal        = scoreGoal;
	self.maxInnings       = maxInnings;
	self.inningsExtension = inningsExtension;
	self.handicap         = handicap;
	self.multiplicator    = multiplicator;
	self.mode	      = mode;
	self.isFinished       = false;
	self.winner           = -1;
	
	self.timestamp = Math.floor(Date.now() / 1000).toFixed(0);
	
	self.firstShot = true;
	
	self.switchButton = true;
	$btnPlayerSwitch.css('display', 'block');
	
	self.ballRack = new BallRack();
	self.ballRack.redraw();
	
	self.initHistory(cbSuccess);
    }
    
    /*
     *	Add a new inning to the game and set it up right
     */
    this.newInning = function () {
        // if last inning wasn't processed correctly, we throw an error
        var current = self.innings.length-1;
        if (self.innings[current].ptsToAdd[0] != -1 || self.innings[current].ptsToAdd[1] != -1) {
            throw new Error('StraightPool.newInning : Cannot create new inning. Last inning has unprocessed points!');
        }
        
        var inning    = self.dummyInning();
        inning.number = self.innings.length + 1;
        
        self.innings.push(inning);
    }
    
    /*
     *	Loads players from app.currentGame into the game
     */
    this.setPlayers = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
	  
	self.players[0].obj = new Player();
	self.players[1].obj = new Player();
	    
	self.players[0].obj = app.Players.ingame[0];
	self.players[1].obj = app.Players.ingame[1];
	
	cbSuccess();
    }
    
    /*
     *	Defines what action to take when the current player already has two fouls and needs to be warned
     */
    this.warnConsecutiveFouls = function () {
	app.alertDlg(
	    'You\'re already up to two consecutive fouls. If you foul on this inning, you will get an additional 15 points penalty.\r\n\r\n' +
            'If this applies to your opponent and not to you, you should now inform him about this.',
	    app.dummyFalse,
	    'Warning!',
	    'OK'
	);
    }
    
    /*
     *	Leaving the game
     */
    this.warnLeaveGame = function () {
	app.confirmDlg(
	    'If you leave this game, you will be able to resume it, but any actions prior to this point cannot be undone anymore. Are you sure you want to leave?',
	    function () {
		app.dbFortune.dropTable(app.dbFortune.tables.Game141History);
		$.mobile.changePage('../../index.html');
		return true;
	    },
	    app.dummyFalse,
	    'Leave Game',
	    'Yes,No'
	);
    }
    
    /*
     *	Switch the current player and check for potencially needed 3-foul-rule warning
     */
    this.switchPlayer = function () {
        self.currPlayer = (self.currPlayer == 0) ? 1 : 0;
		
	// trigger 3-foul-rule warning if needed
	if (self.players[self.currPlayer].fouls == 2) {
	    self.warnConsecutiveFouls();
	}
    }
    
    /*
     *	Undo last action
     *		callback (optional) : callback function
     */
    this.undo = function () {
	var callback = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
	
	self.loadHistory(
	    callback,
	    function () {
		app.alertDlg(
		    'Sorry, the last action couldn\'t be undone!',
		    app.dummyFalse,
		    'Error',
		    'OK'
		);
	    }
	);
    }
    
    /*
     *	Converts innings into a string used in the database.
     *	The format is X,X,X,X;X,X,X,X;X,X,X,X;... -- the numbers, in this order,
     *	stand for points, fouls, ptsToAdd and whether the inning ended in a safety.
     */
    this.inningsToString = function () {
	var inning = new Array('', '');
	
	for (var i = 0; i < self.innings.length; i++) {
	    inning[0] +=   self.innings[i].points[0]               + ','
	              +    self.innings[i].foulPts[0]              + ','
		      +    self.innings[i].ptsToAdd[0]             + ','
		      +  ((self.innings[i].safety[0]) ? '1' : '0') + ';';
		      
	    inning[1] +=   self.innings[i].points[1]               + ','
	              +    self.innings[i].foulPts[1]              + ','
		      +    self.innings[i].ptsToAdd[1]             + ','
		      +  ((self.innings[i].safety[1]) ? '1' : '0') + ';';
	}
	// remove trailing ';'
	inning[0] = inning[0].slice(0, -1);
	inning[1] = inning[1].slice(0, -1);
	
	return inning;
    }
    
    /*
     *	Converts two strings from the database into an array of innings
     *		str1,
     *		str2 : strings to convert (resp. player 1 & 2)
     */
    this.stringToInnings = function (str1, str2) {
	// first we separate into the innings
	var innings1 = str1.split(';'),
	    innings2 = str2.split(';'),
	    ret      = new Array(innings1.length);
	    
	// now we fill our array
	for (var i = 0; i < ret.length; i++) {
	    var data1 = innings1[i].split(',') || new Array('0', '0', '0', '0'),
		data2 = innings2[i].split(',') || new Array('0', '0', '0', '0');
	    
	    ret[i]             = self.dummyInning();
	    ret[i].number      = i+1;
	    
	    ret[i].points[0]   = parseInt(data1[0]);
	    ret[i].points[1]   = parseInt(data2[0]);
	    
	    ret[i].foulPts[0]  = parseInt(data1[1]);
	    ret[i].foulPts[1]  = parseInt(data2[1]);
	    
	    ret[i].ptsToAdd[0] = parseInt(data1[2]);
	    ret[i].ptsToAdd[1] = parseInt(data2[2]);
	    
	    ret[i].safety[0]   = (parseInt(data1[3]) == 1);
	    ret[i].safety[1]   = (parseInt(data2[3]) == 1);
	}
	
	return ret;
    }
    
    /*
     *	Loads a game
     *		gID                   : game ID to load
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.loadGame = function (gID) {
	var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
            cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
	
        self.gameID = gID;
	
	var sql = 'SELECT * FROM ' + app.dbFortune.tables.Game141.name + ' WHERE gID="' + gID + '" LIMIT 1';
	app.dbFortune.query(sql, [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    cbError();
		    return false;
		}
		
		var row = result.rows.item(0);
		
		self.scoreGoal        = parseInt(row['ScoreGoal']);
		self.maxInnings       = parseInt(row['MaxInnings']);
		self.inningsExtension = parseInt(row['InningsExtension']);
		self.handicap         = new Array(
					    parseInt(row['HandicapPlayer1']),
					    parseInt(row['HandicapPlayer2'])
				        );
		self.multiplicator    = new Array(
					    parseInt(row['MultiplicatorPlayer1']),
					    parseInt(row['MultiplicatorPlayer2'])
				        );
		
		self.firstShot       = (parseInt(row['FirstShot'])    == 1);
		self.switchButton    = (parseInt(row['SwitchButton']) == 1);
		self.isFinished      = (parseInt(row['isFinished'])   == 1);
		self.mode            =  parseInt(row['Mode']);
		self.winner          =  parseInt(row['Winner']);
		self.timestamp       =  parseInt(row['Timestamp']);
		
		self.players = new Array(self.dummyPlayer(),
					 self.dummyPlayer());
		
		self.players[0].points = parseInt(row['PointsPlayer1']);
		self.players[0].fouls  = parseInt(row['FoulsPlayer1']);
		
		self.players[1].points = parseInt(row['PointsPlayer2']);
		self.players[1].fouls  = parseInt(row['FoulsPlayer2']);
		
		self.currPlayer = parseInt(row['CurrPlayer']);
		self.innings    = self.stringToInnings(row['InningsPlayer1'],
						       row['InningsPlayer2']);
		
		self.ballRack              = new BallRack();
		self.ballRack.ballsOnTable = parseInt(row['BallsOnTable']);
		self.ballRack.selectedBall = self.ballRack.ballsOnTable;

		self.ballRack.redraw();
		
		$btnPlayerSwitch.css('display', 'none');
		if (self.switchButton) {
		    $btnPlayerSwitch.css('display', 'block');
		}
		
		app.Players.ingame[0] = new Player();
		app.Players.ingame[1] = new Player();
		
		app.Players.ingame[0].load(
		    parseInt(row['Player1']),
		    function () {
			if (app.Players.ingame[0].pID == app.ANONYMOUSPLAYERPID) {
			    app.Players.ingame[0].name = row['Player1Name'];
			}
			app.Players.ingame[1].load(
			    parseInt(row['Player2']),
			    function () {
				if (app.Players.ingame[1].pID == app.ANONYMOUSPLAYERPID) {
				    app.Players.ingame[1].name = row['Player2Name'];
				}
				self.setPlayers(
				    function () {
					self.initHistory(cbSuccess);
				    }
				);
			    }
			);
		    }
		);
		
		return true;
	    },
	    cbError
	);
    }
    
    /*
     *	Saves game to database. If the game already exists, the database entry is modified,
     *	otherwise a new entry will be created.
     *		cbSuccess (optional) : callback function
     */
    this.saveGame = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
	
	// no entry exists yet
	if (self.gameID == -1) {
	    var sql = 'INSERT INTO '
		    + app.dbFortune.tables.Game141.name + ' '
		    + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141, false, false) + ' '
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	    
	    var strInnings = self.inningsToString(); 
		
	    app.dbFortune.query(
		sql,
		[self.timestamp,
		 self.players[0].obj.pID,
		 self.players[0].obj.getDisplayName(),
		 self.players[1].obj.pID,
		 self.players[1].obj.getDisplayName(),
		 self.players[0].points,
		 self.players[1].points,
		 self.scoreGoal,
		 self.maxInnings,
		 self.inningsExtension,
		 self.handicap[0],
		 self.handicap[1],
		 self.multiplicator[0],
		 self.multiplicator[1],
		 strInnings[0],
		 strInnings[1],
		 self.players[0].fouls,
		 self.players[1].fouls,
		 self.ballRack.ballsOnTable,
		 self.currPlayer,
		(self.firstShot) ? 1 : 0,
		(self.switchButton) ? 1 : 0,
		 Number(self.mode),
		(self.isFinished) ? 1 : 0,
		 self.winner,
		 '',
		 0,
		 0
		],
		function (tx, result) {
		    self.gameID = result.insertId;
		    cbSuccess();
		},
		app.dummyFalse
	    );
	    
	    return true;
	}
	
	// modify existing entry
	var sql = 'UPDATE ' + app.dbFortune.tables.Game141.name + ' SET '
		+ 'HandicapPlayer1=?, HandicapPlayer2=?, MultiplicatorPlayer1=?, MultiplicatorPlayer2=?, '
	        + 'InningsPlayer1=?, InningsPlayer2=?, PointsPlayer1=?, PointsPlayer2=?, '
		+ 'FoulsPlayer1=?, FoulsPlayer2=?, BallsOnTable=?, CurrPlayer=?, FirstShot=?, SwitchButton=?, isFinished=?, Winner=? '
		+ 'WHERE gID="' + self.gameID + '"';
		
	var strInnings = self.inningsToString();
		
	app.dbFortune.query(
	    sql,
	    [self.handicap[0],
	     self.handicap[1],
	     self.multiplicator[0],
	     self.multiplicator[1],
	     strInnings[0],
	     strInnings[1],
	     self.players[0].points,
	     self.players[1].points,
	     self.players[0].fouls,
	     self.players[1].fouls,
	     self.ballRack.ballsOnTable,
	     self.currPlayer,
	    (self.firstShot) ? 1 : 0,
	    (self.switchButton) ? 1 : 0,
	    (self.isFinished) ? 1 : 0,
	     self.winner
	    ],
	    cbSuccess,
	    app.dummyFalse
	);
	return true;
    }
    
    /*
     *	Initialize table for history
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.initHistory = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	    
	// simply drop and recreate table
	app.dbFortune.dropTable(
	    app.dbFortune.tables.Game141History,
	    function () {
		app.dbFortune.createTable(
		    app.dbFortune.tables.Game141History,
		    cbSuccess,
		    cbError
		);
	    },
	    cbError
	);
    }
    
    /*
     *	Restore game state from temporary database
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.loadHistory = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	if (self.historyStack.length <= 1) {
	    cbError();
	    return;
	}
	var id = self.historyStack.pop();
	    id = self.historyStack[self.historyStack.length-1];
	
	app.dbFortune.query(
	    'SELECT * FROM ' + app.dbFortune.tables.Game141History.name + ' WHERE ID="' + id + '" LIMIT 1',
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		var row = result.rows.item(0);
		
		self.players[0].points = parseInt(row['PointsPlayer1']);
		self.players[1].points = parseInt(row['PointsPlayer2']);
		
		self.players[0].fouls = parseInt(row['FoulsPlayer1']);
		self.players[1].fouls = parseInt(row['FoulsPlayer2']);
		
		self.innings = self.stringToInnings(row['InningsPlayer1'],
						    row['InningsPlayer2']);
		
		self.currPlayer   =  parseInt(row['CurrPlayer']);
		self.firstShot    = (parseInt(row['FirstShot'])    == 1);
		self.switchButton = (parseInt(row['SwitchButton']) == 1);
		
		$btnPlayerSwitch.css('display', 'none');
		if (self.switchButton) {
		    $btnPlayerSwitch.css('display', 'block');
		}
		
		self.ballRack.ballsOnTable = parseInt(row['BallsOnTable']);
		self.ballRack.selectedBall = self.ballRack.ballsOnTable;
		self.ballRack.redraw();
		
		self.updateScoreDisplay();
		self.updateConsecutiveFoulsDisplay();
		self.setActivePlayerMarker(self.currPlayer);
		
		self.saveGame();
		cbSuccess();
		return true;
	    },
	    cbError
	);
    }
    
    /*
     *	Save current game state to temporary database
     */
    this.saveHistory = function () {
	var sql = 'INSERT INTO '
		    + app.dbFortune.tables.Game141History.name + ' '
		    + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141History, false, false) + ' '
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	
	var strInnings = self.inningsToString();	    
	    
	app.dbFortune.query(
	    sql,
	    [self.players[0].points,
	     self.players[1].points,
	     strInnings[0],
	     strInnings[1],
	     self.players[0].fouls,
	     self.players[1].fouls,
	     self.ballRack.ballsOnTable,
	     self.currPlayer,
	     Number(self.firstShot),
	     Number(self.switchButton)
	    ],
	    function (tx, result) {
		self.historyStack.push(result.insertId);
	    },
	    app.dummyFalse
	);
    }
    
    /*
     *	Sets the foul display
     *		fouls                : number of foul points the display should be set to
     *		firstShot (optional) : whether the current inning started with a first shot situation
     *		                       (defaults to false)
     *		severe (optional)    : whether the foul is severe
     *		                       (defaults to false)
     */
    this.setFoulDisplay = function (fouls) {
	var firstShot = (typeof arguments[1] !== 'undefined') ? arguments[1] : false,
	    severe    = (typeof arguments[2] !== 'undefined') ? arguments[2] : false,
	    maxFouls  = Number(firstShot) + 1,
	    foulCount = (severe) ? fouls : (fouls % (maxFouls+1));
    
	var foulName = "None";
	if (foulCount == 1 && !severe) {
	    foulName = "Normal";
	    $foulDisplayName.data('rerack', false);
	}
	else if (foulCount > 1 || severe) {
	    foulName = "Severe";
	    
	    // Setting rerack to true might not always be technically correct, as a player after
	    // a first shot foul has a choice. However, there will be 15 balls on the table anyway,
	    // so this won't have an effect on that situation
	    $foulDisplayName.data('rerack', true);
	} else {
	    $foulDisplayName.data('rerack', false);
	}
	
	// check for valid number
	if ($.isNumeric(foulCount)) {
	    $foulDisplay    .html(foulCount);
	    $foulDisplayName.html(foulName );
	}
    }
    
    /*
     *	Processes the user input and contains all the game logic
     *		ballsOnTable : number of balls still on the table
     *		selectedBall : number of the ball selected by the user
     *		foulPts      : amount of foul points
     *		safety       : whether the inning ended in a safety
     *		rerack       : whether a rerack has to take place after this
     *	Returns an object containing information before changes were made
     */	
    this.processInput = function(ballsOnTable, selectedBall, foulPts, safety, rerack) {
        var current      = self.innings.length-1,
	    switchPlayer = false,
	    hasToRerack  = rerack;
        
        // create new inning if neccessary
        if (self.innings[current].ptsToAdd[0] == -1 && self.innings[current].ptsToAdd[1] == -1) {
            self.newInning();
            current++;
        }
        
	//self.oldCurrPlayer.push(self.currPlayer);
	var currPlayer = self.currPlayer;
        
        // we will return this value to provide information on the processed inning
        var ret = {
	    ballsOnTable : parseInt(selectedBall),
	    firstShot    : false,
	    currPlayer   : currPlayer,
	    current      : current,
	    safety       : safety,
	    rerack       : hasToRerack,
        };
        
        // points that were made and need to be added or saved
        self.innings[current].ptsToAdd[currPlayer] += parseInt(ballsOnTable) - parseInt(selectedBall);

	// if points were made, there has been a shout without a foul, thus resetting the counter
	if (self.innings[current].ptsToAdd[currPlayer] > 0) {
	    self.players[currPlayer].fouls = 0;
	}
	
        // inning ended with a foul
        if (parseInt(foulPts) != 0) {
            // will definitely cause player switch
            switchPlayer = true;
            
            // add foul points to current inning
            self.innings[current].foulPts[currPlayer] += foulPts;
            
            // still only counts as one foul, though
            // only standard fouls count
            if (parseInt(foulPts) == 1) {
                self.players[currPlayer].fouls++;
            } else {
                self.players[currPlayer].fouls = 0;
            }
            
            // 3 foul rule
            if (self.players[currPlayer].fouls == 3) {
		// divide by multiplicator because it should always only be -15
		self.innings[current].foulPts[currPlayer] += 15 / self.multiplicator[currPlayer];
                self.players[currPlayer].fouls = 0;
                
                /*
                 * Ruling: Applying 3 foul rule causes rerack
                 */
                hasToRerack = true;
                ret.rerack  = true;
            }
        } else {
	    self.players[currPlayer].fouls = 0;
	}
        
        // inning ended with safety
        if (safety) {
            self.innings[current].safety[currPlayer] = true;
            switchPlayer = true;
        }
        
        switch (parseInt(selectedBall)) {
            case 0: // same as case 1
            case 1:
                // if fouls were made or inning ended with a safety, the turn switches to the other player,
                // unless a rerack takes place
                if (switchPlayer && !hasToRerack) {
                    self.innings[current].points[currPlayer] += self.multiplicator[currPlayer] * (self.innings[current].ptsToAdd[currPlayer] - self.innings[current].foulPts[currPlayer]);
                    
                    self.innings[current].ptsToAdd[currPlayer] = -1;
                }
                
                ret.ballsOnTable = 15;
                ret.firstShot    = true;
                break;
            
            default:
                if (!hasToRerack) {
                    self.innings[current].points[currPlayer] += self.multiplicator[currPlayer] * (self.innings[current].ptsToAdd[currPlayer] - self.innings[current].foulPts[currPlayer]);
                
                    self.innings[current].ptsToAdd[currPlayer] = -1;
                    switchPlayer = true;
                }
                
                ret.firstShot = false;
        }
        
        if (switchPlayer && !hasToRerack) {
            self.switchPlayer();
        }
        
        // now update global points
        self.players[currPlayer].points += self.innings[current].points[currPlayer];
        
        return ret;
    }
    
    /*
     *	UI FUNCTIONALITY
     */

    /*
     *	Returns an object containing the heights for the main and details panel
     */
    this.getPanelHeights = function () {
	var viewPortHeight = $(window).height(),
	    headerHeight   = $page.find('[data-role="header"]') .height(),
	    contentHeight  = $page.find('[data-role="content"]').height();
		    
	return {
	    mainPanel    : viewPortHeight - headerHeight - contentHeight - 25,
	    detailsPanel : viewPortHeight,
	}
    }
    
    /*
     *	Determine the best size for ball images
     */
    this.getBestBallRadius = function () {
	var maxHeight = self.getPanelHeights().mainPanel
	 		   - parseInt($ballRack.css('bottom').replace('px', ''))   // margin from toolbar
	 		   - 20                                                    // additional margins
	 		   - 40,                                                   // margin from detail/switch buttons
	    maxWidth  = $(window).width() * 0.95;
        
        var bestRadius = Math.min(
	 			  maxWidth  / 10,                             // fit width
	 			  maxHeight / (2 * (1 + 2*Math.sqrt(3)))      // fit height
	 			 );
	
	return Math.floor(bestRadius);
    }
    
    /*
     *	Determine which image set to use for the CSS Sprites
     */
    this.getBallImageSize = function (bestRadius) {
	var devicePixelRatio = 1;
	if (typeof window.devicePixelRatio !== 'undefined') {
	    devicePixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio));
	}
	
	// available sprite sets
	var availableSizes = new Array(30, 60, 80, 100, 120);
        var nearestSize    = availableSizes[availableSizes.length-1];
        for (var i = availableSizes.length-1; i >= 0; i--) {
	    if (2*devicePixelRatio*bestRadius <= availableSizes[i]) {
	        nearestSize = availableSizes[i];
	    }
        }
	
	return nearestSize;
    }
    
    /*
     *	Close the details panel
     */
    this.closeDetailsPanel = function () {	
	$page.data('activePage', 'pageGame141_MainPanel');
	
	$.mobile.loading('show');
	$page
	    .find('[data-role="header"]')
	    .css('display', 'block');
			  
        //$panelRackAndMenu.show(function () {
	$panelRackAndMenu.css('display', 'block');
	    // Bugfix : Panel moved to the right because of the (even if invisible) scrollbars
            $panelRackAndMenu.css('left', '0');
	    
            $detailsPanel.css('display', 'none');
	    $.mobile.loading('hide');
        //});
	
	return true;
    }
    
    /*
     *	Updates display for consecutive fouls
     */
    this.updateConsecutiveFoulsDisplay = function () {
        for (var player = 0; player <= 1; player++) {
            for (var foul = 1; foul <= 2; foul++) {
                if (foul <= self.players[player].fouls) {
                    $('#player' + player + 'foul' + foul).css('visibility', 'visible');
		    continue;
                }
		$('#player' + player + 'foul' + foul).css('visibility', 'hidden');
            }
        }
    }
    
    /*
     *	Updates score display
     */
    this.updateScoreDisplay = function () {
	var current = self.innings.length - 1;
	var tmpPtsToAdd = new Array(
	    (self.innings[current].ptsToAdd[0] === -1) ? 0 : self.innings[current].ptsToAdd[0],
	    (self.innings[current].ptsToAdd[1] === -1) ? 0 : self.innings[current].ptsToAdd[1]
	);

	$ptsPlayer[0].html(self.players[0].points + tmpPtsToAdd[0]);
        $ptsPlayer[1].html(self.players[1].points + tmpPtsToAdd[1]);
    }
    
    /*
     *	Sets the marker for which player's turn it is
     */
    this.setActivePlayerMarker = function (activePlayer) {
	$activePlayer
	    .removeClass('activePlayer' + (1-activePlayer ))
	    .addClass   ('activePlayer' + (self.currPlayer));
    }
    
    /*
     *	Handles a click on the "Accept" button and triggers the game logic
     */
    this.handleAcceptButton = function (event) {
	event.preventDefault();
	
	// if button is still active from last click, abort
        if (btnAcceptPressed) {
            return false;
        }
	
        // block button and rack
        btnAcceptPressed = true;
        $btnAccept.addClass('navbarButtonDown');
        self.ballRack.unsetHandler();
        
        // reset button and rack in given time
        setTimeout(function() {
            btnAcceptPressed = false;
            $btnAccept.removeClass('navbarButtonDown');
            self.ballRack.setHandler();
        }, 500);
	
	// tutorial
	setTimeout(function () {
	    app.triggerTutorial('tutorial141SelectCueBall');
	}, 1000);
        
	self.switchButton = false;
        $btnPlayerSwitch.css('display', 'none');
        
        // check if rerack is needed
        rerack = $foulDisplayName.data('rerack');
        
        // process the input
        var ret = self.processInput(
	    self.ballRack.ballsOnTable,
	    self.ballRack.selectedBall,
	    parseInt( $foulDisplay.html() ),
	    Boolean( 1 - yesno.indexOf( $safetyDisplay.html() ) ),
	    rerack
	);
        
        // handle rerack
        if (rerack || ret.rerack) {
            ret.firstShot    = true;
            ret.ballsOnTable = 15;
            ret.selectedBall = 15;
            
	    self.switchButton = true;
            $btnPlayerSwitch.css('display', 'block');
        }
        
        // after a shot has been accepted, the foul and safety displays reset
        self.setFoulDisplay(0);
        $foulDisplayName.data('rerack', false);
        $safetyDisplay  .html(yesno[1]);
        
        // this displays the change of points (if neccessary), e.g. "+3" or "-1".
        var tmpDisplay;
	if (self.innings[ret.current].ptsToAdd[ret.currPlayer] == -1) {
	    tmpDisplay = self.innings[ret.current].points[ret.currPlayer];
	} else {
	    tmpDisplay = self.multiplicator[ret.currPlayer] * (self.innings[ret.current].ptsToAdd[ret.currPlayer] - self.innings[ret.current].foulPts[ret.currPlayer]);  
	}

        tmpDisplay = (tmpDisplay >= 0) ? ('+' + tmpDisplay) : tmpDisplay;
        $ptsPlayer[ret.currPlayer].html(tmpDisplay);
        
        // check for end of game
	var wonByPoints  = (self.players[0].points >= self.scoreGoal || self.players[1].points >= self.scoreGoal);
	var wonByInnings = (self.maxInnings > 0											// innings limit is set
			    && self.innings.length >= self.maxInnings								// innings limit is reached
			    && (self.inningsExtension == 0									// either no innings extension is set or ...
				|| (self.innings[self.innings.length-1].number - self.maxInnings) % self.inningsExtension == 0)	// ... minimum number of extension innings have been played
			    && self.innings[self.innings.length-1].ptsToAdd[1-ret.currPlayer] == -1)				// both players had their chance
			    && (self.players[0].points != self.players[1].points						// game not tied ...
				|| self.inningsExtension == 0);									// ... except no innings extension is set
	
	if (wonByPoints || wonByInnings) {
	    self.isFinished = true;
	    
	    // determine winner
	    var ptsDiff = self.players[1].points - self.players[0].points;
	    if (ptsDiff != 0) {
		var idxWinner = (ptsDiff > 0) ? 1 : 0;
		self.winner = self.players[idxWinner].obj.pID;
	    }
	    // game ended tied
	    else {
		self.winner = 0;
	    }
	    
	    // finish inning
	    self.innings[self.innings.length-1].ptsToAdd[idxWinner] = -1;
	    
	    // block all inputs
	    setTimeout(
		function () {
		    self.ballRack.unsetHandler();
		    self.updateScoreDisplay();
		},
		500
	    );
	    $btnAccept.off('click').off('vclick');
	    $btnFoul  .off('click').off('vclick').off('taphold');
	    $btnSafety.off('click').off('vclick');
	    $btnUndo  .off('click').off('vclick');
	    
	    // unset the current player marker
	    $activePlayer.removeClass('activePlayer0')
			 .removeClass('activePlayer1');
	    
	    // cap off last inning and total points to be no larger than the score goal
	    if (self.winner != 0) {
		self.innings[self.innings.length-1].points[idxWinner] -= Math.max(0, self.players[idxWinner].points - self.scoreGoal); 
		self.players[idxWinner].points                         = Math.min(self.players[idxWinner].points, self.scoreGoal);
	    }
	    
	    var msg;
	    if (wonByPoints) {
		msg = (self.players[idxWinner].obj.getDisplayName()) + ' has won the game!';
	    } else {
		if (self.winner === 0) { // ended in a tie
		    msg = 'The game ended tie due to reaching the maximum number of innings!';
		} else { // ended because innings limit was reached
		    msg = (self.players[idxWinner].obj.getDisplayName()) + ' has won the game because the maximum number of innings was reached!';
		}
	    }
	    
	    self.saveHistory();
	    self.saveGame(function () {
		// update statistics
		self.players[0].obj.updateStatistics();
		self.players[1].obj.updateStatistics();
		
		app.currentGame = null;
	    });
	    
	    app.alertDlg(
		msg,
		function () {
		    $.mobile.changePage('../viewGames/view141Games_details.html?gID=' + self.gameID + '&from_game=1');
		},
		'Game Over!',
		'OK'
	    );
	    
	    return true;
        }
	
	setTimeout(function() {
            self.updateScoreDisplay();
	    //self.setActivePlayerMarker(self.currPlayer);
        }, 1000);
	self.setActivePlayerMarker(self.currPlayer);
        
        self.updateConsecutiveFoulsDisplay();
        
        // communicate the new settings to the rack
        self.firstShot             = ret.firstShot;
        self.ballRack.ballsOnTable = ret.ballsOnTable;
        self.ballRack.selectedBall = ret.ballsOnTable;
        
        self.ballRack.redraw();
	self.saveHistory();
	self.saveGame();
	return true;
    }
    
    /*
     *	Handle click on the foul button
     */
    this.handleFoulButtonTap = function (event) {
	event.preventDefault();
        
        // if button is still active, ignore
        if( $btnFoul.hasClass('navbarButtonDown') ) {
            return false;
        }
	
	// animation
        $btnFoul.addClass('navbarButtonDown');
        setTimeout(function() {
            $btnFoul.removeClass('navbarButtonDown');
        }, 250);

	// toggle foul display
        self.setFoulDisplay(
	    1 + parseInt( $foulDisplay.html() ),
	    self.firstShot && (self.ballRack.selectedBall == self.ballRack.ballsOnTable)
	);
	return true;
    }
    
    /*
     *	Handles long click on foul button for manual foul entry
     */
    this.handleFoulButtonHold = function (event) {
	event.preventDefault();
	
	// if button is still active, ignore
        if( $btnFoul.hasClass('navbarButtonDown') ) {
            return false;
        }
	
	// animation
        $btnFoul.addClass('navbarButtonDown');
        setTimeout(function() {
            $btnFoul.removeClass('navbarButtonDown');
        }, 250);

	// open manual entry popup
        self.setFoulDisplay(2, self.firstShot, true);
        $('#popupSevereFoul').popup('open');
	return true;
    }
    
    /*
     *	Handle click on safety button
     */
    this.handleSafetyButton = function (event) {
	event.preventDefault();
        
        // if button is still active, ignore
        if( $btnSafety.hasClass('navbarButtonDown') ) {
            return false;
        }
	
        $btnSafety.addClass('navbarButtonDown');
        setTimeout(function() {
            $btnSafety.removeClass('navbarButtonDown');
        }, 250);
        
	// toggle safety display
        $safetyDisplay.html( yesno[ 1 - yesno.indexOf( $safetyDisplay.html() ) ] );
	return true;
    }
    
    /*
     *	Handle click on the button to minimize the main panel, show the details panel
     *	and display the scoreboard
     */
    this.handleMinimizeMainPanelButton = function (event) {
	event.preventDefault();
	
	$.mobile.loading('show');
        $page             .find('[data-role="header"]')
	                  .css('display', 'none');
        //$detailsPanel.show(function () {
	$detailsPanel.css('display', 'block');
	    $page.data('activePage', 'pageGame141_DetailsPanel');
	    
            $panelRackAndMenu.css('display', 'none');
            
            var totalPts     = new Array(self.handicap[0], self.handicap[1]),
                totalInnings = new Array(0, 0),
		HS           = new Array(0, 0),
		safety       = new Array(2),
		foul         = new Array(2),
		entryDummy   = '<td class="[safety]">[points]</td>'
			     + '<td class="[safety][foul]">[foulPts]</td>'
			     + '<td class="[safety]totals">[totalPts]</td>',
	        inningDummy  = '<td class="">[inning]</td>',
	        tbodyDummy   = '<tbody id="detailsScoreBoardTableBody">[entries]</tbody>',
	        entries      = new Array(self.innings.length);
            for (var i = 0; i < self.innings.length; i++) {
                totalPts[0] += self.innings[i].points[0];
                totalPts[1] += self.innings[i].points[1];
		
		HS[0] = Math.max(HS[0], self.innings[i].points[0]);
		HS[1] = Math.max(HS[1], self.innings[i].points[1]);
                
                totalInnings[0] += (self.innings[i].ptsToAdd[0] == -1) ? 1 : 0;
                totalInnings[1] += (self.innings[i].ptsToAdd[1] == -1) ? 1 : 0;

		safety[0] = (self.innings[i].safety[0]) ? 'safety ' : '';
		safety[1] = (self.innings[i].safety[1]) ? 'safety ' : '';
                
		foul[0] = (self.innings[i].foulPts[0] != 0) ? 'foul ' : 'nofoul ';
		foul[1] = (self.innings[i].foulPts[1] != 0) ? 'foul ' : 'nofoul ';
                

		entries[i] = entryDummy.replace (/\[safety\]/g,  safety[0])
				       .replace ('[points]',   ((self.innings[i].ptsToAdd[0] == -1) ? (self.innings[i].points[0]+self.innings[i].foulPts[0]) : '&ndash;'))
				       .replace ('[foul]',       foul[0])
				       .replace ('[foulPts]',  ((self.innings[i].foulPts[0]) ? self.innings[i].foulPts[0] : ''))
				       .replace ('[totalPts]', ((self.innings[i].ptsToAdd[0] == -1) ? totalPts[0] : '&ndash;'))
			   + inningDummy.replace('[inning]', self.innings[i].number)
			   + entryDummy.replace (/\[safety\]/g,  safety[1])
				       .replace ('[points]',   ((self.innings[i].ptsToAdd[1] == -1) ? (self.innings[i].points[1]+self.innings[i].foulPts[1]) : '&ndash;'))
				       .replace ('[foul]',       foul[1])
				       .replace ('[foulPts]',  ((self.innings[i].foulPts[1]) ? self.innings[i].foulPts[1] : ''))
				       .replace ('[totalPts]', ((self.innings[i].ptsToAdd[1] == -1) ? totalPts[1] : '&ndash;'));
            }
            
	    $('#detailsScoreBoardTableBody').remove();
            $('#detailsScoreBoardTable')    .append(
						tbodyDummy.replace('[entries]', '<tr>' + entries.join('</tr><tr>') + '</tr>')
					    );
            
            var GDs = new Array(
                                Math.round(100 * (totalPts[0] - self.handicap[0]) / (totalInnings[0] * self.multiplicator[0])) / 100,
                                Math.round(100 * (totalPts[1] - self.handicap[1]) / (totalInnings[1] * self.multiplicator[1])) / 100
                                );
            $('#player0gd').html('&#216;&thinsp;' + ((!isNaN(GDs[0])) ? GDs[0].toFixed(2) : '0.00'));
            $('#player1gd').html('&#216;&thinsp;' + ((!isNaN(GDs[1])) ? GDs[1].toFixed(2) : '0.00'));
	    
	    $('#player0hs').html('max ' + HS[0]);
	    $('#player1hs').html('max ' + HS[1]);
            
	    $.mobile.loading('hide');
        //});
    }
    
    /*
     *	Handle click on the button to switch players
     */
    this.handlePlayerSwitchButton = function (event) {
	// if there is unprocessed business, let's take care of it
	if (self.innings[self.innings.length-1].ptsToAdd[self.currPlayer] != -1 && self.innings[self.innings.length-1].foulPts[self.currPlayer] != 0) {
	    self.processInput(15, 15, 0, false, false);
	    
	    $ptsPlayer[0].html(self.players[0].points);
	    $ptsPlayer[1].html(self.players[1].points);
	} else {
	    self.switchPlayer();
	}
	
	self.updateScoreDisplay();
	self.setActivePlayerMarker(self.currPlayer);
    }
    
    /*
     *	Handle click on the +/- buttons in the popup for manual entry of severe fouls
     *		plus : true for "+" button, false for "-" button
     */
    this.handleSevereFoulPlusMinusButton = function (event, plus) {
	event.preventDefault();
	
	var diff    = (plus) ? 1 : -1,
	    currVal = parseInt( $popupSevereFoulPoints.val() ),
	    newVal  = currVal + diff;
        
	// we don't allow negative values
	if (newVal < 0) {
	    newVal = 0;
	}
	
	$popupSevereFoulPoints.val(newVal);
    }
    
    /*
     *	Handle click on the submit button in the popup for manual entry of severe fouls
     */
    this.handleSevereFoulSubmitButton = function (event) {
	event.preventDefault();
	
	var fouls  = Math.abs( parseInt( $popupSevereFoulPoints.val() ) ),
	    rerack = $popupSevereFoulRerack[0].checked;
	
	self.setFoulDisplay(fouls, false, true);
	
	// important to call this AFTER setting the foul display to overwrite rerack setting
	$foulDisplayName.data('rerack', rerack);
	
	$popupSevereFoul.popup('close');
	
	// reset the popup form
	$popupSevereFoulPoints.val('2');
	$popupSevereFoulRerack.prop('checked', false)
			      .checkboxradio('refresh');
    }
    
    /*
     *	Handle undo button click
     */
    this.handleUndoButton = function (event) {
	event.preventDefault();
	
	// if button is still active, ignore
        if( $btnUndo.hasClass('panelButtonDown') ) {
            return false;
        }
	
	// animation
        $btnUndo.addClass('panelButtonDown');
        setTimeout(function() {
            $btnUndo.removeClass('panelButtonDown');
        }, 250);
	
	app.confirmDlg(
	    'Are you sure you want to revert the last action?',
	    function () {
		self.undo(
		    function () {
		        self.closeDetailsPanel();
		        self.updateScoreDisplay();
		        self.setActivePlayerMarker(self.currPlayer);
		    }
		);
	    },
	    app.dummyFalse,
	    'Undo',
	    'Revert,Cancel'
	);
	
	return true;
    }
    
    /*
     *	Initializes the whole UI
     */
    this.initUI = function () {
	// set score goal, points and player names
	$('#game141ScoreGoal').html(self.scoreGoal);
	
	self.updateScoreDisplay();
	self.updateConsecutiveFoulsDisplay();
	self.setActivePlayerMarker(self.currPlayer);
	
	$('#game141Player0Name').html(
	    self.players[0].obj.getDisplayName()
	);
	$('#game141Player1Name').html(
	    self.players[1].obj.getDisplayName()
	);
	
	// save game
	self.saveGame();
	
	// save history
	self.saveHistory();
	
	// set panel sizes
	var panelHeights = self.getPanelHeights();
	$panelRackAndMenu
	    .css('height', panelHeights.mainPanel);
	$detailsPanel
	    .css('display', 'none')
	    .css('height', panelHeights.detailsPanel);
	
	var bestRadius  = self.getBestBallRadius(),
	    nearestSize = self.getBallImageSize(bestRadius);
	
	// set up the ball rack    
	self.ballRack.ballSizeSmall = 2 * bestRadius;
	self.ballRack.calcBallPositions();
        self.ballRack.drawRack();
	
	// activate touch handling
	setTimeout(self.ballRack.setHandler, 350);
	    
	// load images
	// we use CSS3 sprites as this will reduce both file size and loading time
	for (var i = 0; i <= 15; i++) {
	    $('#ball' + i).css('background-image',        'url(../../img/rack/rack' + nearestSize + '.png)')
			  .css('background-size',         (2*bestRadius) + 'px auto'                       )
			  .css('-webkit-background-size', (2*bestRadius) + 'px auto'                       ) // Bugfix : Android earlier than or equal to 2.1
			  .css('background-repeat',       'no-repeat'                                      )
			  .css('background-position',     '0 -' + (2*i*bestRadius) + 'px'                  );
	}
	
	// Bugfix : Force repaint
	setTimeout(function () {
	    $panelRackAndMenu.addClass('ForceRepaint');
	    setTimeout(function () {
		$panelRackAndMenu.removeClass('ForceRepaint');
	    }, 500);
	}, 500);
	$activePlayer.css('visibility', 'visible');
	
	// now we make the buttons work
	$btnAccept                  .off('vclick') .on('vclick',  self.handleAcceptButton           );
	$btnFoul                    .off('vclick') .on('vclick',  self.handleFoulButtonTap          );
	$btnFoul                    .off('taphold').on('taphold', self.handleFoulButtonHold         );
	$btnSafety                  .off('vclick') .on('vclick',  self.handleSafetyButton           );
	$('.minimizePanel')         .off('click')  .on('click',   self.handleMinimizeMainPanelButton);
	$btnPlayerSwitch            .off('click')  .on('click',   self.handlePlayerSwitchButton     );
	$('#severeFoulSubmitButton').off('click')  .on('click',   self.handleSevereFoulSubmitButton );
	$('#detailsScoreBoard')     .off('click')  .on('click',   self.closeDetailsPanel            );
	$btnUndo                    .off('vclick') .on('vclick',  self.handleUndoButton             );
	
	$('#severeFoulMinusButton').off('vclick')
				   .on ('vclick', function (event) {
	    self.handleSevereFoulPlusMinusButton(event, false);
	});
	
	$('#severeFoulPlusButton').off('vclick')
				  .on ('vclick', function (event) {
	    self.handleSevereFoulPlusMinusButton(event, true);
	});
    }
}