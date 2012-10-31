$(document).on('pageshow', '#pageProfiles141List', function () {
    // Create List
     $('#game141ProfilesList').html('');
    var entryDummy = '<li><a href="[href]"><h3>[name]</h3><p>[details1]</p><p>[details2]</p><p class="ui-li-count">[usage]</p></a></li>';
    
    app.dbFortune.query(
        'SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' ORDER BY Usage DESC',
	[],
        function (tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
                var row   = results.rows.item(i),
                    entry = entryDummy;
                    
                var details1 = 'Limits: ' + row['ScoreGoal'] + '&thinsp;/&thinsp;'
                                          + ((parseInt(row['MaxInnings']) != 0) ? row['MaxInnings'] : 'none'),
                    details2 = (parseInt(row['HandicapPlayer1']) == 0 && parseInt(row['HandicapPlayer2']) == 0
                                && parseInt(row['MultiplicatorPlayer1']) == 1 && parseInt(row['MultiplicatorPlayer2']) == 1)
                               ? 'No Handicap'
                               : ('Handicap/Multiplicators : ' + row['HandicapPlayer1']      + '&thinsp;/&thinsp;'
                                                               + row['MultiplicatorPlayer1'] + ' / '
                                                               + row['HandicapPlayer2']      + '&thinsp;/&thinsp;'
                                                               + row['MultiplicatorPlayer2']);
                    
                entry = entry.replace('[href]' ,    'profiles141_details.html?id=' + row['ID'])
                             .replace('[name]' ,    row['Name'])
                             .replace('[usage]',    row['Usage'])
                             .replace('[details1]', details1)
                             .replace('[details2]', details2);
             
                $('#game141ProfilesList').append(entry)
                                         .listview('refresh');
            }
        }
    );
});