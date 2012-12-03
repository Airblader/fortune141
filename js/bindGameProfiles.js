$(document).on('pageshow', '#pageProfiles141List', function () {
     $.mobile.loading('show');
     var $list = $('#game141ProfilesListContainer');
     
     // Create List
     var listDummy  = '<ul data-role="listview" id="game141ProfilesList">[entries]</ul>',
         entryDummy = '<li><a href="profiles141_details.html?id=[id]"><h3>[name]</h3><p>[details1]</p><p>[details2]</p><p class="ui-li-count">[usage]</p></a></li>';
     
     app.dbFortune.query(
          'SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' ORDER BY Usage DESC',
          [],
          function (tx, results) {
               var entries = new Array(results.rows.length);
               for (var i = 0; i < results.rows.length; i++) {
                    var row   = results.rows.item(i);
                    entries[i] = entryDummy;
                        
                    var details1 = 'Limits: ' + row['ScoreGoal'] + '&thinsp;/&thinsp;'
                                              + ((parseInt(row['MaxInnings']) != 0) ? row['MaxInnings'] : 'none'),
                        details2 = (parseInt(row['HandicapPlayer1']) == 0 && parseInt(row['HandicapPlayer2']) == 0
                                    && parseInt(row['MultiplicatorPlayer1']) == 1 && parseInt(row['MultiplicatorPlayer2']) == 1)
                                   ? 'No Handicap'
                                   : ('Handicap/Multiplicators : ' + row['HandicapPlayer1']      + '&thinsp;/&thinsp;'
                                                                   + row['MultiplicatorPlayer1'] + ' / '
                                                                   + row['HandicapPlayer2']      + '&thinsp;/&thinsp;'
                                                                   + row['MultiplicatorPlayer2']);
                        
                    entries[i] = entries[i].replace('[id]' ,      row['ID'])
                                           .replace('[name]' ,    row['Name'])
                                           .replace('[usage]',    row['Usage'])
                                           .replace('[details1]', details1)
                                           .replace('[details2]', details2);
               }
               
               $list.html(listDummy.replace('[entries]', entries.join('')));
               $('#game141ProfilesList').listview();
               $.mobile.loading('hide');
          }
     );
});

$(document).on('pageshow', '#pageProfiles141Details', function () {
     $btnSubmit = $('#edit141Profile_Submit');
     $btnDelete = $('#edit141Profile_Delete');
     
     var url = $.url( $.url().attr('fragment') ),
         ID  = parseInt(url.param('id'));
     
     $btnSubmit.button('disable').data('ID', ID);
     $btnDelete.button('disable').data('ID', ID);    
     if (ID > 1) {
          $btnSubmit.button('enable')
          $btnDelete.button('enable');
     }
     
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
               $('#edit141Profile_InningsLimit')    .val(row['MaxInnings'])          .slider('refresh');
               $('#edit141Profile_InningsExtension').val(row['InningsExtension'])    .slider('refresh');
               $('#edit141Profile_Handicap1')       .val(row['HandicapPlayer1'])     .slider('refresh');
               $('#edit141Profile_Handicap2')       .val(row['HandicapPlayer2'])     .slider('refresh');
               $('#edit141Profile_Multiplicator1')  .val(row['MultiplicatorPlayer1']).slider('refresh');
               $('#edit141Profile_Multiplicator2')  .val(row['MultiplicatorPlayer2']).slider('refresh');
              
               // create game modes list and select entry
               var gameModeIDs = new Array(),
                   mode        = parseInt(row['GameMode']);;
               app.dbFortune.query(
                    'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
                    [],
                    function (tx, results) {
                         if (results.rows.length == 0) {
                              $('#edit141Profile_GameMode').html(
                                  '<option value="-1">None</option>'
                              ).trigger('change');
                              
                              return false;
                         }
                         
                         var entryDummy = '<option value="[id]">[name]</option>',
                             entries    = new Array(results.rows.length);
                         for (var i = 0; i < results.rows.length; i++) {
                              var row = results.rows.item(i);
                              gameModeIDs.push(parseInt(row['ID']));
                              
                              entries[i] = entryDummy.replace('[id]',   row['ID'])
                                                     .replace('[name]', row['Name']);
                         }
                         
                         var selectedID = (gameModeIDs.indexOf(mode) > -1) ? mode : 1;
                         $('#edit141Profile_GameMode').html(entries.join('')).val(selectedID).trigger('change');
                         return true;
                    }
               );
               
               return true;
          }
     );
});

$(document).off('click', '#edit141Profile_Submit')
           .on ('click', '#edit141Profile_Submit', function (event) {
     event.preventDefault();
    
     var ID = $('#edit141Profile_Submit').data('ID');
    
     app.dbFortune.query(
          'UPDATE ' + app.dbFortune.tables.Game141Profile.name + ' SET '
              + 'Name=?, ScoreGoal=?, MaxInnings=?, InningsExtension=?, HandicapPlayer1=?, HandicapPlayer2=?, MultiplicatorPlayer1=?, MultiplicatorPlayer2=?, GameMode=? '
              + 'WHERE ID="' + ID + '"',
          [$('#edit141Profile_Name')            .val(),
           $('#edit141Profile_ScoreGoal')       .val(),
           $('#edit141Profile_InningsLimit')    .val(),
           $('#edit141Profile_InningsExtension').val(),
           $('#edit141Profile_Handicap1')       .val(),
           $('#edit141Profile_Handicap2')       .val(),
           $('#edit141Profile_Multiplicator1')  .val(),
           $('#edit141Profile_Multiplicator2')  .val(),
           $('#edit141Profile_GameMode')        .val()],
          function () {
              $.mobile.changePage('profiles141_list.html');
          },
          function () {
              app.alertDlg(
                  'Oops! Something went wrong :( Saving failed!',
                  app.dummyFalse,
                  'Error',
                  'OK'
              );
          }
     );
});
           
$(document).off('click', '#edit141Profile_Delete')
           .on ('click', '#edit141Profile_Delete', function (event) {
     event.preventDefault();
           
     var ID = $('#edit141Profile_Delete').data('ID');
     
     app.confirmDlg(
          'Are you sure you want to delete this profile? This action cannot be undone.',
          function () {
               app.dbFortune.query(
                   'DELETE FROM ' + app.dbFortune.tables.Game141Profile.name + ' WHERE ID="' + ID + '"',
                   [],
                   function () {
                       $.mobile.changePage('profiles141_list.html');
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
           
$(document).on('pageshow', '#pageProfiles141Add', function () {
     app.dbFortune.query(
          'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
          [],
          function (tx, results) {
               if (results.rows.length == 0) {
                    $('#add141Profile_GameMode').append(
                         '<option value="-1">None</option>'
                    ).trigger('change');
                    
                    return false;
               }
               
               var entryDummy = '<option value="[id]">[name]</option>',
                   entries    = new Array(results.rows.length);
               for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    
                    entries[i] = entryDummy.replace('[id]',   row['ID'])
                                           .replace('[name]', row['Name']);
               }
               
               $('#add141Profile_GameMode').append(entries.join(''))
                                           .trigger('change');
               return true;
          }
     );
});

$(document).off('click', '#add141Profile_Submit')
           .on ('click', '#add141Profile_Submit', function (event) {
     event.preventDefault();
     
     app.dbFortune.query(
          'INSERT INTO ' + app.dbFortune.tables.Game141Profile.name + ' '
          + app.dbFortune.getTableFields_String(app.dbFortune.tables.Game141Profile, false, false) + ' '
          + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [         $('#add141Profile_Name')            .val() ,
           parseInt($('#add141Profile_ScoreGoal')       .val()),
           parseInt($('#add141Profile_InningsLimit')    .val()),
           parseInt($('#add141Profile_InningsExtension').val()),
           parseInt($('#add141Profile_Handicap1')       .val()),
           parseInt($('#add141Profile_Handicap2')       .val()),
           parseInt($('#add141Profile_Multiplicator1')  .val()),
           parseInt($('#add141Profile_Multiplicator2')  .val()),
           parseInt($('#add141Profile_GameMode')        .val()),
           0],
          function () {
               $.mobile.changePage('profiles141_list.html');
          },
          function () {
               app.alertDlg(
                    'Oops! Something went wrong :( Saving failed!',
                    app.dummyFalse,
                    'Error',
                    'OK'
               );     
          }
     );
});