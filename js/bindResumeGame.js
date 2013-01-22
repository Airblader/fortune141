$(document).on('pagebeforeshow', '#pageResumeGame', function () {
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
    var entryDummyB = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'8910\').data(\'gID\', [gID]).popup(\'open\');">'
		    + '<img src="../../img/gameicons/game8910.png" />'
		    + '<p><strong>[name1] vs. [name2]</strong></p>'
		    + '<p>Score:[setsPlayer1] [racksPlayer1] &ndash; [racksPlayer2][setsPlayer2]</p>'
		    + '<p>Race to [racksPerSet][numberOfSets]</p>'
		    + '<p class="ui-li-aside">' + app.settings.getDateFormat(); + '</p>'
                    + '</a></li>';
		    
    var entryDummyBSetsDummyA = ' ([num])',
	entryDummyBSetsDummyB = ' ([num] sets)';
    
    function doIt () {
	if (!readyA || !readyB) {
	    return;
	}
	
	var res = resA.concat(resB);
	
	var max_entries = 20;
	if (res.length > max_entries) {
	    app.alertDlg(
		'You have more than ' + max_entries + ' unfinished games. Please consider '
		+ 'emptying this area.',
		app.dummyFalse,
		'Warning',
		'OK'
	    );
	}
	
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
    }
    
    app.dbFortune.query(
	'SELECT gID, Timestamp AS StartTimestamp, \'141\' AS GameType, Player1Name, Player2Name, PointsPlayer1, PointsPlayer2, ScoreGoal FROM '
	    + app.dbFortune.tables.Game141.name
	    + ' WHERE isFinished=0',
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
	'SELECT gID, StartTimestamp, GameType, Player1Name, Player2Name, TempScore, RacksPerSet, NumberOfSets FROM '
	    + app.dbFortune.tables.Game8910.name
	    + ' WHERE isFinished=0',
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
	    var query = new dbFortuneQuery();
	    
	    query.add('DELETE FROM ' + app.dbFortune.tables.Game141.name + ' WHERE isFinished=0');
	    query.add('DELETE FROM ' + app.dbFortune.tables.Game8910.name + ' WHERE isFinished=0');
	    
	    query.execute(
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
    
    var gType = $('#resumeGamePopup').data('gType');

    var href = '../../index.html';    
    switch (gType) {
	case '141':
	    var href = '../game141/game141.html';
	    break;
	case '8910':
	    var href = '../game8910/game8910.html';
	    break;
    }
    
    $.mobile.changePage(href, {
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
	gType  = $popup.data('gType'),
	gID    = parseInt( $popup.data('gID') );
    $popup.popup('close');
    
    switch (gType) {
	case '141':
	    var table = app.dbFortune.tables.Game141.name;
	    break;
	case '8910':
	    var table = app.dbFortune.tables.Game8910.name;
	    break;
    }
    
    app.confirmDlg(
	'Are you sure that you want to delete this game?',
	function () {
	    app.dbFortune.query(
		'DELETE FROM ' + table + ' WHERE gID="' + gID + '"',
		[],
		function () {
		    $('#pageResumeGame').trigger('pagebeforeshow');
		},
		app.dummyFalse
	    );
	},
	app.dummyFalse,
	'Delete Game',
	'Delete, Cancel'
    );
});