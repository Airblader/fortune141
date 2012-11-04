$(document).on('pageshow', '#pageView141Games', function () {
    var listDummy  = '<ul data-role="listview" id="view141GamesList">[entries]</ul>',
        entryDummy = '<li><a href="view141Games_details.html?gID=[gID]"><p><strong>[name1] vs. [name2]</strong></p>'
                   + '<p>Score: [points1] &ndash; [points2]</p><p>[mode]</p><p class="ui-li-aside">[month]/[day]/[year]</p></a></li>';
    
    var tableGame  = app.dbFortune.tables.Game141.name,
        tableModes = app.dbFortune.tables.GameModes.name;
    
    app.dbFortune.query(
        'SELECT '
            + tableGame + '.gID AS gID, '
            + tableGame + '.Player1Name AS Player1Name, '
            + tableGame + '.Player2Name AS Player2Name, '
            + tableGame + '.PointsPlayer1 AS PointsPlayer1, '
            + tableGame + '.PointsPlayer2 AS PointsPlayer2, '
            + tableGame + '.Timestamp AS Timestamp, '
            + tableModes + '.Name AS ModeName '
            + 'FROM ' + tableGame + ', ' + tableModes + ' WHERE '
            + tableGame + '.isFinished="1" AND '
            + tableGame + '.Mode=' + tableModes + '.ID '
            + 'ORDER BY ' + tableGame + '.Timestamp DESC',
        [],
        function (tx, results) {
            var entries = new Array(results.rows.length);
            for (var i = 0; i < results.rows.length; i++) {
                var row  = results.rows.item(i),
                    date = app.convertTimestamp(row['Timestamp']);
                    
                entries[i] = entryDummy.replace('[gID]',     row['gID'])
                                       .replace('[name1]',   row['Player1Name'])
                                       .replace('[name2]',   row['Player2Name'])
                                       .replace('[points1]', row['PointsPlayer1'])
                                       .replace('[points2]', row['PointsPlayer2'])
                                       .replace('[month]',   date.month)
                                       .replace('[day]',     date.day)
                                       .replace('[year]',    date.year)
                                       .replace('[mode]',    row['ModeName']);
            }
            
            $('#view141GamesListContainer').html(
                listDummy.replace('[entries]', entries.join(''))
            );
            $('#view141GamesList').listview();
        },
        app.dummyFalse
    );
});

$(document).on('pageshow', '#pageView141GamesDetails', function () {
    var url         = $.url( $.url().attr('fragment') ),
        gID         = parseInt(url.param('gID')),
        fromGame    = parseInt(url.param('from_game')),
        windowWidth = $('#view141GamesDetailsCanvasContainer').width();
        
    var $name1 = $('#view141GamesDetailsName1'),
        $name2 = $('#view141GamesDetailsName2');
    
    $('#view141GamesHandicapTitle').hide();
    $('#view141GamesHandicapTable').hide();
    $('#view141GamesMultiplicatorTitle').hide();
    $('#view141GamesMultiplicatorTable').hide();
    
    $('#view141GamesDetailsScoreTableContainer').hide();
    if (fromGame == 1) {
        $('#view141GamesDetailsViewTable').trigger('click');
    }
    
    $('#view141GamesDetailsCanvasContainer').hide();
    var canvasSupport = app.checkForCanvasSupport();
    
    var tmpGame = new StraightPool();
    tmpGame.loadGame(gID, function () {
        $name1.html(tmpGame.players[0].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    $.mobile.changePage('../player/player_details.html?pID' + tmpGame.players[0].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
        
        $name2.html(tmpGame.players[1].obj.name)
              .off('click')
              .on ('click',
                function (event) {
                    $.mobile.changePage('../player/player_details.html?pID=' + tmpGame.players[1].obj.pID);
                }
              )
              .removeClass('winner').removeClass('loser');
        
        $('#view141GamesDetailsScore1').html(tmpGame.players[0].points);
        $('#view141GamesDetailsScore2').html(tmpGame.players[1].points);
        
        var date = app.convertTimestamp(tmpGame.timestamp);
        $('#view141GamesDetailsDate').html(date.month + '/' + date.day + '/' + date.year);
                
        var idxWinner = 0;
        if (tmpGame.winner == tmpGame.players[0].obj.pID) {
            idxWinner = 0;
            
            $name1.addClass('winner');
            $name2.addClass('loser');
        }
        else if (tmpGame.winner == tmpGame.players[1].obj.pID) {
            idxWinner = 1;
            
            $name1.addClass('loser');
            $name2.addClass('winner');
        }
        else { // tie game
            $name1.addClass('winner');
            $name2.addClass('winner');
        }
        
        if (tmpGame.handicap[0] != 0 || tmpGame.handicap[1] != 0) {
            $('#view141GamesHandicapTitle').show();
            $('#view141GamesHandicapTable').show();
            
            $('#view141GamesHandicap1').html(tmpGame.handicap[0]);
            $('#view141GamesHandicap2').html(tmpGame.handicap[1]);
        }
        if (tmpGame.multiplicator[0] != 1 || tmpGame.multiplicator[1] != 1) {
            $('#view141GamesMultiplicatorTitle').show();
            $('#view141GamesMultiplicatorTable').show();
            
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
                border: '1px solid black'
            }).appendTo('#view141GamesDetailsCanvasContainer');
            
            // for scaling, look for potentially negative scores
            var tmpPts = new Array(0, 0);
            var minPoints = 0;
            for (var i = 0; i < tmpGame.innings.length; i++) {
                tmpPts[0] += tmpGame.innings[i].points[0];
                tmpPts[0] += tmpGame.innings[i].points[1];
                
                minPoints = Math.min(minPoints, tmpPts[0], tmpPts[1]);
            }
            
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
            
            $('#view141GamesDetailsCanvasContainer').show();
        }
        
        // Draw Canvas and Scoreboard
        var totalPts     = new Array(tmpGame.handicap[0], tmpGame.handicap[1]),
            totalInnings = new Array(0, 0);
        for (var i = 0; i < tmpGame.innings.length; i++) {
            totalPts[0] += tmpGame.innings[i].points[0];
            totalPts[1] += tmpGame.innings[i].points[1];
            
            totalInnings[0] += (tmpGame.innings[i].ptsToAdd[0] == -1) ? 1 : 0;
            totalInnings[1] += (tmpGame.innings[i].ptsToAdd[1] == -1) ? 1 : 0;
            
            var safety = new Array(
                                   (tmpGame.innings[i].safety[0]) ? 'safety ' : '',
                                   (tmpGame.innings[i].safety[1]) ? 'safety ' : ''
                                   );
            var foul = new Array(
                                 (tmpGame.innings[i].foulPts[0] != 0) ? 'foul ' : 'nofoul ',
                                 (tmpGame.innings[i].foulPts[1] != 0) ? 'foul ' : 'nofoul '
                                 );
            
            var row = '<tr>';
                
            // Player 1
            row += '<td class="' + safety[0] + '">'
                + ((tmpGame.innings[i].ptsToAdd[0] == -1) ? (tmpGame.innings[i].points[0]+tmpGame.innings[i].foulPts[0]) : '&ndash;')
                + '</td>';
                    
            row += '<td class="' + safety[0] + foul[0] + '">'
                + ((tmpGame.innings[i].foulPts[0]) ? tmpGame.innings[i].foulPts[0] : '')
                + '</td>';
                    
            row += '<td class="' + safety[0] + 'totals">'
                + ((tmpGame.innings[i].ptsToAdd[0] == -1) ? totalPts[0] : '&ndash;')
                + '</td>';
                    
            // Inning
            row += '<td class="">'
                + tmpGame.innings[i].number
                + '</td>';
                    
            // Player 2
            row += '<td class="' + safety[1] + '">'
                + ((tmpGame.innings[i].ptsToAdd[1] == -1) ? (tmpGame.innings[i].points[1]+tmpGame.innings[i].foulPts[1]) : '&ndash;')
                + '</td>';
            
            row += '<td class="' + safety[1] + foul[1] + '">'
                + ((tmpGame.innings[i].foulPts[1]) ? tmpGame.innings[i].foulPts[1] : '')
                + '</td>';
                    
            row += '<td class="' + safety[1] + 'totals">'
                + ((tmpGame.innings[i].ptsToAdd[1] == -1) ? totalPts[1] : '&ndash;')
                + '</td>';
                    
            row += '</tr>'
            
            $('#view141GamesDetailsScoreTable').append(row)
                                               .trigger('refresh');
        }
        
        var GDs = new Array(
            Math.round(100 * (totalPts[0] - tmpGame.handicap[0]) / (totalInnings[0] * tmpGame.multiplicator[0])) / 100,
            Math.round(100 * (totalPts[1] - tmpGame.handicap[1]) / (totalInnings[1] * tmpGame.multiplicator[1])) / 100
        );
        $('#player0gd').html('&#216;&thinsp;' + ((!isNaN(GDs[0])) ? GDs[0].toFixed(2) : '0.00'));
        $('#player1gd').html('&#216;&thinsp;' + ((!isNaN(GDs[1])) ? GDs[1].toFixed(2) : '0.00'));
    });
});

$(document).off('click', '#view141GamesDetailsViewTable')
           .on ('click', '#view141GamesDetailsViewTable', function (event) {
    event.preventDefault();
    
    $('[data-role=content]').hide();
    $('[data-role=header]') .hide();
    $('#view141GamesDetailsScoreTableContainer').show();
});
           
$(document).off('click', '#view141GamesDetailsScoreTableContainer')
           .on ('click', '#view141GamesDetailsScoreTableContainer', function (event) {
    event.preventDefault();
    
    var url      = $.url( $.url().attr('fragment') ),
        fromGame = parseInt(url.param('from_game'));
    
    $('[data-role=content]').show();
    $('[data-role=header]') .show();
    $('#view141GamesDetailsScoreTableContainer').hide();
    
    if (fromGame == 1) {
        $.mobile.changePage('../../index.html');
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
                       $.mobile.changePage('view141Games_list.html');
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