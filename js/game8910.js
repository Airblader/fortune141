function Game8910 () {
    var self = this;
    var TEMP_SCORE_DURATION = 1000,
        tmpScoreInUse       = false;
    
    var $btnShotClockCtrl         = $('#btnShotClockCtrl'),
        $btnShotClockSwitch       = $('#btnShotClockSwitch'),
        $btnExtension             = $('#btnExtension'),
        $btnUndo                  = $('#btnUndo'),
        $mainPlayer1Streak        = $('#mainPlayer1Streak'),
        $mainPlayer2Streak        = $('#mainPlayer2Streak'),
	$mainPlayer1StreakWrapper = $('#mainPlayer1StreakWrapper'),
	$mainPlayer2StreakWrapper = $('#mainPlayer2StreakWrapper'),
        $setScore1Bar             = $('#setScore1Bar'),
        $setScore2Bar             = $('#setScore2Bar'),
        $setScore1Value           = $('#setScore1Value'),
        $setScore2Value           = $('#setScore2Value');
    
    this.gameID       = -1;
    this.historyStack = new Array();
    
    this.loadGame = function (gID) {
        var cbSuccess = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse,
            cbError   = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse;
	
        self.gameID = gID;
	
	var sql = 'SELECT * FROM ' + app.dbFortune.tables.Game8910.name + ' WHERE gID=' + gID + ' LIMIT 1';
	app.dbFortune.query(sql, [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    cbError();
		    return false;
		}
		
		var row = result.rows.item(0);
                
                self.players = new Array(self.getDummyPlayer(),
                                         self.getDummyPlayer());
                self.players[0].fouls = parseInt(row['FoulsPlayer1']);
                self.players[1].fouls = parseInt(row['FoulsPlayer2']);
		
                self.gameType     = row['gameType'];
                self.breakType    = parseInt(row['breakType']);
                self.mode         = parseInt(row['Mode']);
                self.racksPerSet  = parseInt(row['RacksPerSet']);
                self.numberOfSets = parseInt(row['NumberOfSets']);
                
                self.stringToScore(row['Score']);
                
                var tempScore = row['TempScore'].split('/');
                if (tempScore[0] != self.players[0].racks || tempScore[2] != self.players[1].racks
                    || tempScore[1] != self.players[0].sets || tempScore[3] != self.players[1].sets) {
                    app.alertDlg(
                        'Uh-Oh! Discrepancy when loading game. Loaded game will not be stable!',
                        app.dummyFalse,
                        'OK',
                        'Error'
                    );
                }
                
                self.timestamp  = row['StartTimestamp'];
                self.firstBreak = parseInt(row['firstBreak']);
                self.lastBreak  = parseInt(row['CurrPlayer']);
                
                self.isFinished = (parseInt(row['isFinished']) == 1);
                self.winner     = parseInt(row['Winner']);
                
                self.shotClock = new ShotClock8910();
                self.shotClock.init(
                    parseInt(row['Shotclock']),
                    parseInt(row['ExtensionTime']),
                    parseInt(row['ExtensionsPerRack']),
                    parseInt(row['ShotclockUseSound']) === 1
                );
                self.shotClock.currPlayer = parseInt(row['CurrPlayer']);
                self.shotClock.numCalledExtensions = new Array(
                    parseInt(row['ExtensionsCalledPlayer1']),
                    parseInt(row['ExtensionsCalledPlayer2'])
                );
                self.shotClock.updateCurrPlayerDisplay();
		
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
    
    this.saveGame = function () {
        var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
	
	// no entry exists yet
	if (self.gameID == -1) { 
	    var sql = 'INSERT INTO '
		    + app.dbFortune.tables.Game8910.name + ' '
		    + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game8910, false, false) + ' '
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
            
            var score = self.scoreToString();
            var tempScore = self.players[0].racks + '/'
                          + self.players[0].sets  + '/'
                          + self.players[1].racks + '/'
                          + self.players[1].sets;
	    
	    app.dbFortune.query(
		sql,
		[
                    self.gameType,
                    self.timestamp,
                    self.timestamp,
                    self.players[0].obj.getDisplayName(),
                    self.players[1].obj.getDisplayName(),
                    self.players[0].obj.pID,
                    self.players[1].obj.pID,
                    self.shotClock.currPlayer,
                    self.numberOfSets,
                    self.racksPerSet,
                    score,
                    tempScore,
                    self.players[0].fouls,
                    self.players[1].fouls,
                    self.breakType,
                    self.firstBreak,
                    self.mode,
                    (self.isFinished) ? '1' : '0',
                    self.winner,
                    '',
                    0,
                    0,
                    self.shotClock.shotTime,
                    self.shotClock.extensionTime,
                    self.shotClock.extensionsPerRack,
                    (self.shotClock.useSoundWarning) ? 1 : 0,
                    self.shotClock.numCalledExtensions[0],
                    self.shotClock.numCalledExtensions[1]
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
	var sql = 'UPDATE ' + app.dbFortune.tables.Game8910.name + ' SET '
                + 'EndTimestamp=?, CurrPlayer=?, Score=?, TempScore=?, FoulsPlayer1=?, FoulsPlayer2=?, isFinished=?, '
                + 'Winner=?, ExtensionsCalledPlayer1=?, ExtensionsCalledPlayer2=? '
		+ 'WHERE gID="' + self.gameID + '"';
		
        var score = self.scoreToString();
        var tempScore = self.players[0].racks + '/'
                      + self.players[0].sets  + '/'
                      + self.players[1].racks + '/'
                      + self.players[1].sets;
                      	
	app.dbFortune.query(
	    sql,
	    [
                Math.floor(Date.now() / 1000).toFixed(0),
                self.shotClock.currPlayer,
                score,
                tempScore,
                self.players[0].fouls,
                self.players[1].fouls,
                (self.isFinished) ? '1' : '0',
                self.winner,
                self.shotClock.numCalledExtensions[0],
                self.shotClock.numCalledExtensions[1]
	    ],
	    cbSuccess,
	    app.dummyFalse
	);
	return true;
    }
    
    this.initHistory = function (cbSuccess) {
        var cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
        
        // simply drop and recreate table
	app.dbFortune.dropTable(
	    app.dbFortune.tables.Game8910History,
	    function () {
		app.dbFortune.createTable(
		    app.dbFortune.tables.Game8910History,
		    cbSuccess,
		    cbError
		);
	    },
	    cbError
	);
    }
    
    this.saveHistory = function () {
        var sql = 'INSERT INTO '
		    + app.dbFortune.tables.Game8910History.name + ' '
		    + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game8910History, false, false) + ' '
		    + 'VALUES (NULL, ?, ?, ?, ?, ?, ?)';
	
        var score = self.scoreToString();
	    
	app.dbFortune.query(
	    sql,
	    [
                score,
                self.players[0].fouls,
                self.players[1].fouls,
                self.shotClock.currPlayer,
                self.shotClock.numCalledExtensions[0],
                self.shotClock.numCalledExtensions[1]
	    ],
	    function (tx, result) {
		self.historyStack.push(result.insertId);
	    },
	    app.dummyFalse
	);
    }
    
    this.saveFoulHistory = function () {
        var currentID = self.historyStack[self.historyStack.length-1];
        
        app.dbFortune.query(
            'UPDATE ' + app.dbFortune.tables.Game8910History.name + ' SET '
            + 'FoulsPlayer1=?, FoulsPlayer2=? '
            + 'WHERE ID=' + currentID,
            [
                self.players[0].fouls,
                self.players[1].fouls
             ]
        );
    }
    
    this.loadHistory = function () {
        var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	if (self.historyStack.length <= 1) {
	    cbError();
            return;
	}
	var id = self.historyStack.pop(); // TODO this is weird
	    id = self.historyStack[self.historyStack.length-1];
        
        app.dbFortune.query(
	    'SELECT * FROM ' + app.dbFortune.tables.Game8910History.name + ' WHERE ID="' + id + '" LIMIT 1',
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		var row = result.rows.item(0);
		
		self.stringToScore(row['Score']);
                
                self.players[0].fouls = parseInt(row['FoulsPlayer1']);
                self.players[1].fouls = parseInt(row['FoulsPlayer2']);
		
                self.shotClockPause();
                self.shotClock.switchPlayer(self.shotClock.currPlayer !== parseInt(row['CurrPlayer']));
                self.shotClock.numCalledExtensions = new Array(
                    parseInt(row['ExtensionsCalledPlayer1']),
                    parseInt(row['ExtensionsCalledPlayer2'])
                );
                
		self.saveGame();
		cbSuccess();
		return true;
	    },
	    cbError
	);
    }
    
    this.undo = function () {
        var callback = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
        
        this.loadHistory(
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
    
    this.shotClockPause = function () {
        var softPause    = (typeof arguments[0] !== 'undefined') ? arguments[0] : false;
        
        this.shotClock.pauseClock();
        
        if (softPause) {
            $btnShotClockCtrl.html('Resume');   
        } else {
            $btnShotClockCtrl.html('Start');
        }
    }
    
    this.shotClockResume = function () {
        this.shotClock.unpauseClock();
        $btnShotClockCtrl.html('New Shot');
    }
    
    this.newRack = function () {
        this.shotClock.newRack();
        $btnShotClockCtrl.html('Start');
    }
    
    this.handleBtnShotClockCtrlTap = function (event) {
        event.preventDefault();
        var $this = $btnShotClockCtrl;
        
        if ($this.hasClass('btnDown')) {
            return;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (self.shotClock.clockIsRunning) {
            self.shotClock.switchPlayer(false);
            self.shotClockPause(false);
            
            setTimeout(function () {
                app.triggerTutorial('tutorial8910ShotclockTaphold');
            }, 500);
        } else {
            self.shotClockResume();
        }
        
        self.saveGame();
    }
    
    this.handleBtnShotClockCtrlTapHold = function (event) {
        event.preventDefault();
        var $this = $btnShotClockCtrl;
        
        if ($this.hasClass('btnDown')) {
            return;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (self.shotClock.clockIsRunning) {
            self.shotClockPause(true);
        } else {
            // FREE
        }
        
        self.saveGame();
    }
    
    this.handleBtnShotClockSwitch = function (event) {
        event.preventDefault();
        var $this = $btnShotClockSwitch;
        
        if ($this.hasClass('btnDown')) {
            return;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (self.shotClock.firstRun) {
            self.shotClock.switchPlayer();
            
            self.firstBreak = self.shotClock.currPlayer;
            self.lastBreak  = self.firstBreak;
        } else {
            self.shotClock.switchPlayer();
            self.shotClockPause(false);
        }
    }
    
    this.handleBtnCallExtension = function (event) {
        event.preventDefault();
        var $this = $btnExtension;
        
        if ($this.hasClass('btnDown')) {
            return;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (!self.shotClock.clockIsRunning) {
            app.alertDlg(
                'You cannot call an extension as long as the clock isn\'t running!',
                app.dummyFalse,
                'Shot Clock',
                'OK'
            );
            
            return;
        }
        
        if(!self.shotClock.callExtension()) {
            self.shotClockPause();
            
            app.confirmDlg(
                'This player has used up all his extensions. Grant extension anyway?',
                function () {
                    self.shotClock.callExtension(true);
                    self.shotClockResume();
                    
                    self.saveGame();
                },
                function () {
                    self.shotClockResume();
                },
                'Shot Clock',
                'Yes,No'
            );
        } else {
            self.saveGame();
        }
    }
    
    this.handleBtnUndo = function (event) {
        event.preventDefault();
        var $this = $btnUndo;
        
        if ($this.hasClass('btnDown')) {
            return;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        app.confirmDlg(
            'Are you sure you want to revert the last action?',
            function () {
                self.undo(
                    function () {
                        self.updateRackScore();
                        self.updateSetScore();
                        self.updateStreak();
                        self.updateFoulDisplay();
                    }
                );
            },
            app.dummyFalse,
            'Undo',
            'Revert,Cancel'
        );
    }
    
    this._handleBtnEntry = function (currPlayer, runOut) {
        self.processInput(currPlayer, runOut);
        
        self.updateRackScore();
        self.updateSetScore();
        self.updateFoulDisplay();
        self.updateStreak();
        
        this.saveGame();
        this.saveHistory();
    }
    
    this.handleBtnEntry = function (event, elemData, runOut) {
        event.preventDefault();
        
        if ($.mobile.activePage.data('handleBtnEntryPressed') === '1') {
            return;
        }
        
        $.mobile.activePage.data('handleBtnEntryPressed', '1');
        setTimeout(
            function () {
                $.mobile.activePage.data('handleBtnEntryPressed', '0');
            }, 500
        );
        
        var currPlayer = parseInt(elemData) - 1;
        
        if (self.shotClock.shotTime !== 0 && !self.shotClock.clockIsRunning) {
            app.confirmDlg(
                'The shot clock isn\'t running. Do you want to count this rack or start the clock?',
                function () {
                    self._handleBtnEntry(currPlayer, runOut);
                },
                function () {
                    self.shotClockResume();
                },
                '',
                'Count Rack,Start Clock'
            );
        } else {
            self._handleBtnEntry(currPlayer, runOut);
        }
    }
    
    this.handleFoulClick = function (event, elemData) {
        var currPlayer = parseInt(elemData) - 1;
        
        if (event !== null) {
            event.preventDefault();
            this.shotClock.switchPlayer(currPlayer === this.shotClock.currPlayer);
        } else {
            this.shotClock.switchPlayer(false);
        }
        this.shotClockPause();
        
        this.players[currPlayer].fouls = (this.players[currPlayer].fouls + 1) % 3;
        
        // TODO Warn three fouls
        // Maybe go up to '% 4' and reset with a timeout
            
        this.updateFoulDisplay();
        
        this.saveFoulHistory();
        this.saveGame();
    }
    
    this.updateFoulDisplay = function () {
        for (var p = 0; p <= 1; p++) {
            $foulObjs = $('#mainPlayer' + (p+1) + 'FoulWrapper img');
            for (var f = 0; f <= 3; f++) {
                $foulObjs.eq(f).css('opacity', (this.players[p].fouls > f) ? '1' : '0.1');
            }
        }
    }
    
    this.updateStreak = function () {
        $mainPlayer1StreakWrapper.css('visibility', (self.players[0].streak === 0) ? 'hidden' : 'visible');
	$mainPlayer1Streak.html(self.players[0].streak);
	
        $mainPlayer2StreakWrapper.css('visibility', (self.players[1].streak === 0) ? 'hidden' : 'visible');
	$mainPlayer2Streak.html(self.players[1].streak);
    }
    
    this.updateRackScoreBars = function () {
        $setScore1Bar.css('width', (100 * self.players[0].racks / self.racksPerSet) + '%');
        $setScore2Bar.css('width', (100 * self.players[1].racks / self.racksPerSet) + '%');
    }
    
    this.updateRackScore = function () {
        if (!tmpScoreInUse) {
            tmpScoreInUse = true;
            
            $setScore1Value.html(self.players[0].racks);
            $setScore2Value.html(self.players[1].racks);
            
            self.updateRackScoreBars();
            
            setTimeout(
                function () {
                    tmpScoreInUse = false;
                },
                TEMP_SCORE_DURATION
            );
        } else {
            setTimeout(self.updateRackScore, 10);
        }
    }
    
    this.tempRackScore = function (index, message) {
        tmpScoreInUse = true;
        
        var $elem = (index === 0) ? $setScore1Value : $setScore2Value;
        $elem.html(message);
        self.updateRackScoreBars();
        
        setTimeout(
            function () {
                tmpScoreInUse = false;
                self.updateRackScore();
            },
            TEMP_SCORE_DURATION
        );
    }
    
    this.initUI = function () {
        $('#game8910GameType').html(self.gameType);
        
        $('#shotClockWrapper')  .toggle(self.shotClock.shotTime !== 0);
        $('#setOverviewWrapper').toggle(self.numberOfSets > 1);
        $btnExtension           .toggle(self.shotClock.extensionsPerRack !== 0);
        
        $('#game8910ShotClockRemainingTime').html(self.shotClock.getRemainingSeconds());
        
        $('#mainPlayer1Name').html(self.players[0].obj.getDisplayName());
        $('#mainPlayer2Name').html(self.players[1].obj.getDisplayName());
        
        if (self.players[0].obj.image.length > 0) {
            $('#mainPlayer1Img').attr('src', self.players[0].obj.image);
        }
        if (self.players[1].obj.image.length > 0) {
            $('#mainPlayer2Img').attr('src', self.players[1].obj.image);
        }
        
        var heightImg1   = $('#mainPlayer1Img').height(),
            heightImg2   = $('#mainPlayer2Img').height(),
            biggerHeight = Math.max(heightImg1, heightImg2);
        $('#mainPlayer1ImgWrapper').css('height', biggerHeight);
        $('#mainPlayer2ImgWrapper').css('height', biggerHeight);
        
        var setMarkerFactor = 0.2;
            setMarkerSize   = self.getSetMarkerSize(1 + 2*setMarkerFactor),
            setMarkerHTML   = '',
            setMarkerDummy  = '<img src="../../img/setmarker/setmarker0.png" id="setMarker[ID]" style="width: [width]; height: [height]; margin-left: [margin-left]; margin-right: [margin-right];" />';
        for (var i = 0; i < 2*self.numberOfSets-1; i++) {
            setMarkerHTML += setMarkerDummy
                                .replace('[ID]',           i)
                                .replace('[width]',                         setMarkerSize  + 'px')
                                .replace('[height]',                        setMarkerSize  + 'px')
                                .replace('[margin-left]',  (setMarkerFactor*setMarkerSize) + 'px')
                                .replace('[margin-right]', (setMarkerFactor*setMarkerSize) + 'px');
        }
        $('#setOverview').html(setMarkerHTML);
        
        $btnShotClockCtrl  .off('click')  .on('click',   self.handleBtnShotClockCtrlTap);
        $btnShotClockCtrl  .off('taphold').on('taphold', self.handleBtnShotClockCtrlTapHold);
        $btnShotClockSwitch.off('click')  .on('vclick',  self.handleBtnShotClockSwitch);
        $btnExtension      .off('vlick')  .on('vclick',  self.handleBtnCallExtension);
        $btnUndo           .off('vlick')  .on('vclick',  self.handleBtnUndo);
        $('.mainPlayer1')  .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).data('player'), false); });
        $('.mainPlayer2')  .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).data('player'), false); });
        $('.mainPlayer1')  .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).data('player'), true);  });
        $('.mainPlayer2')  .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).data('player'), true);  });
        $('.foulWrapper')  .off('tap')    .on('tap',     function (event) { self.handleFoulClick(event, $(this).data('player')); });
        
        self.updateRackScore();
        self.updateSetScore();
        self.updateStreak();
        self.updateFoulDisplay();
        
        if (self.firstBreak !== -1) {
            self.saveGame();
            self.saveHistory();
        } else {
            app.FortuneUtils.openListDialog(
                self.players[0].obj.getDisplayName(),
                self.players[1].obj.getDisplayName(),
                'Who will break the first rack?',
                function (which) {
                    app.currentGame.setLastBreak(which);
                    app.currentGame.shotClock.setCurrPlayer(which);
                    
                    app.currentGame.saveGame();
                    app.currentGame.saveHistory();
                    
                    setTimeout(function () {
                        app.triggerTutorial('tutorial8910Runout');
                    }, 1000);
                }
            );
        }
    }
}

Game8910.prototype.initNewGame = function (gameType, breakType, mode, racksPerSet, numberOfSets, shotClock, extensionTime, extensionsPerRack, useSoundWarning, cbSuccess) {
    this.players    = new Array(this.getDummyPlayer(),
                                this.getDummyPlayer());
    this.timestamp  = Math.floor(Date.now() / 1000).toFixed(0);
    
    this.isFinished = false;
    this.winner     = -1;
    
    this.firstBreak = -1;
    this.lastBreak  = -1;
    
    this.gameType     = gameType;
    this.breakType    = breakType;
    this.mode         = mode;
    this.racksPerSet  = racksPerSet;
    this.numberOfSets = numberOfSets;
    
    this.sets = new Array();
    this.idxCurrentSet  = this.addSetToGame();
    this.idxCurrentRack = 0;

    this.shotClock = new ShotClock8910();
    this.shotClock.init(shotClock, extensionTime, extensionsPerRack, useSoundWarning);
    
    this.initHistory(cbSuccess);
}

Game8910.prototype.scoreToString = function () {
    var toReturnArray = new Array(this.sets.length);
    
    for (var i = 0; i < this.sets.length; i++) {
        toReturnArray[i] = '';
        
        for (var j = 0; j < this.sets[i].racks.length; j++) {
            toReturnArray[i] +=  this.sets[i].racks[j].wonByPlayer          + ','
                             + ((this.sets[i].racks[j].runOut) ? '1' : '0') + ';';
        }
        
        toReturnArray[i]  = toReturnArray[i].slice(0, -1);
    }
    
    var toReturn = toReturnArray.join('|');
    return toReturn;
}

Game8910.prototype.stringToScore = function (str) {
    // TODO Utilize addSetToGame
    
    var sets = str.split('|');
    this.sets = new Array(sets.length);
    
    this.players[0].sets = 0;
    this.players[1].sets = 0;
    
    this.players[0].streak = 0;
    this.players[1].streak = 0;
    
    this.idxCurrentRack = 0;
    this.idxCurrentSet = 0;
    
    for (var i = 0; i < sets.length; i++) {
        this.sets[i] = this.getDummySet();
        var racks = sets[i].split(';');
        
        this.players[0].racks = 0;
        this.players[1].racks = 0;
        
        for (var j = 0; j < 2*this.racksPerSet-1; j++) {
            this.sets[i].racks[j] = this.getDummyRack();
            var currentRack = racks[j].split(',');
            var idxWinner   = parseInt(currentRack[0]);
            
            if (idxWinner !== -1) {
                this.sets[i].racks[j].wonByPlayer = idxWinner;
                this.sets[i].racks[j].runOut      = (currentRack[1] === '1');
                
                this.players[idxWinner].racks++;
                this.players[idxWinner].streak++;
                
                this.players[1-idxWinner].streak = 0;
                
                if (this.players[idxWinner].racks >= this.racksPerSet) {
                    this.sets[i].wonByPlayer = idxWinner;
                    this.players[idxWinner].sets++;
                    
                    this.idxCurrentSet++;
                    this.idxCurrentRack = 0;
                } else {
                    this.idxCurrentRack++;
                }
            }
        }
    }
}

Game8910.prototype.addSetToGame = function () {
    var setsLength = this.sets.push(this.getDummySet());
    
    for (var i = 0; i < 2*this.racksPerSet-1; i++) {
        this.sets[setsLength-1].racks[i] = this.getDummyRack();
    }
    
    return setsLength-1;
}

Game8910.prototype.getSetMarkerSize = function (factor) {
    var windowWidth = $(window).width();
    
    return 30;//Math.min(30, windowWidth / (factor*(2*this.numberOfSets-1)));
}

Game8910.prototype.getDummyPlayer = function () {
    return {
        fouls:  0,
        sets:   0,
        racks:  0,
        streak: 0,
        obj:    undefined,
    };
}

Game8910.prototype.getDummySet = function () {
    return {
        wonByPlayer: -1,
        racks: new Array(2*this.racksPerSet-1),
    };
}

Game8910.prototype.getDummyRack = function () {
    return {
        wonByPlayer: -1,
        runOut: false,
    };
}

Game8910.prototype.setPlayers = function () {
    var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
      
    this.players[0].obj = undefined;
    this.players[1].obj = undefined;
        
    this.players[0].obj = app.Players.ingame[0];
    this.players[1].obj = app.Players.ingame[1];
    
    cbSuccess();
}

Game8910.prototype.setLastBreak = function (idx) {
    this.lastBreak = idx;
    
    if (this.firstBreak === -1) {
        this.firstBreak = idx;
    }
}

Game8910.prototype._updateSetScore = function (idxSet, wonByPlayer) {
    $('#setMarker' + idxSet)
        .attr('src', '../../img/setmarker/setmarker' + (wonByPlayer+1) + '.png');
}

Game8910.prototype.updateSetScore = function () {
    for (var i = 0; i < 2*this.numberOfSets-1; i++) {
        this._updateSetScore(i, (typeof this.sets[i] !== 'undefined') ? this.sets[i].wonByPlayer : -1);
    }
}

Game8910.prototype.processInput = function (currPlayer, runOut) {
    this.newRack();
    
    switch (this.breakType) {
        case 0: // Winner
            this.setLastBreak(currPlayer);
            this.shotClock.switchPlayer(this.shotClock.currPlayer !== currPlayer);
            break;
        case 1: // Loser
            this.setLastBreak(1-currPlayer);
            this.shotClock.switchPlayer(this.shotClock.currPlayer === currPlayer);
            break;
        case 2: // Alternate
            this.setLastBreak(1-this.lastBreak);
            this.shotClock.switchPlayer(this.shotClock.currPlayer !== this.lastBreak);
            break;
    }
    
    var tmpScoreMessage = '';
    
    this.sets[this.idxCurrentSet].racks[this.idxCurrentRack].wonByPlayer = currPlayer;
    
    this.players[  currPlayer].streak++;
    this.players[1-currPlayer].streak = 0;
    
    this.players[0].fouls = 0;
    this.players[1].fouls = 0;
    
    if (runOut) {
        this.sets[this.idxCurrentSet].racks[this.idxCurrentRack].runOut = true;
        tmpScoreMessage = 'RUNOUT!';
    }
    
    var newRackScore = ++this.players[currPlayer].racks;
    
    if (tmpScoreMessage.length !== 0) {
        this.tempRackScore(currPlayer, tmpScoreMessage);
    } else {
        this.updateRackScore();
    }
    
    if (newRackScore >= this.racksPerSet) {            
        this.players[currPlayer].sets++;
        this.sets[this.idxCurrentSet].wonByPlayer = currPlayer;
        
        if (this.players[currPlayer].sets === this.numberOfSets) {
	    this.isFinished = true;
            var msg;
            
            if (this.players[0].sets === this.players[1].sets) { // Game ended tied
                this.winner = 0;

                msg = 'Game ended in a tie!';
            } else { // Game ended regularly
                var idxWinner = (this.players[1].sets > this.players[0].sets) ? 1 : 0;
                this.winner = this.players[idxWinner].obj.pID;

                msg = this.players[idxWinner].obj.getDisplayName() + ' has won the game!';
            }
            
            $('#btnShotClockCtrl')  .off('click');
            $('#btnShotClockCtrl')  .off('taphold');
            $('#btnShotClockSwitch').off('vclick');
            $('#btnExtension')      .off('vlick');
            $('#btnUndo')           .off('vlick');
            $('.mainPlayer1')       .off('click');
            $('.mainPlayer2')       .off('click');
            $('.mainPlayer1')       .off('taphold');
            $('.mainPlayer2')       .off('taphold');
            $('.foulWrapper')       .off('tap');
            
            this.saveHistory();
	    var self = this;
            this.saveGame(function () {
		// update statistics
		self.players[0].obj.addGameToStatistics(self.gameID, '8910');
		self.players[1].obj.addGameToStatistics(self.gameID, '8910');
		
                app.currentGame = null;
            });
            
            var gID = this.gameID;
            app.alertDlg(
                msg,
                function () {
                    $.mobile.changePage('../viewGames/view8910Games_details.html?gID=' + gID);
                },
                'Game Over!',
                'OK'
            );
            
            return;
        } else { // Game not over
            this.idxCurrentSet  = this.addSetToGame();
            this.idxCurrentRack = 0;
            
            this.players[currPlayer]  .racks = 0;
            this.players[1-currPlayer].racks = 0;
            
            app.FortuneUtils.openListDialog(
                this.players[0].obj.getDisplayName(),
                this.players[1].obj.getDisplayName(),
                'Who will break the first rack of the new set?',
                function (which) {
                    app.currentGame.setLastBreak(which);
                    app.currentGame.shotClock.setCurrPlayer(which);
                }
            );
        }
    } else {
        this.idxCurrentRack++;
        
        if (this.breakType === 2 && app.settings.get8910NotifyWhoHasToBreak()) {
            var nextBreakPlayerName = this.players[this.shotClock.currPlayer].obj.getDisplayName();
            app.alertDlg(
                nextBreakPlayerName + ' has to break now.',
                app.dummyFalse,
                'New Rack',
                'OK'
            );
        }
    }
}

Game8910.prototype.warnLeaveGame = function () {
    app.confirmDlg(
        'If you leave this game, you will be able to resume it, but any actions prior to this point cannot be undone anymore. Are you sure you want to leave?',
        function () {
            app.dbFortune.dropTable(app.dbFortune.tables.Game8910History);
            $.mobile.changePage('../../index.html');
            return true;
        },
        app.dummyFalse,
        'Leave Game',
        'Yes,No'
    );
}



function ShotClock8910 () {
    this.firstRun            = true;
    this.clockIsRunning      = false;
    this.referenceTime       = undefined;
    this.elapsedTime         = 0;
    this.allowedTime         = 0;
    this.numCalledExtensions = undefined;
    this.currPlayer          = 0;          
    this.hadSwitch           = false;
    this.kill                = false;
        
    this.$btnShotClockCtrl               = $('#btnShotClockCtrl');
    this.$game8910ShotClockRemainingTime = $('#game8910ShotClockRemainingTime');
    this.$remainingTime                  = $('#remainingTime');
    this.$game8910ShotClockCurrPlayer    = $('#game8910ShotClockCurrPlayer');
    
    this.shotClockSound = new Media('file:///android_asset/www/sounds/beep.wav', null, null);
}

ShotClock8910.prototype.consts = {
    REFRESH_INTERVAL           : 1000,
    MILLISECONDS_PER_SECOND    : 1000,
    NO_MORE_EXTENSIONS_ALLOWED : false,
    CLOCK_IS_INACTIVE          : false,
    CLOCK_IS_ALREADY_RUNNING   : false,
    START_BEEPING_REMAINING    : 10,
};

ShotClock8910.prototype.init = function (shotTime, extensionTime, extensionsPerRack, useSoundWarning) {
    this.shotTime          = shotTime;
    this.extensionTime     = extensionTime;
    this.extensionsPerRack = extensionsPerRack;
    this.useSoundWarning   = useSoundWarning;
    
    this.resetTimes();
    this.resetCalledExtensions();
    
    // If the shot clock is used, make sure we have at least a partial wake lock
    if (this.shotTime !== 0) {
	app.FortuneUtils.setKeepScreenOn(app.FortuneUtils.WAKELOCK_PARTIAL);
    }
}

ShotClock8910.prototype.startClock = function () {
    if (this.shotTime === 0) {
        return this.consts.CLOCK_IS_INACTIVE;
    }
    
    if (this.clockIsRunning) {
        return this.consts.CLOCK_IS_ALREADY_RUNNING;
    }
    
    this.firstRun       = false;
    this.clockIsRunning = true;
    this.resetTimes();
    
    window.setTimeout(this.clockStep.bind(this), this.consts.REFRESH_INTERVAL);
    return true;
}

ShotClock8910.prototype.clockStep = function () {
    if (this.kill || $.mobile.activePage.attr('id') != 'pageGame8910') {
        return false;
    }
    
    if (this.hadSwitch) {
        this.hadSwitch = false;
        
        this.resetTimes();
        this.afterClockStep();
    } else if (this.clockIsRunning) {
        this.elapsedTime += this.consts.REFRESH_INTERVAL;
        this.afterClockStep();
    } else if (!this.clockIsRunning) {
        this.referenceTime += this.consts.REFRESH_INTERVAL;
    }
    
    var diffTime = (Date.now() - this.referenceTime) - this.elapsedTime;

    // Fix: Prevent setTimeout from going crazy
    if (diffTime >= this.consts.REFRESH_INTERVAL) {
        diffTime = 0;
    }
    
    window.setTimeout(this.clockStep.bind(this), this.consts.REFRESH_INTERVAL - diffTime);
    return true;
}

ShotClock8910.prototype.afterClockStep = function () {
    var status = {
        elapsedTime      : this.getElapsedTime(),
        elapsedSeconds   : this.getElapsedSeconds(),
        elapsedRatio     : Math.min(100, 100 * this.getElapsedTime() / this.allowedTime),
        remainingSeconds : Math.max(0, this.getRemainingSeconds()),
        outOfTime        : (this.getElapsedTime() >= this.allowedTime),
        extensionsCalled : this.numCalledExtensions[this.currPlayer],
    };

    this.$game8910ShotClockRemainingTime.html(status.remainingSeconds);
    this.$remainingTime.css('width', status.elapsedRatio + '%');
    
    if (this.useSoundWarning
        && this.clockIsRunning
        && status.remainingSeconds <= this.consts.START_BEEPING_REMAINING
	&& this.shotTime > this.consts.START_BEEPING_REMAINING) {
        
        this.playWarningSound();
	
	// make sure screen turns on
	app.FortuneUtils.turnScreenOn();
    }
    
    if (status.outOfTime) {
        var currPlayer = this.currPlayer;
        
        this.switchPlayer();
        this.pauseClock();
        
        app.confirmDlg(
            app.currentGame.players[currPlayer].obj.getDisplayName() + ' ran out of time!',
            function () {
                app.currentGame.handleFoulClick(null, currPlayer+1);
            },
            function () {
                //
            },
            'Shot Clock',
            'Add Foul,Ignore'
        );
    }
}

ShotClock8910.prototype.killClock = function () {
    this.kill = true;
}

ShotClock8910.prototype.pauseClock = function () {
    this.clockIsRunning = false;
}

ShotClock8910.prototype.unpauseClock = function () {
    if (this.firstRun) {
        this.startClock();
    } else {
        this.clockIsRunning = true;
    }
}

ShotClock8910.prototype.togglePause = function () {
    if (this.clockIsRunning) {
        this.pauseClock();
    } else {
        this.unpauseClock();
    }
}

ShotClock8910.prototype.callExtension = function () {
    var force = (typeof arguments[0] !== 'undefined') ? arguments[0] : false;
    
    if ((this.numCalledExtensions[this.currPlayer] >= this.extensionsPerRack) && !force) {
        return this.consts.NO_MORE_EXTENSIONS_ALLOWED;
    }
    
    this.numCalledExtensions[this.currPlayer]++;
    this.allowedTime += this.consts.MILLISECONDS_PER_SECOND * this.extensionTime;
    
    return true;
}

ShotClock8910.prototype.switchPlayer = function () {
    var doSwitch = (typeof arguments[0] !== 'undefined') ? arguments[0] : true;
    
    if (doSwitch) {
        this.setCurrPlayer(1 - this.currPlayer);
    }
    
    this.hadSwitch  = true;
}

ShotClock8910.prototype.setCurrPlayer = function (currPlayer) {
    this.currPlayer = currPlayer;
    this.updateCurrPlayerDisplay();
}

ShotClock8910.prototype.updateCurrPlayerDisplay = function () {
    var disp;
    try {
	disp = app.currentGame.players[this.currPlayer].obj.getDisplayName() + '\'s Turn';
    } catch (e) {
	disp = ((this.currPlayer === 0) ? 'Left' : 'Right') + ' Player';
    }
    
    this.$game8910ShotClockCurrPlayer.html(disp);
}

ShotClock8910.prototype.newRack = function () {
    this.resetCalledExtensions();
    this.pauseClock();
}

ShotClock8910.prototype.playWarningSound = function () {
    this.shotClockSound.play();
}

ShotClock8910.prototype.resetTimes = function () {
    this.referenceTime = Date.now();
    this.elapsedTime   = 0;
    this.allowedTime   = this.consts.MILLISECONDS_PER_SECOND * this.shotTime;
}
    
ShotClock8910.prototype.resetCalledExtensions = function () {
    this.numCalledExtensions = new Array(0, 0);
}

ShotClock8910.prototype.getElapsedTime = function () {
    return this.elapsedTime;
}

ShotClock8910.prototype.getRemainingTime = function () {
    return (this.allowedTime - this.getElapsedTime());
}

ShotClock8910.prototype.getElapsedSeconds = function () {
    return this.toSeconds(this.getElapsedTime());
}

ShotClock8910.prototype.getRemainingSeconds = function () {
    return this.toSeconds(this.allowedTime - this.getElapsedTime());
}

ShotClock8910.prototype.toSeconds = function (milliseconds) {
    return (milliseconds / 1000).toFixed(0);
}