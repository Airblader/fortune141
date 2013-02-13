$( document ).on( 'pagebeforeshow', '#pageProfilesList', function () {
    var $list = $( '#gameProfilesListContainer' );

    var readyA = false,
        readyB = false;
    var resA,
        resB;

    var listDummy = '<ul data-role="listview" id="gameProfilesList">[entries]</ul>';

    var entryDummyA = '<li><a href="profiles141_details.html?id=[id]">'
            + '<img src="../../img/gameicons/game141.png" />'
            + '<h3>[name]</h3>'
            + '<p>[limits]</p>'
            + '<p>[handicap]</p>'
            + '<p class="ui-li-count">[usage]</p>'
            + '</a></li>',
        entryDummyB = '<li><a href="profiles8910_details.html?id=[id]">'
            + '<img src="../../img/gameicons/game8910.png" />'
            + '<h3>[name]</h3>'
            + '<p>[gameType]-Ball, [breakType]</p>'
            + '<p>Game to [racksPerSet][numberOfSets]</p>'
            + '<p class="ui-li-count">[usage]</p>'
            + '</a></li>';

    var entryDummyBSetsDummy = ' ([num] sets)';

    function doIt () {
        if ( !readyA || !readyB ) {
            return;
        }

        var res = resA.concat( resB );

        res.sort( function (a, b) {
            var usageA = parseInt( a['Usage'] ),
                usageB = parseInt( b['Usage'] );

            if ( usageA === usageB ) {
                return 0;
            }

            return (usageA < usageB) ? 1 : -1;
        } );

        var entries = new Array( res.length );

        for ( var i = 0; i < res.length; i++ ) {
            var currentEntry = res[i],
                ID = parseInt( currentEntry['ID'] );

            if ( currentEntry['GameType'] === '141' ) {
                var limits = 'Limits: ' + currentEntry['ScoreGoal'] + ' Points / '
                        + ((parseInt( currentEntry['MaxInnings'] ) !== 0) ? (currentEntry['MaxInnings'] + ' Innings') : 'none'),
                    handicap = (parseInt( currentEntry['HandicapPlayer1'] ) == 0
                        && parseInt( currentEntry['HandicapPlayer2'] ) == 0
                        && parseInt( currentEntry['MultiplicatorPlayer1'] ) == 1
                        && parseInt( currentEntry['MultiplicatorPlayer2'] ) == 1)

                        ? 'No Handicap'
                        : ('Handicap/Multiplicators : ' + currentEntry['HandicapPlayer1'] + '&thinsp;/&thinsp;'
                        + currentEntry['MultiplicatorPlayer1'] + ' / '
                        + currentEntry['HandicapPlayer2'] + '&thinsp;/&thinsp;'
                        + currentEntry['MultiplicatorPlayer2']);

                entries[i] = entryDummyA
                    .replace( '[id]', ID )
                    .replace( '[name]', currentEntry['Name'] )
                    .replace( '[limits]', limits )
                    .replace( '[handicap]', handicap )
                    .replace( '[usage]', currentEntry['Usage'] );
            } else {
                var numSets = (parseInt( currentEntry['NumberOfSets'] ) > 1)
                    ? entryDummyBSetsDummy.replace( '[num]', currentEntry['NumberOfSets'] )
                    : '';
                var breakTypes = new Array( 'Winner Break', 'Loser Break', 'Alternate Break' );

                entries[i] = entryDummyB
                    .replace( '[id]', ID )
                    .replace( '[name]', currentEntry['Name'] )
                    .replace( '[gameType]', currentEntry['GameType'] )
                    .replace( '[breakType]', breakTypes[parseInt( currentEntry['BreakType'] )] )
                    .replace( '[racksPerSet]', currentEntry['RacksPerSet'] )
                    .replace( '[numberOfSets]', numSets )
                    .replace( '[usage]', currentEntry['Usage'] );
            }
        }

        $list.html( listDummy.replace( '[entries]', entries.join( '' ) ) );
        $( '#gameProfilesList' ).listview();
    }

    app.dbFortune.query(
        'SELECT ID, Name, \'141\' AS GameType, ScoreGoal, MaxInnings, InningsExtension, '
            + 'HandicapPlayer1, HandicapPlayer2, MultiplicatorPlayer1, MultiplicatorPlayer2, GameMode, Usage FROM '
            + app.dbFortune.tables.Game141Profile.name,
        [],
        function (tx, results) {
            resA = new Array( results.rows.length );
            for ( var i = 0; i < results.rows.length; i++ ) {
                resA[i] = results.rows.item( i );
            }

            readyA = true;
            doIt();
        }
    );

    app.dbFortune.query(
        'SELECT ID, Name, GameType, BreakType, NumberOfSets, RacksPerSet, Shotclock, GameMode, Usage FROM '
            + app.dbFortune.tables.Game8910Profile.name,
        [],
        function (tx, results) {
            resB = new Array( results.rows.length );
            for ( var i = 0; i < results.rows.length; i++ ) {
                resB[i] = results.rows.item( i );
            }

            readyB = true;
            doIt();
        }
    );
} );

$( document ).on( 'pageshow', '#pageProfiles141Details', function () {
    $btnSubmit = $( '#edit141Profile_Submit' );
    $btnDelete = $( '#edit141Profile_Delete' );

    var url = $.url( $.url().attr( 'fragment' ) ),
        ID = parseInt( url.param( 'id' ) );

    $btnSubmit.button( 'disable' ).data( 'ID', ID );
    $btnDelete.button( 'disable' ).data( 'ID', ID );
    if ( ID > 1 ) {
        $btnSubmit.button( 'enable' )
        $btnDelete.button( 'enable' );
    }

    app.dbFortune.query(
        'SELECT * FROM ' + app.dbFortune.tables.Game141Profile.name + ' WHERE ID="' + ID + '" LIMIT 1',
        [],
        function (tx, result) {
            if ( result.rows.length == 0 ) {
                app.alertDlg(
                    'Invalid Profile ID',
                    app.dummyFalse,
                    'Error',
                    'OK'
                );
                return false;
            }

            var row = result.rows.item( 0 );
            $( '#edit141Profile_Name' ).val( row['Name'] );
            $( '#edit141Profile_ScoreGoal' ).val( row['ScoreGoal'] ).slider( 'refresh' );
            $( '#edit141Profile_InningsLimit' ).val( row['MaxInnings'] ).slider( 'refresh' );
            $( '#edit141Profile_InningsExtension' ).val( row['InningsExtension'] ).slider( 'refresh' );
            $( '#edit141Profile_Handicap1' ).val( row['HandicapPlayer1'] ).slider( 'refresh' );
            $( '#edit141Profile_Handicap2' ).val( row['HandicapPlayer2'] ).slider( 'refresh' );
            $( '#edit141Profile_Multiplicator1' ).val( row['MultiplicatorPlayer1'] ).slider( 'refresh' );
            $( '#edit141Profile_Multiplicator2' ).val( row['MultiplicatorPlayer2'] ).slider( 'refresh' );

            // create game modes list and select entry
            var gameModeIDs = new Array(),
                mode = parseInt( row['GameMode'] );

            app.dbFortune.query(
                'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
                [],
                function (tx, results) {
                    if ( results.rows.length == 0 ) {
                        $( '#edit141Profile_GameMode' ).html(
                            '<option value="-1">None</option>'
                        ).trigger( 'change' );

                        return false;
                    }

                    var entryDummy = '<option value="[id]">[name]</option>',
                        entries = new Array( results.rows.length );
                    for ( var i = 0; i < results.rows.length; i++ ) {
                        var row = results.rows.item( i );
                        gameModeIDs.push( parseInt( row['ID'] ) );

                        entries[i] = entryDummy
                            .replace( '[id]', row['ID'] )
                            .replace( '[name]', row['Name'] );
                    }

                    var selectedID = (gameModeIDs.indexOf( mode ) > -1) ? mode : 1;
                    $( '#edit141Profile_GameMode' ).html( entries.join( '' ) ).val( selectedID ).trigger( 'change' );
                    return true;
                }
            );

            return true;
        }
    );
} );

$( document ).off( 'click', '#edit141Profile_Submit' )
    .on( 'click', '#edit141Profile_Submit', function (event) {
    event.preventDefault();

    var ID = $( '#edit141Profile_Submit' ).data( 'ID' );

    app.dbFortune.query(
        'UPDATE ' + app.dbFortune.tables.Game141Profile.name + ' SET '
            + 'Name=?, ScoreGoal=?, MaxInnings=?, InningsExtension=?, HandicapPlayer1=?, HandicapPlayer2=?, MultiplicatorPlayer1=?, MultiplicatorPlayer2=?, GameMode=? '
            + 'WHERE ID="' + ID + '"',
        [$( '#edit141Profile_Name' ).val(),
            $( '#edit141Profile_ScoreGoal' ).val(),
            $( '#edit141Profile_InningsLimit' ).val(),
            $( '#edit141Profile_InningsExtension' ).val(),
            $( '#edit141Profile_Handicap1' ).val(),
            $( '#edit141Profile_Handicap2' ).val(),
            $( '#edit141Profile_Multiplicator1' ).val(),
            $( '#edit141Profile_Multiplicator2' ).val(),
            $( '#edit141Profile_GameMode' ).val()],
        function () {
            $.mobile.changePage( 'profiles_list.html' );
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
} );

$( document ).off( 'click', '#edit141Profile_Delete' )
    .on( 'click', '#edit141Profile_Delete', function (event) {
    event.preventDefault();

    var ID = $( '#edit141Profile_Delete' ).data( 'ID' );

    app.confirmDlg(
        'Are you sure you want to delete this profile? This action cannot be undone.',
        function () {
            app.dbFortune.query(
                'DELETE FROM ' + app.dbFortune.tables.Game141Profile.name + ' WHERE ID="' + ID + '"',
                [],
                function () {
                    $.mobile.changePage( 'profiles_list.html' );
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
} );

$( document ).on( 'pageshow', '#pageProfiles141Add', function () {
    app.dbFortune.query(
        'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
        [],
        function (tx, results) {
            if ( results.rows.length == 0 ) {
                $( '#add141Profile_GameMode' ).append(
                    '<option value="-1">None</option>'
                ).trigger( 'change' );

                return false;
            }

            var entryDummy = '<option value="[id]">[name]</option>',
                entries = new Array( results.rows.length );
            for ( var i = 0; i < results.rows.length; i++ ) {
                var row = results.rows.item( i );

                entries[i] = entryDummy
                    .replace( '[id]', row['ID'] )
                    .replace( '[name]', row['Name'] );
            }

            $( '#add141Profile_GameMode' )
                .append( entries.join( '' ) )
                .trigger( 'change' );
            return true;
        }
    );
} );

$( document ).off( 'click', '#add141Profile_Submit' )
    .on( 'click', '#add141Profile_Submit', function (event) {
    event.preventDefault();

    app.dbFortune.query(
        'INSERT INTO ' + app.dbFortune.tables.Game141Profile.name + ' '
            + app.dbFortune.getTableFields_String( app.dbFortune.tables.Game141Profile, false, false ) + ' '
            + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [         $( '#add141Profile_Name' ).val() ,
            parseInt( $( '#add141Profile_ScoreGoal' ).val() ),
            parseInt( $( '#add141Profile_InningsLimit' ).val() ),
            parseInt( $( '#add141Profile_InningsExtension' ).val() ),
            parseInt( $( '#add141Profile_Handicap1' ).val() ),
            parseInt( $( '#add141Profile_Handicap2' ).val() ),
            parseInt( $( '#add141Profile_Multiplicator1' ).val() ),
            parseInt( $( '#add141Profile_Multiplicator2' ).val() ),
            parseInt( $( '#add141Profile_GameMode' ).val() ),
            0],
        function () {
            $.mobile.changePage( 'profiles_list.html' );
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
} );

$( document ).on( 'pageshow', '#pageProfiles8910Details', function () {
    $btnSubmit = $( '#edit8910Profile_Submit' );
    $btnDelete = $( '#edit8910Profile_Delete' );

    var url = $.url( $.url().attr( 'fragment' ) ),
        ID = parseInt( url.param( 'id' ) ) || -1;

    function createGameModesList (preSelected) {
        var gameModeIDs = new Array();

        app.dbFortune.query(
            'SELECT * FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
            [],
            function (tx, results) {
                if ( results.rows.length == 0 ) {
                    $( '#edit8910Profile_GameMode' ).html(
                        '<option value="-1">None</option>'
                    ).trigger( 'change' );

                    return false;
                }

                var entryDummy = '<option value="[id]">[name]</option>',
                    entries = new Array( results.rows.length );

                for ( var i = 0; i < results.rows.length; i++ ) {
                    var row = results.rows.item( i );
                    gameModeIDs.push( parseInt( row['ID'] ) );

                    entries[i] = entryDummy
                        .replace( '[id]', row['ID'] )
                        .replace( '[name]', row['Name'] );
                }

                var selectedID = (gameModeIDs.indexOf( preSelected ) > -1) ? preSelected : 1;
                $( '#edit8910Profile_GameMode' ).html( entries.join( '' ) ).val( selectedID ).trigger( 'change' );
                return true;
            }
        );
    }

    $btnSubmit.button( 'disable' ).data( 'ID', ID );
    $btnDelete.button( 'disable' ).data( 'ID', ID );
    if ( ID > 1 ) {
        $btnSubmit.button( 'enable' )
        $btnDelete.button( 'enable' );
    } else if ( ID === -1 ) {
        $btnSubmit.button( 'enable' );
        $( '#edit8910Profile_DeleteWrapper' ).css( 'display', 'none' );
    }

    if ( ID > 0 ) {
        app.dbFortune.query(
            'SELECT * FROM ' + app.dbFortune.tables.Game8910Profile.name + ' WHERE ID="' + ID + '" LIMIT 1',
            [],
            function (tx, result) {
                if ( result.rows.length == 0 ) {
                    app.alertDlg(
                        'Invalid Profile ID',
                        app.dummyFalse,
                        'Error',
                        'OK'
                    );
                    return false;
                }

                var row = result.rows.item( 0 );
                $( '#edit8910Profile_Name' ).val( row['Name'] );
                $( '#edit8910Profile_GameType' ).val( row['GameType'] ).selectmenu( 'refresh' );
                $( '#edit8910Profile_BreakType' ).val( row['BreakType'] ).selectmenu( 'refresh' );
                $( '#edit8910Profile_RacksPerSet' ).val( row['RacksPerSet'] ).slider( 'refresh' );
                $( '#edit8910Profile_NumberOfSets' ).val( row['NumberOfSets'] ).slider( 'refresh' );
                $( '#edit8910Profile_Shotclock' ).val( row['Shotclock'] ).slider( 'refresh' );
                $( '#edit8910Profile_Extension' ).val( row['ExtensionTime'] ).slider( 'refresh' );
                $( '#edit8910Profile_ExtensionsPerRack' ).val( row['ExtensionsPerRack'] ).slider( 'refresh' );
                $( '#edit8910Profile_UseSound' ).val( row['ShotclockUseSound'] ).slider( 'refresh' );


                createGameModesList( parseInt( row['GameMode'] ) );
                return true;
            }
        );
    } else if ( ID === -1 ) {
        createGameModesList( -1 );
    }
} );

$( document ).off( 'click', '#edit8910Profile_Submit' )
    .on( 'click', '#edit8910Profile_Submit', function (event) {
    event.preventDefault();

    var ID = $( '#edit8910Profile_Submit' ).data( 'ID' );

    if ( ID === -1 ) { // new profile
        app.dbFortune.query(
            'INSERT INTO '
                + app.dbFortune.tables.Game8910Profile.name + ' '
                + app.dbFortune.getTableFields_String( app.dbFortune.tables.Game8910Profile, false, false ) + ' '
                + 'VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $( '#edit8910Profile_Name' ).val(),
                $( '#edit8910Profile_GameType' ).val(),
                $( '#edit8910Profile_BreakType' ).val(),
                $( '#edit8910Profile_NumberOfSets' ).val(),
                $( '#edit8910Profile_RacksPerSet' ).val(),
                $( '#edit8910Profile_Shotclock' ).val(),
                $( '#edit8910Profile_Extension' ).val(),
                $( '#edit8910Profile_ExtensionsPerRack' ).val(),
                $( '#edit8910Profile_UseSound' ).val(),
                $( '#edit8910Profile_GameMode' ).val(),
                0
            ],
            function () {
                $.mobile.changePage( 'profiles_list.html' );
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
    } else { // update profile
        app.dbFortune.query(
            'UPDATE '
                + app.dbFortune.tables.Game8910Profile.name
                + ' SET Name=?, GameType=?, BreakType=?, NumberOfSets=?, RacksPerSet=?, '
                + 'Shotclock=?, ExtensionTime=?, ExtensionsPerRack=?, ShotclockUseSound=?, GameMode=? '
                + 'WHERE ID='
                + ID,
            [
                $( '#edit8910Profile_Name' ).val(),
                $( '#edit8910Profile_GameType' ).val(),
                $( '#edit8910Profile_BreakType' ).val(),
                $( '#edit8910Profile_NumberOfSets' ).val(),
                $( '#edit8910Profile_RacksPerSet' ).val(),
                $( '#edit8910Profile_Shotclock' ).val(),
                $( '#edit8910Profile_Extension' ).val(),
                $( '#edit8910Profile_ExtensionsPerRack' ).val(),
                $( '#edit8910Profile_UseSound' ).val(),
                $( '#edit8910Profile_GameMode' ).val()
            ],
            function () {
                $.mobile.changePage( 'profiles_list.html' );
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
    }
} );

$( document ).off( 'click', '#edit8910Profile_Delete' )
    .on( 'click', '#edit8910Profile_Delete', function (event) {
    event.preventDefault();

    var ID = $( '#edit8910Profile_Delete' ).data( 'ID' );

    app.confirmDlg(
        'Are you sure you want to delete this profile? This action cannot be undone.',
        function () {
            app.dbFortune.query(
                'DELETE FROM ' + app.dbFortune.tables.Game8910Profile.name + ' WHERE ID=' + ID,
                [],
                function () {
                    $.mobile.changePage( 'profiles_list.html' );
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
} );