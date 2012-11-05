$(document).on('pageshow', '#pageResumeGame', function () {
    var $list = $('#resumeGameListContainer');
    
    var listDummy  = '<ul data-role="listview" id="resumeGameList" data-dividertheme="a">[entries]</ul>',
	entryDummy = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'141\').data(\'gID\', [gID]).popup(\'open\');">'
	           + '<p><strong>[name1] vs. [name2]</strong></p>'
		   + '<p>Score: [ptsPlayer1] &ndash; [ptsPlayer2]</p>'
		   + '<p>Game to [scoreGoal]</p>'
		   + '<p class="ui-li-aside">[month]/[day]/[year]</p>'
		   + '</a></li>';

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