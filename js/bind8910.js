function game8910SetPlayer (idx, pID) {
    var anonName = (typeof arguments[2] !== 'undefined') ? arguments[2] : '';

    app.Players.ingame[idx] = new Player();
    app.Players.ingame[idx].load( pID, function () {
        var dispName = app.Players.ingame[idx].getDisplayName(),
            image = (app.Players.ingame[idx].image.length > 0) ? app.Players.ingame[idx].image : 'file:///android_asset/www/img/players/playerDummy.jpg';

        if( pID == app.ANONYMOUSPLAYERPID ) {
            app.Players.ingame[idx].name = anonName;
            dispName = anonName;
        }

        $( '#game8910SetupPlayer' + idx + 'Name' )
            .html( dispName )
            .data( 'pid', app.Players.ingame[idx].pID );
        $( '#game8910SetupPlayer' + idx + 'Img' )
            .attr( 'src', image );

        var $btnSubmit = $( '#game8910SetupSubmitButton' );
        $btnSubmit.button( 'disable' );
        if( ($( '#game8910SetupPlayer0Name' ).data( 'pid' ) != '-1' && $( '#game8910SetupPlayer1Name' ).data( 'pid' ) != '-1') &&
            ((app.Players.ingame[1 - idx].pID != pID) || (app.Players.ingame[idx].pID == app.ANONYMOUSPLAYERPID)) ) {

            $btnSubmit.button( 'enable' );
        }
    } );
}

function game8910TapHoldSelectPlayer (event) {
    event.preventDefault();

    $( '#pageGame8910Setup' ).data( 'activePage', 'pageGame8910Setup_AnonPlayer' );

    var element_id = $( this ).attr( 'id' ),
        idx = element_id.substr( element_id.length - 1, 1 );

    $( '#game8910Setup1' ).css( 'display', 'none' );
    $( '#game8910SetupHead' ).css( 'display', 'none' );
    $( '#game8910SetupAnonPlayer' )
        .data( 'player', idx )
        .css( 'display', 'block' )
    $( '#game8910SetupChoosePlayerHead' ).css( 'display', 'block' );
}

function game8910HideAnonPlayer () {
    $( '#pageGame8910Setup' ).data( 'activePage', 'pageGame8910Setup_Main' );

    $( '#game8910AnonPlayer_Name' ).val( '' );
    $( '#game8910SetupAnonPlayer' ).css( 'display', 'none' );
    $( '#game8910SetupChoosePlayerHead' ).css( 'display', 'none' );
    $( '#game8910Setup1' ).css( 'display', 'block' );
    $( '#game8910SetupHead' ).css( 'display', 'block' );
}

function game8910HidePlayerList () {
    $( '#pageGame8910Setup' ).data( 'activePage', 'pageGame8910Setup_Main' );

    $( '#game8910Setup2' ).css( 'display', 'none' );
    $( '#game8910SetupChoosePlayerHead' ).css( 'display', 'none' );

    $( '#game8910Setup1' ).css( 'display', 'block' );
    $( '#game8910SetupHead' ).css( 'display', 'block' );
}

function game8910OnListClick (pID) {
    game8910SetPlayer( $( '#game8910Setup2' ).data( 'player' ), pID );

    game8910HidePlayerList();
}

$( document ).on( 'pagebeforeshow', '#pageGame8910Setup', function () {
    var $game8910SetupHead = $( '#game8910SetupHead' ),
        $game8910Setup1 = $( '#game8910Setup1' ),
        $game8910Setup2 = $( '#game8910Setup2' ),
        $game8910SetupChoosePlayerHead = $( '#game8910SetupChoosePlayerHead' ),
        $game8910SetupNumberOfSets = $( '#game8910SetupNumberOfSets' ),
        $game8910SetupRacksPerSet = $( '#game8910SetupRacksPerSet' );

    $game8910Setup2.css( 'display', 'none' );
    $game8910SetupChoosePlayerHead.css( 'display', 'none' );

    $( '#game8910SetupAnonPlayer' ).css( 'display', 'none' );
    $( '#game8910SetupSubmitButton' ).button( 'disable' );

    // Free version limit
    if( app.freeVersionLimit.isLimited() ) {
        $game8910SetupNumberOfSets.attr( 'max', app.freeVersionLimit.limits.GAME8910_MAX_SETS ).slider( 'refresh' );
        $game8910SetupRacksPerSet.attr( 'max', app.freeVersionLimit.limits.GAME8910_MAX_RACKS_PER_SET ).slider( 'refresh' );
        $( '#game8910SetupShotclock' ).attr( 'max', app.freeVersionLimit.limits.GAME8910_MAX_SHOTCLOCK ).slider( 'refresh' );
    }

    // try to load memorized settings
    var gameType = window.localStorage.getItem( 'game8910_gameType' ) || '9',
        breakType = window.localStorage.getItem( 'game8910_breakType' ) || '0',
        racksPerSet = window.localStorage.getItem( 'game8910_racksPerSet' ) || '6',
        numberOfSets = window.localStorage.getItem( 'game8910_numberOfSets' ) || '1';
    $( '#game8910SetupGameType' ).val( gameType ).selectmenu( 'refresh' );
    $( '#game8910SetupGameBreakType' ).val( breakType ).selectmenu( 'refresh' );
    $game8910SetupRacksPerSet.val( racksPerSet ).slider( 'refresh' )
    $game8910SetupNumberOfSets.val( numberOfSets ).slider( 'refresh' );

    // Set up the main player per default
    game8910SetPlayer( 0, app.Players.main.pID );

    $( '#game8910SetupPlayerGrid div' )
        .off( 'taphold' )
        .on( 'taphold', game8910TapHoldSelectPlayer );

    // create profile list
    var entryDummy1 = '<option value="[id]">[name]</option>';
    app.dbFortune.query( 'SELECT ID, Name FROM ' + app.dbFortune.tables.Game8910Profile.name + ' ORDER BY Usage DESC', [],
        function (tx, results) {
            if( results.rows.length == 0 ) {
                $( '#game8910SetupLoadProfileSelect' )
                    .html( '<option value="-1">None</option>' )
                    .trigger( 'change' );

                return false;
            }

            var entries = new Array( results.rows.length );
            for( var i = 0; i < results.rows.length; i++ ) {
                var row = results.rows.item( i );

                entries[i] = entryDummy1
                    .replace( '[id]', row['ID'] )
                    .replace( '[name]', row['Name'] );
            }
            $( '#game8910SetupLoadProfileSelect' )
                .html( entries.join( '' ) )
                .trigger( 'change' );
            return true;
        }
    );

    // create game modes list
    var entryDummy2 = '<option value="[id]">[name]</option>';
    app.dbFortune.query(
        'SELECT ID, Name FROM ' + app.dbFortune.tables.GameModes.name + ' ORDER BY ID ASC',
        [],
        function (tx, results) {
            if( results.rows.length == 0 ) {
                $( '#game8910SetupGameMode' ).html(
                    '<option value="-1">None</option>'
                ).trigger( 'change' );

                return false;
            }

            var entries = new Array( results.rows.length );
            for( var i = 0; i < results.rows.length; i++ ) {
                var row = results.rows.item( i );

                entries[i] = entryDummy2
                    .replace( '[id]', row['ID'] )
                    .replace( '[name]', row['Name'] );
            }

            $( '#game8910SetupGameMode' )
                .html( entries.join( '' ) )
                .trigger( 'change' );
            return true;
        }
    );

    // create player list
    var listDummy = '<ul data-role="listview" data-filter="true" data-filter-placeholder="Search Players..." data-dividertheme="a">'
        + '<li data-role="list-divider">Favorites</li>[entries1]'
        + '<li data-role="list-divider">All</li>[entries2]'
        + '</ul>';

    var entryDummy = '<li data-filtertext="[filter]">'
        + '<a href="#" onClick="javascript:game8910OnListClick([pID]);">'
        + '[image][dispName]</a></li>';

    app.dbFortune.query(
        'SELECT pID, Name, Nickname, Image, displayNickname FROM ' + app.dbFortune.tables.Player.name +
            ' WHERE isFavorite = "true" ORDER BY CASE pID WHEN "1" THEN pID END DESC, LOWER(Name)',
        [],
        function (tx, results) {
            var entries1 = new Array( results.rows.length );
            for( var i = 0; i < results.rows.length; i++ ) {
                var row = results.rows.item( i ),
                    filter = row['Name'] + ' ' + row['Nickname'],
                    dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
                    image = (row['Image'] !== '') ? '<img src="' + row['Image'] + '" />' : '';

                entries1[i] = entryDummy
                    .replace( '[filter]', filter )
                    .replace( '[pID]', row['pID'] )
                    .replace( '[image]', image )
                    .replace( '[dispName]', dispName );
            }

            app.dbFortune.query(
                'SELECT pID, Name, Nickname, displayNickname FROM ' + app.dbFortune.tables.Player.name + ' ORDER BY LOWER(Name)',
                [],
                function (tx, results) {
                    var entries2 = new Array( results.rows.length );
                    for( var i = 0; i < results.rows.length; i++ ) {
                        var row = results.rows.item( i ),
                            dispName = ((row['displayNickname'] == 'true' && row['Nickname'].length != 0) ? row['Nickname'] : row['Name']),
                            filter = row['Name'] + ' ' + row['Nickname'];

                        entries2[i] = entryDummy.replace( '[filter]', filter )
                            .replace( '[pID]', row['pID'] )
                            .replace( '[image]', '' )
                            .replace( '[dispName]', dispName );
                    }

                    $( '#game8910Setup2' ).html(
                        listDummy.replace( '[entries1]', entries1.join( '' ) )
                            .replace( '[entries2]', entries2.join( '' ) )
                    ).trigger( 'create' );
                }
            );
        }
    );
} );

$( document ).off( 'click', '#game8910SetupPlayerGrid div' )
    .on( 'click', '#game8910SetupPlayerGrid div', function (event) {
        event.preventDefault();

        $( '#pageGame8910Setup' ).data( 'activePage', 'pageGame8910Setup_PlayerList' );

        var element_id = $( this ).attr( 'id' ),
            idx = element_id.substr( element_id.length - 1, 1 );

        $( '#game8910Setup1' ).css( 'display', 'none' );
        $( '#game8910SetupHead' ).css( 'display', 'none' );
        $( '#game8910Setup2' ).data( 'player', idx )
            .css( 'display', 'block' );
        $( '#game8910SetupChoosePlayerHead' ).css( 'display', 'block' );
    } );

$( document ).off( 'click', '#game8910SetupChoosePlayerHeadBackLink' )
    .on( 'click', '#game8910SetupChoosePlayerHeadBackLink', function (event) {
        event.preventDefault();

        $( '#game8910SetupChoosePlayerHead' ).css( 'display', 'none' );
        $( '#game8910Setup2' ).css( 'display', 'none' );
        $( '#game8910SetupAnonPlayer' ).css( 'display', 'none' );

        $( '#game8910SetupHead' ).css( 'display', 'block' );
        $( '#game8910Setup1' ).css( 'display', 'block' );
    } );

$( document ).off( 'click', '#game8910SetupLoadProfileButton' )
    .on( 'click', '#game8910SetupLoadProfileButton', function (event) {
        event.preventDefault();

        var profileID = parseInt( $( '#game8910SetupLoadProfileSelect' ).val() );
        app.dbFortune.query(
            'SELECT * FROM ' + app.dbFortune.tables.Game8910Profile.name + ' WHERE ID="' + profileID + '" LIMIT 1', [],
            function (tx, result) {
                if( result.rows.length == 0 ) {
                    return false;
                }

                var row = result.rows.item( 0 );

                var useSoundValue = String( row['ShotclockUseSound'] == 1 );

                $( '#game8910SetupNumberOfSets' ).val( row['NumberOfSets'] ).slider( 'refresh' );
                $( '#game8910SetupRacksPerSet' ).val( row['RacksPerSet'] ).slider( 'refresh' );
                $( '#game8910SetupShotclock' ).val( row['Shotclock'] ).slider( 'refresh' );
                $( '#game8910SetupExtension' ).val( row['ExtensionTime'] ).slider( 'refresh' );
                $( '#game8910SetupExtensionsPerRack' ).val( row['ExtensionsPerRack'] ).slider( 'refresh' );
                $( '#game8910SetupShotclockUseSound' ).val( useSoundValue ).slider( 'refresh' );
                $( '#game8910SetupGameType' ).val( row['GameType'] ).trigger( 'change' );
                $( '#game8910SetupGameBreakType' ).val( row['BreakType'] ).trigger( 'change' );
                $( '#game8910SetupGameMode' ).val( row['GameMode'] ).trigger( 'change' );

                // increase usage counter
                app.dbFortune.query(
                    'UPDATE ' + app.dbFortune.tables.Game8910Profile.name + ' SET Usage="' + (parseInt( row['Usage'] ) + 1) + '" WHERE ID="' + profileID + '"'
                );

                return true;
            }
        );
    } );

$( document ).off( 'click', '#game8910AnonPlayer_Submit' )
    .on( 'click', '#game8910AnonPlayer_Submit', function (event) {
        event.preventDefault();

        var name = app.validateName( $( '#game8910AnonPlayer_Name' ).val(), true );

        if( name.valid ) {
            game8910HideAnonPlayer();

            var idx = parseInt( $( '#game8910SetupAnonPlayer' ).data( 'player' ) );
            game8910SetPlayer(
                idx,
                app.ANONYMOUSPLAYERPID,
                name.name
            );
        } else {
            app.alertDlg(
                'The name you entered is invalid. A valid name consists of at least three characters.',
                app.dummyFalse,
                'Error',
                'OK'
            );
        }
    } );

$( document ).off( 'click', '#game8910SetupLoadProfileButton' )
    .on( 'click', '#game8910SetupLoadProfileButton', function (event) {
        event.preventDefault();

        var profileID = parseInt( $( '#game8910SetupLoadProfileSelect' ).val() );
        app.dbFortune.query(
            'SELECT * FROM ' + app.dbFortune.tables.Game8910Profile.name + ' WHERE ID="' + profileID + '" LIMIT 1', [],
            function (tx, result) {
                if( result.rows.length == 0 ) {
                    return false;
                }

                var row = result.rows.item( 0 );

                $( '#game8910SetupGameType' ).val( row['GameType'] ).selectmenu( 'refresh' );
                $( '#game8910SetupGameBreakType' ).val( row['BreakType'] ).selectmenu( 'refresh' );
                $( '#game8910SetupNumberOfSets' ).val( row['NumberOfSets'] ).slider( 'refresh' );
                $( '#game8910SetupRacksPerSet' ).val( row['RacksPerSet'] ).slider( 'refresh' );
                $( '#game8910SetupShotclock' ).val( row['Shotclock'] ).slider( 'refresh' );
                $( '#game8910SetupExtension' ).val( row['ExtensionTime'] ).slider( 'refresh' );
                $( '#game8910SetupExtensionsPerRack' ).val( row['ExtensionsPerRack'] ).slider( 'refresh' );
                $( '#game8910SetupShotclockUseSound' )
                    .val( (row['ShotclockUseSound'] == '1') ? 'true' : 'false' )
                    .slider( 'refresh' );
                $( '#game8910SetupGameMode' ).val( row['GameMode'] ).selectmenu( 'refresh' );

                // increase usage counter
                app.dbFortune.query(
                    'UPDATE ' + app.dbFortune.tables.Game8910Profile.name + ' SET Usage="' + (parseInt( row['Usage'] ) + 1) + '" WHERE ID="' + profileID + '"'
                );

                return true;
            }
        );
    } );

$( document ).off( 'click', '#game8910SetupSubmitButton' )
    .on( 'click', '#game8910SetupSubmitButton', function (event) {
        event.preventDefault();

        window.localStorage.setItem( 'game8910_gameType', $( '#game8910SetupGameType' ).val() );
        window.localStorage.setItem( 'game8910_breakType', $( '#game8910SetupGameBreakType' ).val() );
        window.localStorage.setItem( 'game8910_racksPerSet', $( '#game8910SetupRacksPerSet' ).val() );
        window.localStorage.setItem( 'game8910_numberOfSets', $( '#game8910SetupNumberOfSets' ).val() );

        $.mobile.changePage( 'game8910.html', {
            data: {
                player0: $( '#game8910SetupPlayer0Name' ).data( 'pid' ),
                player1: $( '#game8910SetupPlayer1Name' ).data( 'pid' ),
                gameType: $( '#game8910SetupGameType' ).val(),
                breakType: $( '#game8910SetupGameBreakType' ).val(),
                mode: $( '#game8910SetupGameMode' ).val(),
                racksPerSet: $( '#game8910SetupRacksPerSet' ).val(),
                numberOfSets: $( '#game8910SetupNumberOfSets' ).val(),
                shotClock: $( '#game8910SetupShotclock' ).val(),
                extensionTime: $( '#game8910SetupExtension' ).val(),
                extensionsPerRack: $( '#game8910SetupExtensionsPerRack' ).val(),
                useSoundWarning: $( '#game8910SetupShotclockUseSound' ).val() === 'true',
            }
        } );
    } );

$( document ).on( 'pagebeforeshow', '#pageGame8910', function () {
    var url = $.url( $.url().attr( 'fragment' ) );

    app.FortuneUtils.setKeepScreenOn( app.settings.getKeepScreenOnDuring8910Game() );
    app.FortuneUtils.showWhenLocked( app.settings.getShowWhenLocked() );

    var gID = parseInt( url.param( 'gID' ) ),
        load = true;
    if( typeof gID === 'undefined' || isNaN( gID ) ) {
        load = false;

        var player0 = parseInt( url.param( 'player0' ) ),
            player1 = parseInt( url.param( 'player1' ) ),
            gameType = parseInt( url.param( 'gameType' ) ),
            breakType = parseInt( url.param( 'breakType' ) ),
            mode = parseInt( url.param( 'mode' ) ),
            racksPerSet = parseInt( url.param( 'racksPerSet' ) ),
            numberOfSets = parseInt( url.param( 'numberOfSets' ) ),
            shotClock = parseInt( url.param( 'shotClock' ) ),
            extensionTime = parseInt( url.param( 'extensionTime' ) ),
            extensionsPerRack = parseInt( url.param( 'extensionsPerRack' ) ),
            useSoundWarning = url.param( 'useSoundWarning' ) === 'true';
    }

    app.currentGame = new Game8910();
    if( load ) {
        app.currentGame.loadGame(
            gID,
            app.currentGame.initUI
        );
    } else {
        app.currentGame.initNewGame(
            gameType, breakType, mode, racksPerSet, numberOfSets, shotClock, extensionTime, extensionsPerRack, useSoundWarning,
            function () {
                app.currentGame.setPlayers(
                    app.currentGame.initUI
                );
            }
        );
    }
} );

$( document ).on( 'pagehide', '#pageGame8910', function () {
    app.FortuneUtils.setKeepScreenOn( app.FortuneUtils.WAKELOCK_OFF );
    app.FortuneUtils.showWhenLocked( false );
} );

$( document ).off( 'click', '#pageGame8910MainBackLink' )
    .on( 'click', '#pageGame8910MainBackLink', function (event) {
        event.preventDefault();

        app.currentGame.warnLeaveGame();
    } );