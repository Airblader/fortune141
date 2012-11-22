function Game8910 () {
    var self = this;
    var TEMP_SCORE_DURATION = 1000,
        tmpScoreInUse       = false;
    
    var $btnShotClockCtrl  = $('#btnShotClockCtrl'),
        $btnExtension      = $('#btnExtension'),
        $btnUndo           = $('#btnUndo'),
        $mainPlayer1Streak = $('#mainPlayer1Streak'),
        $mainPlayer2Streak = $('#mainPlayer2Streak'),
        $setScore1Bar      = $('#setScore1Bar'),
        $setScore2Bar      = $('#setScore2Bar'),
        $setScore1Value    = $('#setScore1Value'),
        $setScore2Value    = $('#setScore2Value');
    
    this.gameID       = -1;
    this.historyStack = new Array();
 
    this.getDummyPlayer = function () {
        return {
            fouls:  0,
            sets:   0,
            racks:  0,
            streak: 0,
            obj:    undefined,
        };
    }
    
    this.getDummySet = function () {
        return {
            wonByPlayer: -1,
            racks: new Array(self.racksPerSet),
        };
    }
    
    this.getDummyRack = function () {
        return {
            wonByPlayer: -1,
            runOut: false,
        };
    }
    
    this.addSetToGame = function () {
        var setsLength = self.sets.push(self.getDummySet());
        
        for (var i = 0; i < self.racksPerSet; i++) {
            self.sets[setsLength-1].racks[i] = self.getDummyRack();
        }
        
        return setsLength-1;
    }
    
    this.getSetMarkerSize = function (factor) {
        var windowWidth = $(window).width();
        
        return Math.min(80, windowWidth / (factor*self.numberOfSets));
    }
    
    this.initNewGame = function (gameType, breakType, mode, racksPerSet, numberOfSets, shotClock, extensionTime, extensionsPerRack, useSoundWarning, cbSuccess) {
        self.players    = new Array(self.getDummyPlayer(),
                                    self.getDummyPlayer());
        self.timestamp  = Math.floor(Date.now() / 1000).toFixed(0);
        
        self.isFinished = false;
	self.winner     = -1;
        
        self.firstBreak = -1;
        self.lastBreak  = -1;
        
        self.gameType     = gameType;
        self.breakType    = breakType;
        self.mode         = mode;
        self.racksPerSet  = racksPerSet;
        self.numberOfSets = numberOfSets;
        
        self.sets = new Array();
        self.idxCurrentSet  = self.addSetToGame();
        self.idxCurrentRack = 0;

        self.shotClock = new ShotClock8910();
        self.shotClock.init(1000 * shotClock, 1000 * extensionTime, extensionsPerRack, useSoundWarning);
        
        self.initHistory(cbSuccess);
    }
    
    this.scoreToString = function () {
        var toReturn = new Array(self.sets.length);
        
        for (var i = 0; i < self.sets.length; i++) {
            toReturn[i] = '';
            
            for (var j = 0; j < self.sets[i].racks.length; j++) {
                toReturn[i] +=  self.sets[i].racks[j].wonByPlayer          + ','
                            + ((self.sets[i].racks[j].runOut) ? '1' : '0') + ';';
            }
            
            toReturn[i]  = toReturn[i].slice(0, -1);
        }
        
        return toReturn.join('|');
    }
    
    this.stringToScore = function (str) {
        var sets = str.split('|');
        self.sets = new Array(sets.length);
        
        for (var i = 0; i < sets.length; i++) {
            self.sets[i] = self.getDummySet();
            var racks = sets[i].split(';');
            
            for (var j = 0; j < racks.length; j++) {
                self.sets[i].racks[j] = self.getDummyRack();
                var currentRack = racks[j].split(',');

                self.sets[i].racks[j].wonByPlayer = parseInt(currentRack[0]);
                self.sets[i].racks[j].runOut      = (currentRack[1] === '1');
            }
        }
    }
    
    this.loadGame = function (gID, cbSuccess) {
        // TODO
    }
    
    this.saveGame = function () {
        // TODO
    }
    
    this.setPlayers = function () {
        var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse;
	  
	self.players[0].obj = undefined;
	self.players[1].obj = undefined;
	    
	self.players[0].obj = app.Players.ingame[0];
	self.players[1].obj = app.Players.ingame[1];
	
	cbSuccess();
    }
    
    this.setLastBreak = function (idx) {
        self.lastBreak = idx;
        
        if (typeof self.firstBreak === 'undefined') {
            self.firstBreak = idx;
        }
    }
    
    this.warnLeaveGame = function () {
        app.confirmDlg(
	    'If you leave this game, you will be able to resume it, but any actions prior to this point cannot be undone anymore. Are you sure you want to leave?',
	    function () {
		app.dbFortune.dropTable(app.dbFortune.tables.Game8910History);
		$.mobile.changePage('../../index.html');
		return true;
	    },
	    app.dummyFalse,
	    'Leave Game',
	    'Yes, No'
	);
    }
    
    this.initHistory = function (cbSuccess) {
        // TODO
        
        cbSuccess();
    }
    
    this.saveHistory = function () {
        // TODO
    }
    
    this.loadHistory = function () {
        // TODO
    }
    
    this.undo = function () {
        // TODO
    }
    
    this.handleBtnShotClockCtrlTap = function (event) {
        event.preventDefault();
        var $this = $btnShotClockCtrl;
        
        if ($this.hasClass('btnDown')) {
            return false;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (self.shotClock.clockIsRunning) {
            self.shotClock.switchPlayer();
            self.shotClock.pauseClock();
        } else {
            self.shotClock.unpauseClock();
        }
        
        return true;
    }
    
    this.handleBtnShotClockCtrlTapHold = function (event) {
        event.preventDefault();
        var $this = $btnShotClockCtrl;
        
        if ($this.hasClass('btnDown')) {
            return false;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        if (self.shotClock.clockIsRunning) {
            self.shotClock.pauseClock();
        } else {
            if (self.shotClock.firstRun) {
                self.firstBreak = 1 - self.firstBreak;
                self.lastBreak  = self.firstBreak;
                
                self.shotClock.switchPlayer();
            } else {
                // Free
            }
        }
        
        return true;
    }
    
    this.handleBtnCallExtension = function (event) {
        event.preventDefault();
        var $this = $btnExtension;
        
        if ($this.hasClass('btnDown')) {
            return false;
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
                'ShotClock',
                'OK'
            );
            
            return false;
        }
        
        if(!self.shotClock.callExtension()) {
            self.shotClock.pauseClock();
            
            app.confirmDlg(
                'This player has used up all his extensions. Grant extension anyway?',
                function () {
                    self.shotClock.callExtension(true);
                    self.shotClock.unpauseClock();
                },
                self.shotClock.unpauseClock,
                'ShotClock',
                'Yes,No'
            );
        }
        
        return true;
    }
    
    this.handleBtnUndo = function (event) {
        event.preventDefault();
        var $this = $btnUndo;
        
        if ($this.hasClass('btnDown')) {
            return false;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
        // TODO
        
        return true;
    }
    
    this._handleBtnEntry = function (currPlayer, runOut) {
        self.processInput(currPlayer, runOut);
        self.updateRackScore();
        self.updateSetScore();
        
        self.saveHistory();
	self.saveGame();
    }
    
    this.handleBtnEntry = function (event, elemID, runOut) {
        event.preventDefault();
        
        var currPlayer = parseInt(elemID.substr(elemID.length-1, 1)) - 1;
        
        if (self.shotClock.shotTime !== 0 && !self.shotClock.clockIsRunning) {
            app.confirmDlg(
                'The shot clock isn\'t running. Do you want to count this rack or start the clock?',
                function () {
                    self._handleBtnEntry(currPlayer, runOut);
                },
                self.shotClock.unpauseClock,
                '',
                'Count Rack,Start Clock'
            );
        } else {
            self._handleBtnEntry(currPlayer, runOut);
        }
    }
    
    this.updateStreak = function () {
        $mainPlayer1Streak.html(self.players[0].streak);
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
    
    this._updateSetScore = function (idxSet, wonByPlayer) {
        // TODO
        $('#setMarker' + idxSet).css('opacity', (wonByPlayer+1)/2);
    }
    
    this.updateSetScore = function () {
        for (var i = 0; i < self.numberOfSets; i++) {
            // TODO
            self._updateSetScore(i, (typeof self.sets[i] !== 'undefined') ? self.sets[i].wonByPlayer : -1);
        }
    }
    
    this.initUI = function () {
        $('#game8910GameType').html(self.gameType);
        
        $('#shotClockWrapper')  .toggle(self.shotClock.shotTime !== 0);
        $('#setOverviewWrapper').toggle(self.numberOfSets > 1);
        
        $('#game8910ShotClockRemainingTime').html(self.shotClock.getRemainingSeconds());
        
        $('#mainPlayer1Name').html(self.players[0].obj.getDisplayName());
        $('#mainPlayer2Name').html(self.players[1].obj.getDisplayName());
        
        $('#mainPlayer1Img').attr('src',
            (self.players[0].obj.image.length > 0) ? self.players[0].obj.image : 'file:///android_asset/www/img/players/playerDummy.jpg');
        $('#mainPlayer2Img').attr('src',
            (self.players[1].obj.image.length > 0) ? self.players[1].obj.image : 'file:///android_asset/www/img/players/playerDummy.jpg');
        
        var setMarkerFactor = 0.2;
            setMarkerSize   = self.getSetMarkerSize(1 + 2*setMarkerFactor),
            setMarkerHTML   = '',
            setMarkerDummy  = '<img src="file:///android_asset/www/img/players/playerDummy.jpg" id="setMarker[ID]" style="width: [width]; height: [height]; margin: 20px [margin-left] 20px [margin-right];" />';
        for (var i = 0; i < self.numberOfSets; i++) {
            setMarkerHTML += setMarkerDummy
                                .replace('[ID]',           i)
                                .replace('[width]',                         setMarkerSize  + 'px')
                                .replace('[height]',                        setMarkerSize  + 'px')
                                .replace('[margin-left]',  (setMarkerFactor*setMarkerSize) + 'px')
                                .replace('[margin-right]', (setMarkerFactor*setMarkerSize) + 'px');
        }
        $('#setOverview').html(setMarkerHTML);
        
        $('#btnShotClockCtrl').off('tap')    .on('tap',     self.handleBtnShotClockCtrlTap);
        $('#btnShotClockCtrl').off('taphold').on('taphold', self.handleBtnShotClockCtrlTapHold);
        $('#btnExtension')    .off('vlick')  .on('vclick',  self.handleBtnCallExtension);
        $('#btnUndo')         .off('vlick')  .on('vclick',  self.handleBtnUndo);
        $('#mainPlayer1')     .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).attr('id'), false); });
        $('#mainPlayer2')     .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).attr('id'), false); });
        $('#mainPlayer1')     .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).attr('id'), true);  });
        $('#mainPlayer2')     .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).attr('id'), true);  });
        
        self.updateRackScore();
        self.updateSetScore();
        self.updateStreak();
        
        /*if (self.shotClock.shotTime === 0 && self.breakType !== 2) {
            self.saveGame();
            self.saveHistory();
            
            return;
        }*/
        
        function cleanName (name) {
            return name.replace(/,/g, ''); // TODO
        }
        
        app.confirmDlg(
            'Please select which player has won the lag and will therefore break the first rack:',
            function () {
                self.setLastBreak(1);
                self.shotClock.setCurrPlayer(1);
                
                self.saveGame();
                self.saveHistory();
            },
            function () {
                self.setLastBreak(0);
                self.shotClock.setCurrPlayer(0);
                
                self.saveGame();
                self.saveHistory();
            },
            self.gameType + '-Ball',
            cleanName(self.players[1].obj.getDisplayName()) + ',' + cleanName(self.players[0].obj.getDisplayName())
        );
    }
    
    this.processInput = function (currPlayer, runOut) {
        self.shotClock.newRack();
        
        switch (self.breakType) {
            case 0: // Winner
                self.setLastBreak(currPlayer);
                self.shotClock.switchPlayer(self.shotClock.currPlayer !== currPlayer);
                break;
            case 1: // Loser
                self.setLastBreak(1-currPlayer);
                self.shotClock.switchPlayer(self.shotClock.currPlayer === currPlayer);
                break;
            case 2: // Alternate
                self.setLastBreak(1-self.lastBreak);
                self.shotClock.switchPlayer(self.shotClock.currPlayer !== self.lastBreak);
                break;
        }
        
        var tmpScoreMessage = '';
        
        self.sets[self.idxCurrentSet].racks[self.idxCurrentRack].wonByPlayer = currPlayer;
        
        self.players[  currPlayer].streak++;
        self.players[1-currPlayer].streak = 0;
        self.updateStreak();
        
        if (runOut) {
            self.sets[self.idxCurrentSet].racks[self.idxCurrentRack].runOut = true;
            tmpScoreMessage = 'RUNOUT!';
        }
        
        var newRackScore = ++self.players[currPlayer].racks;
        
        if (tmpScoreMessage.length !== 0) {
            self.tempRackScore(currPlayer, tmpScoreMessage);
        } else {
            self.updateRackScore();
        }
        
        if (newRackScore >= self.racksPerSet) {            
            self.players[currPlayer].sets++;
            self.sets[self.idxCurrentSet].wonByPlayer = currPlayer;
            
            if (self.idxCurrentSet + 1 === self.numberOfSets) { // Game is over
                self.isFinished = true;
                
                if (self.players[0].sets === self.players[1].sets) { // Game ended tied
                    self.winner = 0;
                    
                    // TODO
                    alert('Game ended in a tie!');
                } else { // Game ended regularly
                    var idxWinner = (self.players[1].sets > self.players[0].sets) ? 1 : 0;
                    self.winner = self.players[idxWinner].obj.pID;
                    
                    // TODO
                    alert(self.players[idxWinner].obj.getDisplayName() + ' has won the game!');
                }
                
                return;
            } else { // Game not over
                self.idxCurrentSet  = self.addSetToGame();
                self.idxCurrentRack = 0;
                
                self.players[currPlayer]  .racks = 0;
                self.players[1-currPlayer].racks = 0;
                
                function cleanName (name) {
                    return name.replace(/,/g, ''); // TODO
                }
                
                app.confirmDlg(
                    'The current set is finished. Who will have the break shot for the first rack of the next set?',
                    function () {
                        self.setLastBreak(1);
                        self.shotClock.setCurrPlayer(1);
                    },
                    function () {
                        self.setLastBreak(0);
                        self.shotClock.setCurrPlayer(0);
                    },
                    self.gameType + '-Ball',
                    cleanName(self.players[1].obj.getDisplayName()) + ',' + cleanName(self.players[0].obj.getDisplayName())
                );
            }
        } else {
            if (self.breakType === 2 && app.settings.get8910NotifyWhoHasToBreak()) {
                app.alertDlg(
                    self.players[self.shotClock.currPlayer].obj.getDisplayName() + ' has to break now.',
                    app.dummyFalse,
                    'New Rack',
                    'OK'
                );
            }
        }
    }
}


function ShotClock8910 () {
    var self = this;
    
    this.firstRun       = true;
    this.clockIsRunning = false;
    this.referenceTime  = undefined;
    this.elapsedTime    = 0;
    this.allowedTime    = 0;
    this.numCalledExtensions = undefined;
    this.currPlayer     = 0;          
    this.hadSwitch      = false;
    this.kill           = false;
        
    var REFRESH_INTERVAL           = 1000,
        NO_MORE_EXTENSIONS_ALLOWED = false,
        CLOCK_IS_INACTIVE          = false,
        CLOCK_IS_ALREADY_RUNNING   = false;
        
    var $btnShotClockCtrl               = $('#btnShotClockCtrl'),
        $game8910ShotClockRemainingTime = $('#game8910ShotClockRemainingTime'),
        $remainingTime                  = $('#remainingTime'),
        $game8910ShotClockCurrPlayer    = $('#game8910ShotClockCurrPlayer');
    
    this.init = function (shotTime, extensionTime, extensionsPerRack, useSoundWarning) {
        self.shotTime          = shotTime;
        self.extensionTime     = extensionTime;
        self.extensionsPerRack = extensionsPerRack;
        self.useSoundWarning   = useSoundWarning;
        
        self.resetTimes();
        self.resetCalledExtensions();
    }
    
    this.startClock = function () {
        if (self.shotTime === 0) {
            return CLOCK_IS_INACTIVE;
        }
        
        if (self.clockIsRunning) {
            return CLOCK_IS_ALREADY_RUNNING;
        }
        
        self.firstRun       = false;
        self.clockIsRunning = true;
        self.resetTimes();
        
        window.setTimeout(self.clockStep, REFRESH_INTERVAL);
        return true;
    }
    
    this.killClock = function () {
        self.kill = true;
    }
    
    this.togglePause = function () {
        if (self.clockIsRunning) {
            self.pauseClock();
        } else {
            self.unpauseClock();
        }
    }
    
    this.getElapsedTime = function () {
        return self.elapsedTime;
    }
    
    this.getRemainingTime = function () {
        return (self.allowedTime - self.getElapsedTime());
    }
    
    this.getElapsedSeconds = function () {
        return self.toSeconds(self.getElapsedTime());
    }
    
    this.getRemainingSeconds = function () {
        return self.toSeconds(self.allowedTime - self.getElapsedTime());
    }
    
    this.callExtension = function () {
        var force = (typeof arguments[0] !== 'undefined') ? arguments[0] : false;
        
        if ((self.numCalledExtensions[self.currPlayer] >= self.extensionsPerRack) && !force) {
            return NO_MORE_EXTENSIONS_ALLOWED;
        }
        
        self.numCalledExtensions[self.currPlayer]++;
        self.allowedTime += self.extensionTime;
        
        return true;
    }
    
    this.updateCurrPlayerDisplay = function () {
        $game8910ShotClockCurrPlayer.html(
            ((self.currPlayer === 0) ? 'Left' : 'Right')
            + ' Player'
        );
    }
    
    this.setCurrPlayer = function (currPlayer) {
        self.currPlayer = currPlayer;
        self.updateCurrPlayerDisplay();
    }
    
    this.switchPlayer = function () {
        var doSwitch = (typeof arguments[0] !== 'undefined') ? arguments[0] : true;
        
        if (doSwitch) {
            self.setCurrPlayer(1 - self.currPlayer);
        }
        
        self.hadSwitch  = true;
    }
    
    this.newRack = function () {
        self.resetCalledExtensions();
        self.pauseClock();
    }
    
    this.resetTimes = function () {
        self.referenceTime  = Date.now();
        self.elapsedTime    = 0;
        self.allowedTime    = self.shotTime;
    }
    
    this.resetCalledExtensions = function () {
        self.numCalledExtensions = new Array(0, 0);
    }
    
    this.pauseClock = function () {
        $btnShotClockCtrl.html('Start');
        self.clockIsRunning = false;
    }
    
    this.unpauseClock = function () {
        $btnShotClockCtrl.html('Switch');
        if (self.firstRun) {
            self.startClock();
        } else {
            self.clockIsRunning = true;
        }
    }
    
    this.callAction = function () {
        var status = {
            elapsedTime      : self.getElapsedTime(),
            elapsedSeconds   : self.getElapsedSeconds(),
            elapsedRatio     : Math.min(100, 100 * self.getElapsedTime() / self.allowedTime),
            remainingSeconds : Math.max(0, self.getRemainingSeconds()),
            outOfTime        : (self.getElapsedTime() >= self.allowedTime),
            extensionsCalled : self.numCalledExtensions[self.currPlayer],
        };

        $game8910ShotClockRemainingTime.html(status.remainingSeconds);
        $remainingTime.css('width', status.elapsedRatio + '%');
        
        if (status.outOfTime) {
            self.shotClock.pauseClock();
            self.shotClock.switchPlayer();
            
            app.alertDlg(
                'Out of time!',
                app.dummyFalse,
                'ShotClock',
                'OK'
            );
        }
    }
    
    this.clockStep = function () {
        if (self.kill || $.mobile.activePage.attr('id') != 'pageGame8910') {
            return false;
        }
        
        if (self.hadSwitch) {
            self.hadSwitch = false;
            
            self.resetTimes();
            self.callAction();
        } else if (self.clockIsRunning) {
            self.elapsedTime += REFRESH_INTERVAL;
            self.callAction();
        } else if (!self.clockIsRunning) {
            self.referenceTime += REFRESH_INTERVAL;
        }
        
        var diffTime = (Date.now() - self.referenceTime) - self.elapsedTime;

        // Fix: Prevent setTimeout from going crazy
        if (diffTime >= REFRESH_INTERVAL) {
            diffTime = 0;
        }
        
        window.setTimeout(self.clockStep, REFRESH_INTERVAL - diffTime);
        return true;
    }
    
    self.toSeconds = function (milliseconds) {
        return (milliseconds / 1000).toFixed(0);
    }
}