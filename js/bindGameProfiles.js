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

$(document).on('pageshow', '#pageProfiles141Details', function () {
    var url = $.url( $.url().attr('fragment') ),
	ID  = parseInt(url.param('id'));
        
    app.dbFortune.query(
        'SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' WHERE ID="' + ID + '" LIMIT 1',
        [],
        function (tx, result) {
            if (result.rows.length == 0) {
                app.alertDlg(
                    'Invalid Profile ID',
                    app.dummyFalse,
                    'Error',
                    'OK'
                );
                return false;
            }
            
            var row = result.rows.item(0);
            $('#edit141Profile_Name')            .val(row['Name']);
            $('#edit141Profile_ScoreGoal')       .val(row['ScoreGoal'])           .slider('refresh');
            $('#edit141Profile_InningsLimit')    .val(row['InningsLimit'])        .slider('refresh');
            $('#edit141Profile_InningsExtension').val(row['InningsExtension'])    .slider('refresh');
            $('#edit141Profile_Handicap1')       .val(row['HandicapPlayer1'])     .slider('refresh');
            $('#edit141Profile_Handicap2')       .val(row['HandicapPlayer2'])     .slider('refresh');
            $('#edit141Profile_Multiplicator1')  .val(row['MultiplicatorPlayer1']).slider('refresh');
            $('#edit141Profile_Multiplicator2')  .val(row['MultiplicatorPlayer2']).slider('refresh');
            
            // create game modes list and select entry
            var gameModeIDs = new Array();
            app.dbFortune.query(
                'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
                [],
                function (tx, results) {
                    if (results.rows.length == 0) {
                        $('#edit141Profile_GameMode').append(
                            '<option value="-1">None</option>'
                        ).trigger('change');
                        
                        return false;
                    }
                    
                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows.item(i);
                        gameModeIDs.push(parseInt(row['ID']));
                        
                        $('#edit141Profile_GameMode').append(
                            '<option value="' + row['ID'] + '">' + row['Name'] + '</option>'
                        );
                    }
                    var selectedID = (gameModeIDs.indexOf(ID) > -1) ? ID : 1;
                    $('#edit141Profile_GameMode').val(selectedID)
                                                 .trigger('change');
                    
                    return true;
                }
            );
            
            return true;
        }
    );
});