/*$(document).on('pageshow', '#pageResumeGame', function () {
    var $list = $('#resumeGameListContainer');
    
    var listDummy  = '<ul data-role="listview" id="resumeGameList" data-dividertheme="a">[entries]</ul>',
	entryDummy = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'141\').data(\'gID\', [gID]).popup(\'open\');">'
	           + '<p><strong>[name1] vs. [name2]</strong></p>'
		   + '<p>Score: [ptsPlayer1] &ndash; [ptsPlayer2]</p>'
		   + '<p>Game to [scoreGoal]</p>'
		   + '<p class="ui-li-aside">'
		   + app.settings.getDateFormat();
		   + '</p></a></li>';

    app.dbFortune.query(
	'SELECT gID, Timestamp, Player1Name, Player2Name, PointsPlayer1, PointsPlayer2, ScoreGoal FROM '
	    + app.dbFortune.tables.Game141.name
	    + ' WHERE isFinished="0" ORDER BY Timestamp DESC',
	[],
	function (tx, results) {
	    var entries = new Array(results.rows.length);
	    for (var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);
		
		var gID  = parseInt(row['gID']),
		    date = app.convertTimestamp(row['Timestamp']);
		    
		entries[i] = entryDummy.replace('[gID]',        gID)
		                       .replace('[name1]',      row['Player1Name'])
				       .replace('[name2]',      row['Player2Name'])
				       .replace('[ptsPlayer1]', row['PointsPlayer1'])
				       .replace('[ptsPlayer2]', row['PointsPlayer2'])
				       .replace('[scoreGoal]',  row['ScoreGoal'])
				       .replace('[month]',      date.month)
				       .replace('[day]',        date.day)
				       .replace('[year]',       date.year);
	    }
	    
	    $list.html(listDummy.replace('[entries]', entries.join('')));
	    $('#resumeGameList').listview();
	}
    );
});*/

$(document).on('pageshow', '#pageResumeGame', function () {
    $.mobile.loading('show');
    var $list = $('#resumeGameListContainer');
    
    var readyA = false,
	readyB = false;
    var resA,
	resB;
    
    var listDummy = '<ul data-role="listview" id="resumeGameList" data-dividertheme="a">[entries]</ul>';
    
    var entryDummyA = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'141\').data(\'gID\', [gID]).popup(\'open\');">'
	            + '<img src="../../img/gameicons/game141.png" />'
		    + '<p><strong>[name1] vs. [name2]</strong></p>'
		    + '<p>Score: [ptsPlayer1] &ndash; [ptsPlayer2]</p>'
		    + '<p>Game to [scoreGoal]</p>'
		    + '<p class="ui-li-aside">'
		    + app.settings.getDateFormat();
		    + '</p></a></li>';
    var entryDummyB = '<li><a href="#">'
		    + '<img src="../../img/gameicons/game8910.png" />'
		    + '<p><strong>[name1] vs. [name2]</strong></p>'
		    + '<p>Score:[setsPlayer1] [racksPlayer1] &ndash; [racksPlayer2][setsPlayer2]</p>'
		    + '<p>Race to [racksPerSet][numberOfSets]</p>'
		    + '<p class="ui-li-aside">' + app.settings.getDateFormat(); + '</p>'
                    + '</a></li>';
		    
    var entryDummyBSetsDummyA = ' ([num])',
	entryDummyBSetsDummyB = ' ([num] sets)';
    
    function doIt() {
	if (!readyA || !readyB) {
	    return;
	}
	
	var res = resA.concat(resB);
	res.sort(function (a,b) {
	    if (a['StartTimestamp'] === b['StartTimestamp']) {
		return 0;
	    }
	    return parseInt(a['StartTimestamp']) <= parseInt(b['StartTimestamp']);
	});
	
	var entries = new Array(res.length);
	
	for (var i = 0; i < res.length; i++) {
	    var currentEntry = res[i];
	    
	    var gID  = parseInt(currentEntry['gID']),
		date = app.convertTimestamp(currentEntry['StartTimestamp']);
	    
	    if (currentEntry['gameType'] === '141') { // 14/1
		entries[i] = entryDummyA.replace('[gID]',        gID)
		                        .replace('[name1]',      currentEntry['Player1Name'])
				        .replace('[name2]',      currentEntry['Player2Name'])
				        .replace('[ptsPlayer1]', currentEntry['PointsPlayer1'])
				        .replace('[ptsPlayer2]', currentEntry['PointsPlayer2'])
				        .replace('[scoreGoal]',  currentEntry['ScoreGoal'])
				        .replace('[month]',      date.month)
				        .replace('[day]',        date.day)
				        .replace('[year]',       date.year);
	    } else { // 8-/9-/10
		var tempScore    = currentEntry['TempScore'].split('/'),
		    numberOfSets = parseInt(currentEntry['NumberOfSets']); 
		
		var setsPlayer1 = '',
		    setsPlayer2 = '',
		    setsTotal   = '';
		if (numberOfSets > 1) {
		    setsPlayer1 = entryDummyBSetsDummyA.replace('[num]', tempScore[1]);
		    setsPlayer2 = entryDummyBSetsDummyA.replace('[num]', tempScore[3]);
		    
		    setsTotal = entryDummyBSetsDummyB.replace('[num]', numberOfSets);
		}
		
		entries[i] = entryDummyB.replace('[gID]',          gID)
		                        .replace('[name1]',        currentEntry['Player1Name'])
					.replace('[name2]',        currentEntry['Player2Name'])
					.replace('[setsPlayer1]',  setsPlayer1)
					.replace('[setsPlayer2]',  setsPlayer2)
					.replace('[racksPlayer1]', tempScore[0])
					.replace('[racksPlayer2]', tempScore[2])
					.replace('[racksPerSet]',  currentEntry['RacksPerSet'])
					.replace('[numberOfSets]', setsTotal)
					.replace('[month]',        date.month)
					.replace('[day]',          date.day)
					.replace('[year]',         date.year);
	    }
	}
	
	$list.html(listDummy.replace('[entries]', entries.join('')));
	$('#resumeGameList').listview();
	
	$.mobile.loading('hide');
    }
    
    app.dbFortune.query(
	'SELECT gID, Timestamp AS StartTimestamp, \'141\' AS gameType, Player1Name, Player2Name, PointsPlayer1, PointsPlayer2, ScoreGoal FROM '
	    + app.dbFortune.tables.Game141.name
	    + ' WHERE isFinished=0 ORDER BY Timestamp DESC',
	[],
	function (tx, results) {
	    resA = new Array(results.rows.length);
	    for (var i=0; i<results.rows.length; i++) {
		resA[i] = results.rows.item(i);
	    }
	    
	    readyA = true;
	    doIt();
	}
    );
    
    app.dbFortune.query(
	'SELECT gID, StartTimestamp, gameType, Player1Name, Player2Name, TempScore, RacksPerSet, NumberOfSets FROM '
	    + app.dbFortune.tables.Game8910.name
	    + ' WHERE isFinished=0 ORDER BY StartTimestamp DESC',
	[],
	function (tx, results) {
	    resB = new Array(results.rows.length);
	    for (var i=0; i<results.rows.length; i++) {
		resB[i] = results.rows.item(i);
	    }
	    
	    readyB = true;
	    doIt();
	}
    );
});

$(document).off('click', '#pageResumeGameEmptyLink')
           .on ('click', '#pageResumeGameEmptyLink', function (event) {
    event.preventDefault();
    
    app.confirmDlg(
	'Are you sure you want to delete all unfinished games?',
	function () {
	    app.dbFortune.query(
		'DELETE FROM ' + app.dbFortune.tables.Game141.name + ' WHERE isFinished="0"',
		[],
		function () {
		    $.mobile.changePage('../../index.html');
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
	'Confirm',
	'Delete,Cancel'
    );
});

$(document).off('click', '#resumeGameResumeButton')
           .on ('click', '#resumeGameResumeButton', function (event) {
    event.preventDefault();
    
    $.mobile.changePage('../game141/game141.html', {
	data : {
	    gID : parseInt( $('#resumeGamePopup').data('gID') ),
	}	
    });
    
    return true;
});
	   
$(document).off('click', '#resumeGameDeleteButton')
	   .on ('click', '#resumeGameDeleteButton', function (event) {
    event.preventDefault();
    
    var $popup = $('#resumeGamePopup'),
	gID    = parseInt( $popup.data('gID') );
    $popup.popup('close');
    
    app.confirmDlg(
	'Are you sure that you want to delete this game?',
	function () {
	    app.dbFortune.query(
		'DELETE FROM ' + app.dbFortune.tables.Game141.name + ' WHERE gID="' + gID + '"',
		[],
		function () {
		    $('#pageResumeGame').trigger('pageshow');
		},
		app.dummyFalse
	    );
	},
	function () {
	    $('#pageResumeGame').trigger('pageshow');
	},
	'Delete Game',
	'Delete, Cancel'
    );
});