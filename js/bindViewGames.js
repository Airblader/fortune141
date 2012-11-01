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
                    
                var date  = new Date(1000 * parseInt(row['Timestamp'])),
                    year  = date.getFullYear(),
                    month = date.getMonth() + 1,
                    day   = date.getDate();
                    
                entry = entry.replace('[href]',    'view141Games_details.html?gID=' + row['gID'])
                             .replace('[name1]',   row['Player1Name'])
                             .replace('[name2]',   row['Player2Name'])
                             .replace('[points1]', row['PointsPlayer1'])
                             .replace('[points2]', row['PointsPlayer2'])
                             .replace('[month]',   month)
                             .replace('[day]',     day)
                             .replace('[year]',    year);
                    
                $('#view141GamesList').append(entry);
            }
            $('#view141GamesList').listview('refresh');
        },
        app.dummyFalse
    );
});