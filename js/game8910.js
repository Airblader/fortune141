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
    
    this.loadGame = function (gID, cbSuccess) {
        // TODO
    }
    
    this.saveGame = function () {
        // TODO
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
    
    this.handleBtnEntry = function (event, elemData, runOut) {
        event.preventDefault();
        
        var currPlayer = parseInt(elemData) - 1;
        
        if (self.shotClock.shotTime !== 0 && !self.shotClock.clockIsRunning) {
            app.confirmDlg(
                'The shot clock isn\'t running. Do you want to count this rack or start the clock?',
                function () {
                    self._handleBtnEntry(currPlayer, runOut);
                },
                function () {
                    self.shotClock.unpauseClock();
                },
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
        $('.mainPlayer1')     .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).data('player'), false); });
        $('.mainPlayer2')     .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).data('player'), false); });
        $('.mainPlayer1')     .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).data('player'), true);  });
        $('.mainPlayer2')     .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).data('player'), true);  });
        
        self.updateRackScore();
        self.updateSetScore();
        self.updateStreak();
        
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
    this.shotClock.init(1000 * shotClock, 1000 * extensionTime, extensionsPerRack, useSoundWarning);
    
    this.initHistory(cbSuccess);
}

Game8910.prototype.scoreToString = function () {
    var toReturn = new Array(this.sets.length);
    
    for (var i = 0; i < this.sets.length; i++) {
        toReturn[i] = '';
        
        for (var j = 0; j < this.sets[i].racks.length; j++) {
            toReturn[i] +=  this.sets[i].racks[j].wonByPlayer          + ','
                        + ((this.sets[i].racks[j].runOut) ? '1' : '0') + ';';
        }
        
        toReturn[i]  = toReturn[i].slice(0, -1);
    }
    
    return toReturn.join('|');
}

Game8910.prototype.stringToScore = function (str) {
    var sets = str.split('|');
    this.sets = new Array(sets.length);
    
    for (var i = 0; i < sets.length; i++) {
        this.sets[i] = this.getDummySet();
        var racks = sets[i].split(';');
        
        for (var j = 0; j < racks.length; j++) {
            this.sets[i].racks[j] = this.getDummyRack();
            var currentRack = racks[j].split(',');

            this.sets[i].racks[j].wonByPlayer = parseInt(currentRack[0]);
            this.sets[i].racks[j].runOut      = (currentRack[1] === '1');
        }
    }
}

Game8910.prototype.addSetToGame = function () {
    var setsLength = this.sets.push(this.getDummySet());
    
    for (var i = 0; i < this.racksPerSet; i++) {
        this.sets[setsLength-1].racks[i] = this.getDummyRack();
    }
    
    return setsLength-1;
}

Game8910.prototype.getSetMarkerSize = function (factor) {
    var windowWidth = $(window).width();
    
    return Math.min(80, windowWidth / (factor*this.numberOfSets));
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
        racks: new Array(this.racksPerSet),
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
    
    if (typeof this.firstBreak === 'undefined') {
        this.firstBreak = idx;
    }
}

Game8910.prototype._updateSetScore = function (idxSet, wonByPlayer) {
    // TODO
    $('#setMarker' + idxSet).css('opacity', (wonByPlayer+1)/2);
}

Game8910.prototype.updateSetScore = function () {
    for (var i = 0; i < this.numberOfSets; i++) {
        // TODO
        this._updateSetScore(i, (typeof this.sets[i] !== 'undefined') ? this.sets[i].wonByPlayer : -1);
    }
}

Game8910.prototype.processInput = function (currPlayer, runOut) {
    this.shotClock.newRack();
    
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
    this.updateStreak();
    
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
        
        if (this.idxCurrentSet + 1 === this.numberOfSets) { // Game is over
            this.isFinished = true;
            
            if (this.players[0].sets === this.players[1].sets) { // Game ended tied
                this.winner = 0;
                
                // TODO
                alert('Game ended in a tie!');
            } else { // Game ended regularly
                var idxWinner = (this.players[1].sets > this.players[0].sets) ? 1 : 0;
                this.winner = this.players[idxWinner].obj.pID;
                
                // TODO
                alert(this.players[idxWinner].obj.getDisplayName() + ' has won the game!');
            }
            
            return;
        } else { // Game not over
            this.idxCurrentSet  = this.addSetToGame();
            this.idxCurrentRack = 0;
            
            this.players[currPlayer]  .racks = 0;
            this.players[1-currPlayer].racks = 0;
            
            function cleanName (name) {
                return name.replace(/,/g, ''); // TODO
            }
            
            app.confirmDlg(
                'The current set is finished. Who will have the break shot for the first rack of the next set?',
                function () {
                    this.setLastBreak.bind(this, 1);
                    this.shotClock.setCurrPlayer.bind(this, 1);
                },
                function () {
                    this.setLastBreak.bind(this, 0);
                    this.shotClock.setCurrPlayer.bind(this, 0);
                },
                this.gameType + '-Ball',
                cleanName(this.players[1].obj.getDisplayName()) + ',' + cleanName(this.players[0].obj.getDisplayName())
            );
        }
    } else {
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
        'Yes, No'
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
}

ShotClock8910.prototype.consts = {
    REFRESH_INTERVAL           : 1000,
    NO_MORE_EXTENSIONS_ALLOWED : false,
    CLOCK_IS_INACTIVE          : false,
    CLOCK_IS_ALREADY_RUNNING   : false,
};

ShotClock8910.prototype.init = function (shotTime, extensionTime, extensionsPerRack, useSoundWarning) {
    this.shotTime          = shotTime;
    this.extensionTime     = extensionTime;
    this.extensionsPerRack = extensionsPerRack;
    this.useSoundWarning   = useSoundWarning;
    
    this.resetTimes();
    this.resetCalledExtensions();
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
    
    if (status.outOfTime) {
        this.shotClock.pauseClock();
        this.shotClock.switchPlayer();
        
        app.confirmDlg(
            'Oops! You ran out of time!',
            app.dummyFalse, // TODO
            app.dummyFalse,
            'ShotClock',
            'Add Foul,Ignore'
        );
    }
}

ShotClock8910.prototype.killClock = function () {
    this.kill = true;
}

ShotClock8910.prototype.pauseClock = function () {
    this.$btnShotClockCtrl.html('Start');
    this.clockIsRunning = false;
}

ShotClock8910.prototype.unpauseClock = function () {
    this.$btnShotClockCtrl.html('Switch');
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
    this.allowedTime += this.extensionTime;
    
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
    this.$game8910ShotClockCurrPlayer.html(
        ((this.currPlayer === 0) ? 'Left' : 'Right')
        + ' Player'
    );
}

ShotClock8910.prototype.newRack = function () {
    this.resetCalledExtensions();
    this.pauseClock();
}

ShotClock8910.prototype.resetTimes = function () {
    this.referenceTime = Date.now();
    this.elapsedTime   = 0;
    this.allowedTime   = this.shotTime;
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