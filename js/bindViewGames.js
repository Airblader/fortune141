$(document).on('pageshow', '#pageView141Games', function () {
    $('#view141GamesList').html('');
    var entryDummy = '<li><a href="[href]"><p><strong>[name1] vs. [name2]</strong></p><p>Score: [points1] &ndash; [points2]</p><p class="ui-li-aside">[month]/[day]/[year]</p></a></li>';
    
    app.dbFortune.query(
        'SELECT * FROM ' + app.dbFortune.tables.Game141.name + ' WHERE isFinished="1" ORDER BY Timestamp DESC',
        [],
        function (tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
                var row   = results.rows.item(i),
                    entry = entryDummy;
                
                var date = app.convertTimestamp(row['Timestamp']);
                    
                entry = entry.replace('[href]',    'view141Games_details.html?gID=' + row['gID'])
                             .replace('[name1]',   row['Player1Name'])
                             .replace('[name2]',   row['Player2Name'])
                             .replace('[points1]', row['PointsPlayer1'])
                             .replace('[points2]', row['PointsPlayer2'])
                             .replace('[month]',   date.month)
                             .replace('[day]',     date.day)
                             .replace('[year]',    date.year);
                    
                $('#view141GamesList').append(entry);
            }
            $('#view141GamesList').listview('refresh');
        },
        app.dummyFalse
    );
});

$(document).on('pageshow', '#pageView141GamesDetails', function () {
    var url      = $.url( $.url().attr('fragment') ),
        gID      = parseInt(url.param('gID')),
        fromGame = parseInt(url.param('from_game'));
    
    $('#view141GamesDetailsScoreTableContainer').hide();
    if (fromGame == 1) {
        $('#view141GamesDetailsViewTable').trigger('click');
    }
    
    var canvasSupport = app.checkForCanvasSupport();
    if (canvasSupport) {
        $('#view141GamesDetailsCanvasContainer').show();    
    }
    else {
        $('#view141GamesDetailsCanvasContainer').hide();
    }
    
    var tmpGame = new StraightPool();
    tmpGame.loadGame(gID, function () {
        $('#view141GamesDetailsName1').html(tmpGame.players[0].obj.name);
        $('#view141GamesDetailsName2').html(tmpGame.players[1].obj.name);
        
        $('#view141GamesDetailsScore1').html(tmpGame.players[0].points);
        $('#view141GamesDetailsScore2').html(tmpGame.players[1].points);
        
        var date = app.convertTimestamp(tmpGame.timestamp);
        $('#view141GamesDetailsDate').html(date.month + '/' + date.day + '/' + date.year);
        
        $('#view141GamesDetailsName1').removeClass('winner').removeClass('loser');
        $('#view141GamesDetailsName2').removeClass('winner').removeClass('loser');
        
        var idxWinner = 0;
        if (tmpGame.winner == tmpGame.players[0].obj.pID) {
            idxWinner = 0;
            
            $('#view141GamesDetailsName1').addClass('winner');
            $('#view141GamesDetailsName2').addClass('loser');
        }
        else if (tmpGame.winner == tmpGame.players[1].obj.pID) {
            idxWinner = 1;
            
            $('#view141GamesDetailsName1').addClass('loser');
            $('#view141GamesDetailsName2').addClass('winner');
        }
        else { // tie game
            $('#view141GamesDetailsName1').addClass('winner');
            $('#view141GamesDetailsName2').addClass('winner');
        }
        
        // Draw graph
        if (canvasSupport) {
            var pixelRatio  = 1,
                windowWidth = $('#view141GamesDetailsCanvasContainer').width();
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
            
            var canvas  = document.getElementById('view141GamesDetailsCanvas'),
                context = canvas.getContext('2d');
                
            function convertToCanvasPoint (inning, points) {
                return {
                    x : Math.round(canvas.width * inning / tmpGame.innings.length) + 0.5,
                    y : canvas.height - Math.round(canvas.height * points / tmpGame.scoreGoal) + 0.5,
                };
            }
            
            // background gradient
            var bgGradient = context.createLinearGradient(0, 0, 0, canvas.height);
            bgGradient.addColorStop(0, '#dddddd');
            bgGradient.addColorStop(1, '#ffffff');
            context.fillStyle = bgGradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // background vertical lines
            context.save();
            context.fillStyle = '#efefef';
            context.lineWidth = 1;
            context.globalAlpha = 0.1;
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
                
                var pts = tmpGame.handicap[j];
                
                context.moveTo(pts, canvas.height - 0.5);
                for (var i = 0; i <= tmpGame.innings.length; i++) {
                    var point = convertToCanvasPoint(i, pts);
                    
                    context.lineTo(point.x, point.y);
                    
                    pts += (i < tmpGame.innings.length) ? tmpGame.innings[i].points[j] : 0;
                }
                context.stroke();
            }
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