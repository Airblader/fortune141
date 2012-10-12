function BallRack (debugMode) {
    var self = this;
    
    // debugMode means you run it in a browser, not on a mobile phone
    self.debugMode = debugMode;
    
    self.targetDiv = '#ballRack';
    self.imgPath   = 'img/rack/ball';
    self.imgSuffix = '.png';
    
    var divWidth,
        divHeight = 0;
    
    self.ballsOnTable = 15;
    self.selectedBall = self.ballsOnTable;
    
    self.ballSizeSmall = 60;
    
    var ballPositions = new Array();
    
    if (self.debugMode) {
        var touchCommands = "mousedown";
    }
    else {
        var touchCommands = 'touchstart touchmove touchend';
    }
    
    /*
     * Needs to be called once to create ball positions
     */
    self.calcBallPositions = function () {
        if (ballPositions.length > 0) {
            return;
        }
        
        var idxRowBreaks = new Array(2, 4, 7, 11);
    
        var ballRadiusSmall = self.ballSizeSmall/2;
        
        var stepX = self.ballSizeSmall,
            stepY = Math.ceil(ballRadiusSmall * Math.sqrt(3));
            
        var currX = 2 * stepX + ballRadiusSmall,
            currY = ballRadiusSmall;
            
        ballPositions.push({x: 0, y: 0}); // dummy for empty ball/cue ball
        for (var i=1; i<=15; i++) {
            var idxOf = idxRowBreaks.indexOf(i);
            if (idxOf != -1) {
                currX  = 2 * stepX - idxOf * ballRadiusSmall;
                currY += stepY;
            }
            
            ballPositions.push({x: currX, y: currY});
            currX += stepX;
        }
        
        // now we fill the empty ball/cue ball
        ballPositions[0].x = ballPositions[11].x + ballRadiusSmall/2;
        ballPositions[0].y = (ballPositions[2].y + ballPositions[1].y)/2;
        
        divWidth  = 4 * stepX + self.ballSizeSmall;
        divHeight = self.ballSizeSmall + 4 * stepY;
    }
    
    /*
     *  Sets the rack into the correct position(s)
     *  Call calcBallPositions() first!
     */
    self.drawRack = function () {
        $(self.targetDiv).css('width',  divWidth  + 'px')
                         .css('height', divHeight + 'px')
                         .css('left', '50%')
                         .css('margin-left', (-divWidth/2) + 'px');
        
	var shadowFactor = 1.35;
        for (var i=0; i<=15; i++) {
            $('#ball' + i).css('position', 'absolute')
                          .css('width', self.ballSizeSmall + 'px')
                          .css('height', self.ballSizeSmall + 'px')
                          .css('margin-left', (-self.ballSizeSmall/2) + 'px')
                          .css('margin-top', (-self.ballSizeSmall/2) + 'px')
                          .css('left', ballPositions[i].x + 'px')
                          .css('top', ballPositions[i].y + 'px'); 

            $('#shadow' + i).css('position', 'absolute')
                            .css('width', shadowFactor*self.ballSizeSmall + 'px')
                            .css('height', shadowFactor*self.ballSizeSmall + 'px')
                            .css('margin-left', (-shadowFactor*self.ballSizeSmall/2) + 'px')
                            .css('margin-top', (-shadowFactor*self.ballSizeSmall/2) + 'px')
                            .css('left', ballPositions[i].x + 'px')
                            .css('top', ballPositions[i].y + 'px'); 
        }
    }
    
    self.setActiveBall = function (idx) {
        var active = true;
        if (typeof arguments[1] !== 'undefined') {
            active = arguments[1];
        }
        var opacity = (active) ? '1.0' : '0.4';
        
        $('#ball' + idx).css('opacity', opacity);
		
	if (active) {
	    $('#shadow' + idx).addClass('ballShadow');
	}
	else {
	    $('#shadow' + idx).removeClass('ballShadow');
	}
    }
    
    self.redraw = function() {
        for (var i = 0; i <= 15; i++) {
            var isActive = false;
            if (i <= self.selectedBall) {
                isActive = true;
            }
            
            self.setActiveBall(i, isActive);
        }
    }
    
    self.setHandler = function () {
        $('body').on(touchCommands, self.targetDiv, function(e) { self.ballSelectHandler(e); });    
    }

    self.unsetHandler = function () {
        $('body').off(touchCommands, self.targetDiv);
    }
    
    self.ballSelectHandler = function (event) {
        event.preventDefault();
        self.unsetHandler();
        
        if (self.debugMode) {
            var x = event.pageX;
            var y = event.pageY;
        }
        else {
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            var x = touch.pageX;
            var y = touch.pageY;
        }
        
        var currElement = document.elementFromPoint(x, y);
        var id = $(currElement).attr('id');
        // only if it's a ball element and open for selection
        if (typeof id !== 'undefined' && id.substr(0, 4) == 'ball' && parseInt(id.substr(4)) <= self.ballsOnTable) {
            self.selectedBall = parseInt(id.substr(4));
        }
        
        self.redraw();
        
        self.setHandler();
    }
}

/*
 *  Class for straight pool games
 */
function StraightPool () {
    var self = this;
    
    self.pageName = '#pageGame141';
    self.ballRack = new BallRack(false);
    
    // true when current shot is a break shot (e.g. first shot of game or after severe fouls)
    self.firstShot = true;
    
    // misc
    var btnAcceptPressed = false,
        yesno            = new Array("Yes", "No");
    
    self.dummyPlayer = function () {
        return {
                    id    : 0,
                    fouls : 0,
                    points: 0,
               };
    }
    
    self.dummyInning = function () {
        return {
                    number   : 1,
                    points   : new Array(0, 0),
                    foulPts  : new Array(0, 0),
                    ptsToAdd : new Array(0, 0),
                    safety   : new Array(false, false),
               };
    }
    
    self.initNewGame = function () {
        self.players         = new Array(self.dummyPlayer(), self.dummyPlayer());
        self.currPlayer      = 0;
        self.firstShotOfRack = 0;
        self.innings          = new Array(self.dummyInning());
    }
    
    self.newInning = function () {
        // if last inning wasn't processed correctly, throw error
        var current = self.innings.length-1;
        if (self.innings[current].ptsToAdd[0] != -1 || self.innings[current].ptsToAdd[1] != -1) {
            throw new Error('Cannot create new inning. Last inning has unprocessed points!');
        }
        
        var inning = self.dummyInning();
        inning.number = self.innings.length + 1;
        
        self.innings.push(inning);
    }
    
    self.setPlayer = function (idx) {
        // ToDo
    }
	
    self.warnConsecutiveFouls = function () {
        $('#consecFoulsWarning').popup("open");
    }
    
    /*
     *  Takes optional parameter "hardReset"
     */
    self.switchPlayer = function () {
        self.currPlayer = (self.currPlayer == 0) ? 1 : 0;
        
        var hardReset = (typeof arguments[0] !== 'undefined') ? arguments[0] : false;

        if (hardReset) {        
            var current = self.innings.length-1;
            self.innings[current].ptsToAdd[self.currPlayer] = 0;
            self.innings[current].points[self.currPlayer]   = 0;
            self.innings[current].foulPts[self.currPlayer]  = 0;
            self.innings[current].safety[self.currPlayer]   = false;
        }
		
	// check for consecutive fouls to warn
	if (self.players[self.currPlayer].fouls == 2) {
	    self.warnConsecutiveFouls();
	}
    }
    
    self.loadGame = function () {
        // ToDo
        return false;
    }
    
    self.saveGame = function () {
        // ToDo
        return false;
    }
    
    self.setFoulDisplay = function (fouls) {
	var firstShot = (typeof arguments[1] !== 'undefined') ? arguments[1] : false,
	    severe    = (typeof arguments[2] !== 'undefined') ? arguments[2] : false,
	    maxFouls  = Number(firstShot) + 1,
	    foulCount = (severe) ? fouls : (fouls % (maxFouls+1));
    
	var foulName = "None";
	if (foulCount == 1 && !severe) {
	    foulName = "Normal";
	}
	else if (foulCount > 1 || severe) {
	    foulName = "Severe";
	    
	    // Setting rerack to true might not always be technically correct, as a player after
	    // a first shot foul has a choice. However, there will be 15 balls on the table anyway,
	    // so this won't have an effect on that situation
	    $('#foulDisplayName').data('rerack', true);
	}
	
	// check for valid number
	if ($.isNumeric(foulCount)) {
	    $('#foulDisplay').html(foulCount);
	    $('#foulDisplayName').html(foulName);
	}
    }
    
    self.processInput = function(ballsOnTable, selectedBall, foulPts, safety, rerack) {
        var current = self.innings.length-1;
        var switchPlayer = false;
        var hasToRerack = rerack;
        
        // create new inning if neccessary
        if (self.innings[current].ptsToAdd[0] == -1 && self.innings[current].ptsToAdd[1] == -1) {
            self.newInning();
            current++;
        }
        
        var currPlayer = self.currPlayer;
        
        // we will return this value to provide information on the processed inning
        var ret = {
                    ballsOnTable: parseInt(selectedBall),
                    firstShot   : false,
                    currPlayer  : currPlayer,
                    current     : current,
                    safety      : safety,
                    rerack      : hasToRerack,
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
            }
            else {
                self.players[currPlayer].fouls = 0;
            }
            
            // 3 foul rule
            if (self.players[currPlayer].fouls == 3) {
                self.innings[current].foulPts[currPlayer] += 15;
                self.players[currPlayer].fouls = 0;
                
                /*
                 * Ruling: Applying 3 foul rule causes rerack
                 */
                hasToRerack = true;
                ret.rerack  = true;
            }
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
                    self.innings[current].points[currPlayer] = self.innings[current].ptsToAdd[currPlayer] - self.innings[current].foulPts[currPlayer];
                    
                    self.innings[current].ptsToAdd[currPlayer] = -1;
                }
                
                ret.ballsOnTable = 15;
                ret.firstShot    = true;
                break;
            
            default:
                if (!hasToRerack) {
                    self.innings[current].points[currPlayer] = self.innings[current].ptsToAdd[currPlayer] - self.innings[current].foulPts[currPlayer];
                
                    self.innings[current].ptsToAdd[currPlayer] = -1;
                    switchPlayer = true;
                }
                
                ret.firstShot    = false;
        }
        
        if (switchPlayer && !hasToRerack) {
            self.switchPlayer();
        }
        
        // now update global points
        self.players[currPlayer].points += self.innings[current].points[currPlayer];
        
        return ret;
    }

    self.getPanelHeights = function () {
	var viewPortHeight = $(window).height(),
	    headerHeight   = $(self.pageName).find('[data-role="header"]') .height(),
	    contentHeight  = $(self.pageName).find('[data-role="content"]').height();
		    
	return {
		mainPanel    : viewPortHeight - headerHeight - contentHeight - 25,
		detailsPanel : viewPortHeight,
	       }
    }
    
    self.getBestBallRadius = function () {
	var maxHeight = self.getPanelHeights().mainPanel
	 		   - parseInt($(self.pageName).find('#ballRack').css('bottom').replace('px', ''))   // margin from toolbar
	 		   - 20                                                                        	    // additional margins
	 		   - 40,                                                                            // margin from detail/switch buttons
	    maxWidth  = $(window).width() * 0.95;
        
        var bestRadius = Math.min(
	 			  maxWidth  / 10,                             // fit width
	 			  maxHeight / (2 * (1 + 2*Math.sqrt(3)))      // fit height
	 			 );
	
	return Math.floor(bestRadius);
    }
    
    // This function determines which set of sprites to use for the ball rack
    self.getBallImageSize = function (bestRadius) {
	// available sprite sets
	var availableSizes = new Array(30, 60, 120);
	
        var nearestSize    = availableSizes[availableSizes.length-1];
        for (var i = availableSizes.length-1; i >= 0; i--) {
	    if (2*bestRadius <= availableSizes[i]) {
	        nearestSize = availableSizes[i];
	    }
        }
	
	return nearestSize;
    }
    
    self.closeDetailsPanel = function () {
	document.removeEventListener('backbutton', self.closeDetailsPanel, false);
                
        // if button is still active, ignore
        if($('#btnDetailsBack').hasClass('panelButtonDown')) {
            return false;
        }
	
        $('#btnDetailsBack').addClass('panelButtonDown');
        setTimeout(function() {
            $('#btnDetailsBack').removeClass('panelButtonDown');
        }, 250);
        
        $('#panelLoading').show();
        $(self.pageName).find('[data-role="header"]').show();
        $('#panelRackAndMenu').show(function () {
	    // this fixes a bug that caused the panel to be moved to the right because of
	    // the (not visible) scrollbars
            $('#panelRackAndMenu').css('left', '0');
	    
            $('#panelDetails')    .hide();
            $('#btnDetailsBack')  .off('click');
            $('#panelLoading')    .hide();
        });
    }
    
    self.handleAcceptButton = function (event) {
	event.preventDefault();
        
        // hide initial player switch
        $('#playerSwitch').hide();
        
        // if button is still active from last click, abort
        if (btnAcceptPressed) {
            return false;
        }
	
        // block button and rack
        btnAcceptPressed = true;
        $('#usrAccept').addClass('navbarButtonDown');
        self.ballRack.unsetHandler();
        
        // reset button and rack in given time
        setTimeout(function() {
            btnAcceptPressed = false;
            $('#usrAccept').removeClass('navbarButtonDown');
            self.ballRack.setHandler();
        }, 500);
        
        // rerack needed
        rerack = $('#foulDisplayName').data('rerack');
        
        // process the input
        var ret = self.processInput(self.ballRack.ballsOnTable,
                                    self.ballRack.selectedBall,
                                    parseInt( $('#foulDisplay').html() ),
                                    Boolean( 1 - yesno.indexOf( $('#safetyDisplay').html() ) ),
                                    rerack);
        
        // handle rerack
        if (rerack || ret.rerack) {
            ret.firstShot    = true;
            ret.ballsOnTable = 15;
            ret.selectedBall = 15;
            
            $('#playerSwitch').show();
        }
        
        // after a shot has been accepted, the foul and safety displays reset
        self.setFoulDisplay(0);
        $('#foulDisplayName').data('rerack', false);
        $('#safetyDisplay')  .html(yesno[1]);
        
        /*
         *  This displays the change of points (if neccessary), e.g. "+3" or "-1".
         */
        var tmpDisplay;  // ToDo
        tmpDisplay = (self.innings[ret.current].ptsToAdd[ret.currPlayer] == -1) ?
                self.innings[ret.current].points[ret.currPlayer]
            :
                tmpDisplay = self.innings[ret.current].ptsToAdd[ret.currPlayer] - self.innings[ret.current].foulPts[ret.currPlayer];

        tmpDisplay = (tmpDisplay >= 0) ? "+"+tmpDisplay : tmpDisplay;
        $('#ptsPlayer' + ret.currPlayer).html(tmpDisplay);
	
        setTimeout(function() {
            $('#ptsPlayer0').html(self.players[0].points);
            $('#ptsPlayer1').html(self.players[1].points);
            
	    $('#activePlayer').removeClass('activePlayer' + (1-self.currPlayer))
			      .addClass   ('activePlayer' + (  self.currPlayer)); // ToDo
        }, 500);
        
        /*
         * Display consecutive fouls
         */
        for (var player = 0; player <= 1; player++) { // ToDo
            for (var foul = 1; foul <= 2; foul++) {
                if (foul <= self.players[player].fouls) {
                    $('#player' + player + 'foul' + foul).css('visibility', 'visible');
		    continue;
                }
		$('#player' + player + 'foul' + foul).css('visibility', 'hidden');
            }
        }
        
        // ToDo
        if (self.players[0].points >= 100 || self.players[1].points >= 100) {
            alert('Game over!');
        }
        
        // communicate the new settings to the rack
        self.firstShot             = ret.firstShot;
        self.ballRack.ballsOnTable = ret.ballsOnTable;
        self.ballRack.selectedBall = ret.ballsOnTable;
        
        self.ballRack.redraw();
    }
    
    self.handleFoulButtonTap = function (event) {
	event.preventDefault();
        
        // if button is still active, ignore
        if( $('#usrFoulDisplay').hasClass('navbarButtonDown') ) {
            return false;
        }
	
        $('#usrFoulDisplay').addClass('navbarButtonDown');
        setTimeout(function() {
            $('#usrFoulDisplay').removeClass('navbarButtonDown');
        }, 250);

        self.setFoulDisplay(1 + parseInt( $('#foulDisplay').html() ), self.firstShot);
    }
    
    self.handleFoulButtonHold = function (event) {
	event.preventDefault();

        self.setFoulDisplay(2, self.firstShot, true);
        $('#popupSevereFoul').popup('open');
    }
    
    self.handleSafetyButton = function (event) {
	event.preventDefault();
        
        // if button is still active, ignore
        if( $('#usrSafeDisplay').hasClass('navbarButtonDown') ) {
            return false;
        }
	
        $('#usrSafeDisplay').addClass('navbarButtonDown');
        setTimeout(function() {
            $('#usrSafeDisplay').removeClass('navbarButtonDown');
        }, 250);
        
        $('#safetyDisplay').html( yesno[ 1 - yesno.indexOf( $('#safetyDisplay').html() ) ] );
    }
    
    self.handleMinimizeMainPanelButton = function (event) {
	event.preventDefault();
	
	$('#panelLoading')			     .show();
        $(self.pageName).find('[data-role="header"]').hide();
        $('#panelDetails')                           .show(function () {
            document.addEventListener('backbutton', self.closeDetailsPanel, false);
            
            $('#panelRackAndMenu').hide();
            
            var details  ='';
            details += '<table id="detailScoreTable" cellpadding="0" cellspacing="0">';
            
            details += '<thead>';
                details += '<tr>';
                    details += '<td colspan="7" style="border-bottom-width: 0; height: 30px; line-height: 30px;">Scoreboard</td>';
                details += '</tr>';
                
                details += '<tr>';
                    details += '<td colspan="3" id="player0gd" style="border-bottom-width: 0; height: 30px; line-height: 30px;"></td>';
                    details += '<td style="border-bottom-width: 0;"></td>';
                    details += '<td colspan="3" id="player1gd" style="border-bottom-width: 0; height: 30px; line-height: 30px;"></td>';
                details += '</tr>';
            
                details += '<tr>';
                    details += '<td>Pts</td>';
                    details += '<td>F</td>';
                    details += '<td>Total</td>';
                    details += '<td>#</td>';
                    details += '<td>Pts</td>';
                    details += '<td>F</td>';
                    details += '<td>Total</td>';
                details += '</tr>';
            details += '</thead>';
            
            var totalPts     = new Array(0, 0),
                totalInnings = new Array(0, 0);
            for (var i = 0; i < self.innings.length; i++) {
                totalPts[0] += self.innings[i].points[0];
                totalPts[1] += self.innings[i].points[1];
                
                totalInnings[0] += (self.innings[i].ptsToAdd[0] == -1) ? 1 : 0;
                totalInnings[1] += (self.innings[i].ptsToAdd[1] == -1) ? 1 : 0;
                
                var safety = new Array(
                                       (self.innings[i].safety[0]) ? 'safety ' : '',
                                       (self.innings[i].safety[1]) ? 'safety ' : ''
                                       );
                var foul = new Array(
                                     (self.innings[i].foulPts[0] != 0) ? 'foul ' : 'nofoul ',
                                     (self.innings[i].foulPts[1] != 0) ? 'foul ' : 'nofoul '
                                     );
                
                details += '<tr>';
                
                    // Player 1
                    details += '<td class="' + safety[0] + '">'
                            + ((self.innings[i].ptsToAdd[0] == -1) ? (self.innings[i].points[0]+self.innings[i].foulPts[0]) : '&ndash;')
                            + '</td>';
                            
                    details += '<td class="' + safety[0] + foul[0] + '">'
                            + ((self.innings[i].foulPts[0]) ? self.innings[i].foulPts[0] : '')
                            + '</td>';
                            
                    details += '<td class="' + safety[0] + 'totals">'
                            + ((self.innings[i].ptsToAdd[0] == -1) ? totalPts[0] : '&ndash;')
                            + '</td>';
                            
                    // Inning
                    details += '<td class="">'
                            + self.innings[i].number
                            + '</td>';
                            
                    // Player 2
                    details += '<td class="' + safety[1] + '">'
                            + ((self.innings[i].ptsToAdd[1] == -1) ? (self.innings[i].points[1]+self.innings[i].foulPts[1]) : '&ndash;')
                            + '</td>';
                    
                    details += '<td class="' + safety[1] + foul[1] + '">'
                            + ((self.innings[i].foulPts[1]) ? self.innings[i].foulPts[1] : '')
                            + '</td>';
                            
                    details += '<td class="' + safety[1] + 'totals">'
                            + ((self.innings[i].ptsToAdd[1] == -1) ? totalPts[1] : '&ndash;')
                            + '</td>';
                            
                details += '</tr>'
            }
            
            details += '</table>';
            $('#detailsScoreBoard').html(details);
            
            var GDs = new Array(
                                Math.round(100 * totalPts[0] / totalInnings[0]) / 100,
                                Math.round(100 * totalPts[1] / totalInnings[1]) / 100
                                );
            $('#player0gd').html('&#216;&thinsp;' + ((!isNaN(GDs[0])) ? GDs[0].toFixed(2) : '0.00'));
            $('#player1gd').html('&#216;&thinsp;' + ((!isNaN(GDs[1])) ? GDs[1].toFixed(2) : '0.00'));
            
            $('#btnDetailsBack').off('click').on('click', self.closeDetailsPanel);
            $('#panelLoading')  .hide();
        });
    }
    
    self.handlePlayerSwitchButton = function (event) {
	// if there is unprocessed business, let's take care of it
        if (self.innings[self.innings.length-1].ptsToAdd[self.currPlayer] != -1) {
            self.processInput(15, 15, 0, false, false);
            
            $('#ptsPlayer0').html(self.players[0].points);
            $('#ptsPlayer1').html(self.players[1].points);
        }
        else {
            self.switchPlayer();
        }
        
        $('#activePlayer').removeClass('activePlayer' + (1-self.currPlayer)) // ToDo
			  .addClass   ('activePlayer' +    self.currPlayer);
    }
    
    self.handleSevereFoulPlusMinusButton = function (event, plus) {
	event.preventDefault();
	
	var diff    = (plus) ? 1 : -1,
	    currVal = parseInt( $('#popupSevereFoulPoints').val() ),
	    newVal  = currVal + diff;
        
	if (newVal < 0) {
	    newVal = 0;
	}
	
	$('#popupSevereFoulPoints').val(newVal);
    }
    
    self.handleSevereFoulSubmitButton = function (event) {
	event.preventDefault();
	
	var fouls  = Math.abs( parseInt( $('#popupSevereFoulPoints').val() ) ),
	    rerack = $('#popupSevereFoulRerack')[0].checked;
	
	self.setFoulDisplay(fouls, false, true);
	
	// important to call this AFTER setting the foul display to overwrite rerack setting
	$('#foulDisplayName').data('rerack', rerack);
	
	$('#popupSevereFoul').popup('close');
	
	$('#popupSevereFoulPoints').val('2');
	$('#popupSevereFoulRerack').prop('checked', false)
				   .checkboxradio("refresh");
    }
    
    self.initUI = function () {
	// enable loading screen
	$('#panelLoading').show();
	
	// set panel sizes
	var panelHeights = self.getPanelHeights();
	$('#panelRackAndMenu').css('height', panelHeights.mainPanel   );
	$('#panelDetails')    .css('height', panelHeights.detailsPanel);
	
	// we don't need to see this panel right now, so hide it
	$('#panelDetails').hide();
	
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
	    $('#ball' + i).css('background-image', 'url(img/rack/rack' + nearestSize + '.png)')
			  .css('background-size', (2*bestRadius) + 'px')
			  .css('background-position', '0 -' + (2*i*bestRadius) + 'px');
	}
	
	// now we make the buttons work
	$('#usrAccept').off('click').on('click', function (event) {
	    self.handleAcceptButton(event);    
	});
	
	$('#usrFoulDisplay').off('click').on('click', function (event) {
	    self.handleFoulButtonTap(event);
	});
	
	$('#usrFoulDisplay').off('taphold').on('taphold', function (event) {
	    self.handleFoulButtonHold(event);
	});
	
	$('#usrSafeDisplay').off('click').on('click', function (event) {
	    self.handleSafetyButton(event);
	});
	
	$('.minimizePanel').off('click').on('click', function (event) {
	    self.handleMinimizeMainPanelButton(event);
	});
	
	$('#playerSwitch').off('click').on('click', function (event) {
	    self.handlePlayerSwitchButton(event); 
	});
	
	$('#severeFoulMinusButton').off('click').on('click', function (event) {
	    self.handleSevereFoulPlusMinusButton(event, false);
	});
	
	$('#severeFoulPlusButton').off('click').on('click', function (event) {
	    self.handleSevereFoulPlusMinusButton(event, true);
	});
	
	$('#severeFoulSubmitButton').off('click').on('click', function (event) {
	    self.handleSevereFoulSubmitButton(event);
	});
	
	// disable loading panel
	$('#panelLoading').hide();
    }
}