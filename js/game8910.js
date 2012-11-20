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
        self.shotClock.init(shotClock, extensionTime, extensionsPerRack, useSoundWarning);
        
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
        
        // TODO
        
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
        
        $('#shotClockWrapper')  .toggle(self.shotClock.isActive);
        $('#setOverviewWrapper').toggle(self.numberOfSets > 1);
        
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
        
        $('#btnExtension').off('vlick')  .on('vclick',  self.handleBtnCallExtension);
        $('#btnUndo')     .off('vlick')  .on('vclick',  self.handleBtnUndo);
        $('#mainPlayer1') .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).attr('id'), false); });
        $('#mainPlayer2') .off('click')  .on('click',   function (event) { self.handleBtnEntry(event, $(this).attr('id'), false); });
        $('#mainPlayer1') .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).attr('id'), true);  });
        $('#mainPlayer2') .off('taphold').on('taphold', function (event) { self.handleBtnEntry(event, $(this).attr('id'), true);  });
        
        self.updateRackScore();
        self.updateSetScore();
        
        self.saveGame();
        self.saveHistory();
    }
    
    this.processInput = function (currPlayer, runOut) {
        var tmpScoreMessage = '';
        
        self.sets[self.idxCurrentSet].racks[self.idxCurrentRack].wonByPlayer = currPlayer;
        
        if (runOut) {
            self.players[currPlayer].streak++;
            self.sets[self.idxCurrentSet].racks[self.idxCurrentRack].runOut = true;
            
            tmpScoreMessage = 'RUNOUT!';
        } else {
            self.players[currPlayer].streak = 0;
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

function ShotClock8910 () {
    var self = this;
    
    this.refreshInterval = 1000;
    this.isActive = false;
    
    this.init = function (time, extension, extensionsPerRack, useSoundWarning) {
        self.shotTime          = time;
        self.extensionTime     = extension;
        self.extensionsPerRack = extensionsPerRack;
        self.useSoundWarning   = useSoundWarning;
        
        self.isActive = (self.shotTime > 0);
    }
    
    // TODO
}