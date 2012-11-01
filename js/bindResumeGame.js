$(document).on('pageshow', '#pageResumeGame', function () {
    // empty list
    $('#resumeGameList').html('');
    
    function output141 (rows, idx) {
	var row = rows.item(idx);
	
	var gID   = parseInt(row['gID']);
	var date  = new Date(1000 * parseInt(row['Timestamp'])),
	    year  = date.getFullYear(),
	    month = date.getMonth() + 1,
	    day   = date.getDate();
	    
	app.Players.tmp = new Player();
	
	app.Players.tmp.loadBy141Game(parseInt(row['Player1']), 1, gID, function () {
	    var name1 = app.Players.tmp.getDisplayName();
	    
	    app.Players.tmp.loadBy141Game(parseInt(row['Player2']), 2, gID, function () {
		var name2 = app.Players.tmp.getDisplayName();
		
		var html  = '<li><a href="#" onClick="javascript:$(\'#resumeGamePopup\').data(\'gType\', \'141\').data(\'gID\', ' + gID + ').popup(\'open\');">';
			
		html += '<p><strong>' + name1 + ' vs. ' + name2 + '</strong></p>';
		html += '<p>Score: ' + row['PointsPlayer1'] + ' &ndash; ' + row['PointsPlayer2'] + '</p>';
		html += '<p>Straight Pool to ' + row['ScoreGoal'] + '</p>';
		html += '<p class="ui-li-aside">' + (month+'/'+day+'/'+year) + '</p>';
		    
		html += '</a></li>';
			
		$('#resumeGameList').append(html).listview('refresh');
		if (idx < rows.length-1) {
		    output141(rows, idx+1);
		}
	    });
	});
    }
    
    
    app.dbFortune.query('SELECT '
			+ 'gID, Timestamp, Player1, Player2, PointsPlayer1, PointsPlayer2, ScoreGoal FROM '
			+ app.dbFortune.tables.Game141.name
			+ ' WHERE isFinished="0" ORDER BY Timestamp DESC',
			[],
	function (tx, result) {
	    var rows = result.rows;
	    if (rows.length == 0) {
		return false;
	    }

	    output141(rows, 0);	    
	    return true;
	}
    );
});

$(document).off('click', '#resumeGameResumeButton')
           .on ('click', '#resumeGameResumeButton', function (event) {
    event.preventDefault();
    
    var redirect;
    switch ($('#resumeGamePopup').data('gType')) {
	case '141':
	    redirect = 'game141/game141.html';
	    break;
	default:
	    return false;
    }
    
    $.mobile.changePage(redirect, {
	data : {
	    gID : parseInt( $('#resumeGamePopup').data('gID') ),
	}	
    });
    
    return true;
});
	   
$(document).off('click', '#resumeGameDeleteButton')
	   .on ('click', '#resumeGameDeleteButton', function (event) {
    event.preventDefault();
    
    var table;
    switch ($('#resumeGamePopup').data('gType')) {
	case '141':
	    table = app.dbFortune.tables.Game141;
	    break;
	default:
	    return false;
    }
    
    var gID = parseInt( $('#resumeGamePopup').data('gID') );

    app.vibrate(300);
    app.confirmDlg(
	'Are you sure that you want to delete this game?',
	function () {
	    app.dbFortune.query(
		'DELETE FROM ' + table.name + ' WHERE gID="' + gID + '"',
		[],
		app.dummyFalse,
		app.dummyFalse
	    );
	    
	    $('#resumeGamePopup').popup('close');
	    $('#pageResumeGame') .trigger('pageshow');
	},
	function () {
	    $('#resumeGamePopup').popup('close');
	    $('#pageResumeGame') .trigger('pageshow');
	},
	'Delete Game',
	'Delete, Cancel'
    );
    
    return true;
});