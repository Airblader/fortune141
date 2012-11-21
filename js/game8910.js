function Game8910 () {
    var self = this;
    var TEMP_SCORE_DURATION = 1000,
        tmpScoreInUse       = false;
    
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
        self.shotClock.setAction(function (status) {
            $('#game8910ShotClockRemainingTime').html(status.remainingSeconds);
            $('#remainingTime').css('width', status.elapsedRatio + '%');
            
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
        });
        
        self.initHistory(cbSuccess);
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
        var $this = $('#btnShotClockCtrl');
        
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
        var $this = $('#btnShotClockCtrl');
        
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
            // Free
        }
        
        return true;
    }
    
    this.handleBtnCallExtension = function (event) {
        event.preventDefault();
        var $this = $('#btnExtension');
        
        if ($this.hasClass('btnDown')) {
            return false;
        }
        
        $this.addClass('btnDown');
        setTimeout(
            function () {
                $this.removeClass('btnDown');
            }, 300
        );
        
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
        var $this = $('#btnUndo');
        
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
    
    this.handleBtnEntry = function (event, elemID, runOut) {
        event.preventDefault();
        
        var currPlayer = parseInt(elemID.substr(elemID.length-1, 1)) - 1;
        
        self.processInput(currPlayer, runOut);
        self.updateRackScore();
        self.updateSetScore();
        
        self.saveHistory();
	self.saveGame();
    }
    
    this.updateStreak = function () {
        $('#mainPlayer1Streak').html(self.players[0].streak);
        $('#mainPlayer2Streak').html(self.players[1].streak);
    }
    
    this.updateRackScoreBars = function () {
        $('#setScore1Bar').css('width', (100 * self.players[0].racks / self.racksPerSet) + '%');
        $('#setScore2Bar').css('width', (100 * self.players[1].racks / self.racksPerSet) + '%');
    }
    
    this.updateRackScore = function () {
        if (!tmpScoreInUse) {
            tmpScoreInUse = true;
            
            $('#setScore1Value').html(self.players[0].racks);
            $('#setScore2Value').html(self.players[1].racks);
            
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
        
        $('#setScore' + (index+1) + 'Value').html(message);
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
        
        self.saveGame();
        self.saveHistory();
    }
    
    this.processInput = function (currPlayer, runOut) {
        self.shotClock.newRack();
        
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
            } else { // Game not over
                self.idxCurrentSet  = self.addSetToGame();
                self.idxCurrentRack = 0;
                
                self.players[currPlayer]  .racks = 0;
                self.players[1-currPlayer].racks = 0;
            }
        }
    }
}

// jsFiddle: http://jsfiddle.net/APquU/1/
function ShotClock8910 () {
    var self = this;
    
    this.firstRun       = true;
    this.clockIsRunning = false;
    this.referenceTime  = undefined;
    this.elapsedTime    = 0;
    this.allowedTime    = 0;
    this.numCalledExtensions = undefined;
    this.currPlayer     = 0;                // might not coincide with currPlayer in the game, but that doesn't matter here
    this.action         = undefined;
    this.hadSwitch      = false;
    this.kill           = false;
        
    var REFRESH_INTERVAL           = 1000,
        NO_MORE_EXTENSIONS_ALLOWED = false,
        CLOCK_IS_INACTIVE          = false,
        CLOCK_IS_ALREADY_RUNNING   = false;
    
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
    
    this.setAction = function (func) {
        self.action = func;
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
    
    this.switchPlayer = function () {
        self.currPlayer = 1 - self.currPlayer;
        self.hadSwitch  = true;
    }
    
    this.newRack = function () {
        self.resetCalledExtensions();
        self.switchPlayer();
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
        $('#btnShotClockCtrl').html('Start');
        self.clockIsRunning = false;
    }
    
    this.unpauseClock = function () {
        $('#btnShotClockCtrl').html('Switch');
        if (self.firstRun) {
            self.startClock();
        } else {
            self.clockIsRunning = true;
        }
    }
    
    this.callAction = function () {
        if (typeof self.action === 'function') {
            var status = {
                elapsedTime      : self.getElapsedTime(),
                elapsedSeconds   : self.getElapsedSeconds(),
                elapsedRatio     : Math.min(100, 100 * self.getElapsedTime() / self.allowedTime),
                remainingSeconds : Math.max(0, self.getRemainingSeconds()),
                outOfTime        : (self.getElapsedTime() >= self.allowedTime),
                extensionsCalled : self.numCalledExtensions[self.currPlayer],
            };
            
            self.action(status);
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