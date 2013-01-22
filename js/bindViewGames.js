$(document).on('pagebeforeshow', '#pageViewGames', function () {
    var $list = $('#viewGamesListContainer');
    
    var readyA = false,
        readyB = false;
    var resA,
        resB;

    var listDummy  = '<ul data-role="listview" id="viewGamesList">[entries]</ul>',
        entryDummyA = '<li><a href="view141Games_details.html?gID=[gID]">'
                    + '<img src="../../img/gameicons/game141.png" />'
                    + '<p><strong>[name1] vs. [name2]</strong></p>'
                    + '<p>Score: [points1] &ndash; [points2]</p>'
                    + '<p>[mode]</p>'
                    + '<p class="ui-li-aside">' + app.settings.getDateFormat() + '</p>'
                    + '</a></li>';
        entryDummyB = '<li><a href="view8910Games_details.html?gID=[gID]">'
                    + '<img src="../../img/gameicons/game8910.png" />'
                    + '<p><strong>[name1] vs. [name2]</strong></p>'
                    + '<p>Score: [score1] &ndash; [score2]</p>'
                    + '<p>[mode]</p>'
                    + '<p class="ui-li-aside">' + app.settings.getDateFormat() + '</p>'
                    + '</a></li>';
        
    function doIt () {
        if (!readyA || !readyB) {
            return;
        }
        
        var res = resA.concat(resB);
        
        // TODO Limit entries
        
        res.sort(function (a,b) {
            var timeA = parseInt(a['StartTimestamp']),
		timeB = parseInt(b['StartTimestamp']);
	    if (timeA === timeB) {
		return 0;
	    }
            
	    return (timeA < timeB) ? 1 : -1;
        });
        
        var entries = new Array(res.length);
        
        for (var i = 0; i < res.length; i++) {
            var currentEntry = res[i];
            
            var gID  = parseInt(currentEntry['gID']),
		date = app.convertTimestamp(currentEntry['StartTimestamp']);
	    
	    if (currentEntry['GameType'] === '141') { // 14/1
		entries[i] = entryDummyA.replace('[gID]',        gID)
		                        .replace('[name1]',      currentEntry['Player1Name'])
				        .replace('[name2]',      currentEntry['Player2Name'])
				        .replace('[points1]',    currentEntry['PointsPlayer1'])
				        .replace('[points2]',    currentEntry['PointsPlayer2'])
                                        .replace('[mode]',       currentEntry['ModeName'])
				        .replace('[month]',      date.month)
				        .replace('[day]',        date.day)
				        .replace('[year]',       date.year);
	    } else { // 8-/9-/10
		var tempScore    = currentEntry['TempScore'].split('/'),
		    numberOfSets = parseInt(currentEntry['NumberOfSets']); 
                
                var score1,
                    score2;
                if (numberOfSets > 1) { // display set scores
                    score1 = tempScore[1];
                    score2 = tempScore[3];
                } else { // display rack scores
                    score1 = tempScore[0];
                    score2 = tempScore[2];
                }
		
		entries[i] = entryDummyB.replace('[gID]',          gID)
		                        .replace('[name1]',        currentEntry['Player1Name'])
					.replace('[name2]',        currentEntry['Player2Name'])
					.replace('[score1]',       score1)
					.replace('[score2]',       score2)
                                        .replace('[mode]',         currentEntry['ModeName'])
					.replace('[month]',        date.month)
					.replace('[day]',          date.day)
					.replace('[year]',         date.year);
	    }
        }
        
        $list.html(listDummy.replace('[entries]', entries.join('')));
        $('#viewGamesList').listview();
    }
    
    var tblGameA = app.dbFortune.tables.Game141.name,
        tblGameB = app.dbFortune.tables.Game8910.name,
        tblModes = app.dbFortune.tables.GameModes.name;
    
    app.dbFortune.query(
        'SELECT '
            + tblGameA + '.gID AS gID, '
            + tblGameA + '.Timestamp AS StartTimestamp, '
            + '\'141\' AS GameType, '
            + tblGameA + '.Player1Name AS Player1Name, '
            + tblGameA + '.Player2Name AS Player2Name, '
            + tblGameA + '.PointsPlayer1 AS PointsPlayer1, '
            + tblGameA + '.PointsPlayer2 AS PointsPlayer2, '
            + tblModes + '.Name AS ModeName '
            + 'FROM ' + tblGameA + ', ' + tblModes + ' WHERE '
            + tblGameA + '.isFinished=1 AND '
            + tblGameA + '.Mode=' + tblModes + '.ID ',
        [],
        function (tx, results) {
            resA = new Array(results.rows.length);
            for (var i = 0; i < results.rows.length; i++) {
                resA[i] = results.rows.item(i);
            }
            
            readyA = true;
            doIt();
        }
    );
    
    app.dbFortune.query(
        'SELECT '
            + tblGameB + '.gID AS gID, '
            + tblGameB + '.StartTimestamp AS StartTimestamp, '
            + tblGameB + '.GameType AS GameType, '
            + tblGameB + '.Player1Name AS Player1Name, '
            + tblGameB + '.Player2Name AS Player2Name, '
            + tblGameB + '.TempScore AS TempScore, '
            + tblGameB + '.NumberOfSets AS NumberOfSets, '
            + tblModes + '.Name AS ModeName '
            + 'FROM ' + tblGameB + ', ' + tblModes + ' WHERE '
            + tblGameB + '.isFinished=1 AND '
            + tblGameB + '.Mode=' + tblModes + '.ID ',
        [],
        function (tx, results) {
            resB = new Array(results.rows.length);
            for (var i = 0; i < results.rows.length; i++) {
                resB[i] = results.rows.item(i);
            }
            
            readyB = true;
            doIt();
        }
    );
});

$(document).on('pageshow', '#pageView141GamesDetails', function () {
    var url         = $.url( $.url().attr('fragment') ),
        gID         = parseInt(url.param('gID')),
        fromGame    = parseInt(url.param('from_game')),
        windowWidth = $('#view141GamesDetailsCanvasContainer').width();
        
    var $name1 = $('#view141GamesDetailsName1'),
        $name2 = $('#view141GamesDetailsName2');
    
    $('#view141GamesHandicapTable')     .css('display', 'none');
    $('#view141GamesMultiplicatorTable').css('display', 'none');
    
    $('#view141GamesDetailsScoreTableContainer').css('display', 'none');
    if (fromGame == 1) {
        $('#view141GamesDetailsViewTable').trigger('click');
    }
    
    $('#view141GamesDetailsCanvasContainer').css('display', 'none');
    var canvasSupport = app.checkForCanvasSupport();
    
    var tmpGame = new StraightPool();
    tmpGame.loadGame(gID, function () {
        $name1.html(tmpGame.players[0].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    event.preventDefault();
                    $.mobile.changePage('../player/player_details.html?pID=' + tmpGame.players[0].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
        
        $name2.html(tmpGame.players[1].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    event.preventDefault();
                    $.mobile.changePage('../player/player_details.html?pID=' + tmpGame.players[1].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
        
        $('#view141GamesDetailsScore1').html(tmpGame.players[0].points);
        $('#view141GamesDetailsScore2').html(tmpGame.players[1].points);
        
        var information  = '[scoregoal][maxinnings]',
            scoreDummy   = 'Game to [points]',
            inningsDummy = ' / max. [innings] innings';
        $('#view141GamesDetailsInfo').html(
            information
                .replace(
                    '[scoregoal]',
                    scoreDummy.replace(
                        '[points]',
                        tmpGame.scoreGoal
                    )
                )
                .replace(
                    '[maxinnings]',
                    (tmpGame.maxInnings === 0)
                        ? ''
                        : inningsDummy.replace(
                            '[innings]',
                            tmpGame.maxInnings
                        )
                )
        );
        
        var date       = app.convertTimestamp(tmpGame.timestamp),
            dateFormat = app.settings.getDateFormat();
        $('#view141GamesDetailsDate').html(
            dateFormat.replace('[day]',   date.day)
                      .replace('[month]', date.month)
                      .replace('[year]',  date.year)
        );
                
        var idxWinner = 0;
        if (tmpGame.winner == tmpGame.players[0].obj.pID) {
            idxWinner = 0;
            
            $name1.addClass('winner');
            $name2.addClass('loser');
        } else if (tmpGame.winner == tmpGame.players[1].obj.pID) {
            idxWinner = 1;
            
            $name1.addClass('loser');
            $name2.addClass('winner');
        } else { // tie game
            $name1.addClass('winner');
            $name2.addClass('winner');
        }
        
        if (tmpGame.handicap[0] != 0 || tmpGame.handicap[1] != 0) {
            $('#view141GamesHandicapTable').css('display', 'block');
            
            $('#view141GamesHandicap1').html(tmpGame.handicap[0]);
            $('#view141GamesHandicap2').html(tmpGame.handicap[1]);
        }
        if (tmpGame.multiplicator[0] != 1 || tmpGame.multiplicator[1] != 1) {
            $('#view141GamesMultiplicatorTable').css('display', 'block');
            
            $('#view141GamesMultiplicator1').html(tmpGame.multiplicator[0]);
            $('#view141GamesMultiplicator2').html(tmpGame.multiplicator[1]);
        }
        
        // Draw graph
        if (canvasSupport) {
            var pixelRatio  = 1;
            if (typeof window.devicePixelRatio !== 'undefined') {
                pixelRatio = Math.min(2, Math.max(0, window.devicePixelRatio));
            }
            
            $('#view141GamesDetailsCanvasContainer').html('<h2>Graph</h2>');
            $('<canvas>').attr({
                id:     'view141GamesDetailsCanvas',
                width:  Math.round(0.975 * pixelRatio * windowWidth),
                height: Math.round(pixelRatio * 150),
            }).css({
                width:  Math.round(0.975 * windowWidth) + 'px',
                height: '150px',
                border: '1px solid black',
            }).appendTo('#view141GamesDetailsCanvasContainer');
            
            // for scaling, look for potentially negative scores
            var tmpPts = new Array(tmpGame.handicap[0], tmpGame.handicap[1]);
            var minPoints = 0;
            for (var i = 0; i < tmpGame.innings.length; i++) {
                tmpPts[0] += tmpGame.innings[i].points[0];
                tmpPts[1] += tmpGame.innings[i].points[1];
                
                minPoints = Math.min(minPoints, tmpPts[0], tmpPts[1]);
            }
            minPoints = Math.min(0, minPoints);
            
            var canvas  = document.getElementById('view141GamesDetailsCanvas'),
                context = canvas.getContext('2d');
                
            function convertToCanvasPoint (inning, points) {
                return {
                    x : Math.round(canvas.width * inning / tmpGame.innings.length) + 0.5,
                    y : canvas.height - Math.round(canvas.height * (points - minPoints) / (tmpGame.scoreGoal - minPoints)) + 0.5,
                };
            }
            
            // background gradient
            var bgGradient = context.createLinearGradient(0, 0, 0, canvas.height);
            bgGradient.addColorStop(0, '#ededed');
            bgGradient.addColorStop(1, '#efefef');
            context.fillStyle = bgGradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // zero line
            if (minPoints < 0) {
                var point = convertToCanvasPoint(0, 0);
                context.save();
                context.strokeStyle = 'black';
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(-0.5,               point.y);
                context.lineTo(canvas.width + 0.5, point.y);
                context.stroke();
                context.restore();
            }
            
            // background vertical lines
            context.save();
            context.strokeStyle = '#cccccc';
            context.lineWidth = 1;
            context.globalAlpha = 0.5;
            context.beginPath();
            for (var k = canvas.height - 30; k > 0; k = k - 30) {
                context.moveTo(20 - 0.5, k + 0.5);
                context.lineTo(canvas.width - 20 + 0.5, k + 0.5);
            }
            context.stroke();
            context.restore();
            
            // "Points" / "Innings"
            context.save();
            
            context.fillStyle = 'black';
            context.font = '12px Lucida Console';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            context.fillText('Innings', Math.round(canvas.width/2) + 0.5, canvas.height - 13 + 0.5);

            context.translate(0, Math.round(canvas.height/2) + 0.5);
            context.rotate(-Math.PI / 2);
            context.fillText('Points', 0.5, 7 + 0.5);   
            
            context.restore();
            
            context.lineWidth = 2;
            
            // draw vertical line to show max innings
            if (tmpGame.maxInnings > 0 && tmpGame.maxInnings < tmpGame.innings.length) {
                context.save();
                
                context.strokeStyle = '#ff9900';
                var maxInningsLine = convertToCanvasPoint(tmpGame.maxInnings, 0);
                
                context.moveTo(maxInningsLine.x + 0.5, -0.5);
                context.lineTo(maxInningsLine.x + 0.5, canvas.height + 0.5);
                context.stroke();
                
                context.restore();
            }
                
            // draw lines representing the players' points
            for (var j = 0; j <= 1; j++) {
                context.beginPath();
                context.strokeStyle = (idxWinner == j) ? '#008a00' : '#cc0000';
                
                var ptStart = convertToCanvasPoint(0, tmpGame.handicap[j]),
                    pts     = tmpGame.handicap[j];
                
                context.moveTo(-0.5, ptStart.y);
                for (var i = 0; i <= tmpGame.innings.length; i++) {
                    var point = convertToCanvasPoint(i, pts);
                    
                    context.lineTo(point.x, point.y);
                    
                    pts += (i < tmpGame.innings.length) ? tmpGame.innings[i].points[j] : 0;
                }
                context.stroke();
            }
            
            $('#view141GamesDetailsCanvasContainer').css('display', 'block');
        }
        
        // Draw Scoreboard
        var totalPts     = new Array(tmpGame.handicap[0], tmpGame.handicap[1]),
            totalInnings = new Array(0, 0),
            HS           = new Array(0, 0),
            safety       = new Array(2),
            foul         = new Array(2),
            entryDummy   = '<td class="[safety]">[points]</td>'
                         + '<td class="[safety][foul]">[foulPts]</td>'
                         + '<td class="[safety]totals">[totalPts]</td>',
            inningDummy  = '<td class="">[inning]</td>',
            tbodyDummy   = '<tbody id="view141GamesDetailsScoreTableBody">[entries]</tbody>',
            entries      = new Array(tmpGame.innings.length);
        for (var i = 0; i < tmpGame.innings.length; i++) {
            totalPts[0] += tmpGame.innings[i].points[0];
            totalPts[1] += tmpGame.innings[i].points[1];
            
            totalInnings[0] += (tmpGame.innings[i].ptsToAdd[0] == -1) ? 1 : 0;
            totalInnings[1] += (tmpGame.innings[i].ptsToAdd[1] == -1) ? 1 : 0;
            
            HS[0] = Math.max(HS[0], tmpGame.innings[i].points[0]);
	    HS[1] = Math.max(HS[1], tmpGame.innings[i].points[1]);
            
            safety[0] = (tmpGame.innings[i].safety[0]) ? 'safety ' : '';
            safety[1] = (tmpGame.innings[i].safety[1]) ? 'safety ' : '';

            foul[0] = (tmpGame.innings[i].foulPts[0] != 0) ? 'foul ' : 'nofoul ';
            foul[1] = (tmpGame.innings[i].foulPts[1] != 0) ? 'foul ' : 'nofoul ';
            
            entries[i] = entryDummy.replace (/\[safety\]/g,  safety[0])
                                   .replace ('[points]',   ((tmpGame.innings[i].ptsToAdd[0] == -1) ? (tmpGame.innings[i].points[0]+tmpGame.innings[i].foulPts[0]) : '&ndash;'))
                                   .replace ('[foul]',       foul[0])
                                   .replace ('[foulPts]',  ((tmpGame.innings[i].foulPts[0]) ? tmpGame.innings[i].foulPts[0] : ''))
                                   .replace ('[totalPts]', ((tmpGame.innings[i].ptsToAdd[0] == -1) ? totalPts[0] : '&ndash;'))
                       + inningDummy.replace('[inning]', tmpGame.innings[i].number)
                       + entryDummy.replace (/\[safety\]/g,  safety[1])
                                   .replace ('[points]',   ((tmpGame.innings[i].ptsToAdd[1] == -1) ? (tmpGame.innings[i].points[1]+tmpGame.innings[i].foulPts[1]) : '&ndash;'))
                                   .replace ('[foul]',       foul[1])
                                   .replace ('[foulPts]',  ((tmpGame.innings[i].foulPts[1]) ? tmpGame.innings[i].foulPts[1] : ''))
                                   .replace ('[totalPts]', ((tmpGame.innings[i].ptsToAdd[1] == -1) ? totalPts[1] : '&ndash;'));
        }
        $('#view141GamesDetailsScoreTableBody').remove();
        $('#view141GamesDetailsScoreTable')    .append(
                                                    tbodyDummy.replace('[entries]', '<tr>' + entries.join('</tr><tr>') + '</tr>')
                                               );
        
        var GDs = new Array(
            Math.round(100 * (totalPts[0] - tmpGame.handicap[0]) / (totalInnings[0] * tmpGame.multiplicator[0])) / 100,
            Math.round(100 * (totalPts[1] - tmpGame.handicap[1]) / (totalInnings[1] * tmpGame.multiplicator[1])) / 100
        );
        
        $('#view141GamesDetailsGD1').html(((!isNaN(GDs[0])) ? GDs[0].toFixed(2) : '0.00'));
        $('#view141GamesDetailsGD2').html(((!isNaN(GDs[1])) ? GDs[1].toFixed(2) : '0.00'));
        $('#view141GamesDetailsHS1').html(HS[0]);
        $('#view141GamesDetailsHS2').html(HS[1]);
    });
});

$(document).off('click', '#view141GamesDetailsViewTable')
           .on ('click', '#view141GamesDetailsViewTable', function (event) {
    event.preventDefault();
    
    var url      = $.url( $.url().attr('fragment') ),
        fromGame = parseInt(url.param('from_game'));
    
    if (fromGame == 1) {
        $('#pageView141GamesDetails').data('activePage', 'pageView141GamesDetails_Scoreboard1');
    } else {
        $('#pageView141GamesDetails').data('activePage', 'pageView141GamesDetails_Scoreboard2');
    }
    
    $('#pageView141GamesDetails div[data-role=content]').css('display', 'none');
    $('#pageView141GamesDetails div[data-role=header]') .css('display', 'none');
    $('#view141GamesDetailsScoreTableContainer').css('display', 'block');
});
           
function view141GamesDetailsHideScoreboard () {
    $('#pageView141GamesDetails').data('activePage', 'pageView141GamesDetails_Main');
    
    $('#pageView141GamesDetails div[data-role=content]').css('display', 'block');
    $('#pageView141GamesDetails div[data-role=header]') .css('display', 'block');
    $('#view141GamesDetailsScoreTableContainer')    .css('display', 'none');
}

$(document).off('click', '#view141GamesDetailsScoreTableContainer')
           .on ('click', '#view141GamesDetailsScoreTableContainer', function (event) {
    event.preventDefault();

    var url      = $.url( $.url().attr('fragment') ),
        fromGame = parseInt(url.param('from_game'));
    
    if (fromGame == 1) {
        view141GamesDetailsHideScoreboard();
        $.mobile.changePage('../../index.html');
    } else {
        view141GamesDetailsHideScoreboard();
    }
});
           
$(document).off('click', '#view141GamesDetailsDelete')
           .on ('click', '#view141GamesDetailsDelete', function (event) {
    event.preventDefault();
    
    var url = $.url( $.url().attr('fragment') ),
        gID = parseInt(url.param('gID'));
        
    app.confirmDlg(
          'Are you sure you want to delete this game? This action cannot be undone.',
          function () {
               app.dbFortune.query(
                   'DELETE FROM ' + app.dbFortune.tables.Game141.name + ' WHERE gID="' + gID + '"',
                   [],
                   function () {
                       $.mobile.changePage('viewGames_list.html');
                   },
                   function () {
                       app.alertDlg(
                           'Oops! Something went wrong :( Deleting failed!',
                           app.dummyFalse,
                           'Error',
                           'OK'
                       );
                   }
               );
          },
          app.dummyFalse,
          'Warning',
          'Delete,Cancel'
     );
});
           
           
$(document).on('pageshow', '#pageView8910GamesDetails', function () {
    /*$.mobile.loading('show', {
        text: 'Loading Game Data',
        textVisible: true,
        theme: 'a',
    });*/
    
    var url = $.url( $.url().attr('fragment') ),
        gID = parseInt(url.param('gID'));
    
    var $name1 = $('#view8910GamesDetailsName1'),
        $name2 = $('#view8910GamesDetailsName2');
        
    var tmpGame = new Game8910();
    tmpGame.loadGame(gID, function () {
        $('#view8910GamesDetailsGameType').html(tmpGame.gameType);
        $('#view8910GamesDetailsRacksPerSet').html(tmpGame.racksPerSet);
        
        $('#view8910GamesNumberOfSetsWrapper').toggle(tmpGame.numberOfSets > 1);
        $('#view8910GamesDetailsNumberOfSets').html(tmpGame.numberOfSets);
	
        $name1.html(tmpGame.players[0].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    event.preventDefault();
                    $.mobile.changePage('../player/player_details.html?pID=' + tmpGame.players[0].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
        
        $name2.html(tmpGame.players[1].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    event.preventDefault();
                    $.mobile.changePage('../player/player_details.html?pID=' + tmpGame.players[1].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
              
        if (tmpGame.numberOfSets === 1) {
            $('#view8910GamesDetailsScore1').html(tmpGame.players[0].racks);
            $('#view8910GamesDetailsScore2').html(tmpGame.players[1].racks);
	    
	    $('#view8910GamesDetailsSets').css('display', 'none');
        } else {
            $('#view8910GamesDetailsScore1').html(tmpGame.players[0].sets);
            $('#view8910GamesDetailsScore2').html(tmpGame.players[1].sets);
        
	    $('#view8910GamesDetailsSets').css('display', 'table');
	}
	
	var entryDummy = '<td class="[class1]">[score1]</td>'
		       + '<td>[number]</td>'
		       + '<td class="[class2]">[score2]</td>',
	    tbodyDummy = '<tbody id="view8910GamesDetailsSetsBody">[entries]</tbody>',
	    entries    = new Array(tmpGame.sets.length);
	    
	for (var i = 0; i < tmpGame.sets.length; i++) {
	    var scores = new Array(0, 0);
	    for (var j = 0; j < tmpGame.sets[i].racks.length; j++) {
		scores[tmpGame.sets[i].racks[j].wonByPlayer]++;
	    }
	    
	    entries[i] = entryDummy.replace('[score1]', scores[0])
				   .replace('[score2]', scores[1])
				   .replace('[class1]', (scores[0] === tmpGame.racksPerSet) ? 'winner' : 'loser')
				   .replace('[class2]', (scores[1] === tmpGame.racksPerSet) ? 'winner' : 'loser')
				   .replace('[number]', i+1);
	}
	
	$('#view8910GamesDetailsSetsBody').remove();
	$('#view8910GamesDetailsSets')    .append(
	    tbodyDummy.replace('[entries]', '<tr>' + entries.join('</tr><tr>') + '</tr>')
	);
	
        if (tmpGame.winner == tmpGame.players[0].obj.pID) {
            $name1.addClass('winner');
            $name2.addClass('loser');
        } else if (tmpGame.winner == tmpGame.players[1].obj.pID) {
            $name1.addClass('loser');
            $name2.addClass('winner');
        } else { // tie game
            $name1.addClass('winner');
            $name2.addClass('winner');
        }
        
        var date       = app.convertTimestamp(tmpGame.timestamp),
            dateFormat = app.settings.getDateFormat();
        $('#view8910GamesDetailsDate').html(
            dateFormat.replace('[day]',   date.day)
                      .replace('[month]', date.month)
                      .replace('[year]',  date.year)
        );
    });
});

$(document).off('click', '#view8910GamesDetailsDelete')
           .on ('click', '#view8910GamesDetailsDelete', function (event) {
    event.preventDefault();
    
    var url = $.url( $.url().attr('fragment') ),
        gID = parseInt(url.param('gID'));
        
    app.confirmDlg(
          'Are you sure you want to delete this game? This action cannot be undone.',
          function () {
               app.dbFortune.query(
                   'DELETE FROM ' + app.dbFortune.tables.Game8910.name + ' WHERE gID="' + gID + '"',
                   [],
                   function () {
                       $.mobile.changePage('viewGames_list.html');
                   },
                   function () {
                       app.alertDlg(
                           'Oops! Something went wrong :( Deleting failed!',
                           app.dummyFalse,
                           'Error',
                           'OK'
                       );
                   }
               );
          },
          app.dummyFalse,
          'Warning',
          'Delete,Cancel'
     );
});