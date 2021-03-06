$( document ).bind( 'mobileinit', function () {
    $.mobile.defaultPageTransition = "none";
    $.mobile.defaultDialogTransition = "none";

    $.mobile.activeBtnClass = "";
    $.mobile.buttonMarkup.hoverDelay = 0;
} );

$( document ).bind( 'deviceready', function () {
    app = new FortuneApp();
    app.dbFortune = new dbFortune();
    app.dbFortune.open(
        function () {
            navigator.splashscreen.hide();

            $( '#firstRunMainUser_Picture' ).css( 'display', 'none' );
            $( '#pageIndexFirstRunMainUser' ).css( 'display', 'block' );
        },
        function () {
            app.updateMainUser();
            app.updateIndexBubbles();

            $( '#pageIndexHead' ).css( 'display', 'block' );
            $( '#pageIndexBody' ).show( function () {
                setTimeout( function () {
                    navigator.splashscreen.hide();
                    app.informAboutFullVersion();
                }, 250 );
            } );
        }
    );
} );

$( document ).one( 'pagebeforeshow', '#pageIndex', function () {
    $( '#pageIndexHead' ).css( 'display', 'none' );
    $( '#pageIndexBody' ).css( 'display', 'none' );
} );

$( document ).on( 'pageshow', '#pageIndex', function () {
    try {
        app.updateMainUser();
        app.updateIndexBubbles();
    } catch( e ) {
        //
    }
} );


$( document ).off( 'click', '#firstRunMainUser_Submit' ).on( 'click', '#firstRunMainUser_Submit', function (event) {
    event.preventDefault();

    var name = $( '#firstRunMainUser_Name' ).val(),
        nickname = $( '#firstRunMainUser_Nickname' ).val(),
        image = $( '#firstRunMainUser_Picture' ).attr( 'src' ),
        isFavorite = true,
        displayNickname = ($( '#firstRunMainUser_DisplayNickname' ).val() == 'true'),
        activateTooltips = $( '#firstRunMainUser_activateTooltips' ).val();

    // Validation
    name = app.validateName( name, true );
    nickname = app.validateName( nickname, false );

    var msg = '';
    if( !name.valid ) {
        msg = 'The name you entered is invalid! Your name has to be at least 3 characters long and should consist of both your first and last name.';
    }
    if( !nickname.valid ) {
        msg = 'The nickname you entered is invalid. Nicknames are optional. However, if you choose to use one, it has to be at least 3 characters long.';
    }

    if( msg.length > 0 ) {
        app.alertDlg(
            msg,
            app.dummyFalse,
            'Invalid name',
            'OK'
        );

        return false;
    }

    app.Players.main = new Player();
    app.Players.main.create( name.name, nickname.name, image, isFavorite, displayNickname, true, function () {
        app.updateMainUser();
        $( '#pageIndexHead' ).css( 'display', 'block' );
        $( '#pageIndexBody' ).css( 'display', 'block' );
        $( '#pageIndexFirstRunMainUser' ).css( 'display', 'none' );

        // free version information
        if( app.freeVersionLimit.isLimited() ) {
            $.mobile.changePage( 'pages/settings/freeversion.html' );
        } else {
            // Bugfix: scroll to top
            window.scrollTo( 0, 0 );
        }
    } );

    // tooltips
    app.settings.setTooltipsEnabled( activateTooltips );

    // kill this button to prevent any double-firing (we dont need it anymore anyway)
    $( document ).off( 'click', '#firstRunMainUser_Submit' );
    return true;
} );

$( document ).off( 'click', '#firstRunMainUser_PictureTake' )
    .on( 'click', '#firstRunMainUser_PictureTake', function (event) {
        event.preventDefault();

        app.getPicture(
            function (imgURI) {
                $( '#firstRunMainUser_Picture' ).attr( 'src', imgURI ).css( 'display', 'block' );
            },
            function (message) {
                app.alertDlg(
                    'Oops! Something went wrong :( The message is: ' + message,
                    app.dummyFalse,
                    'Error',
                    'OK'
                );
            }
        );
    } );

$( document ).off( 'click', '#firstRunMainUser_PictureDelete' )
    .on( 'click', '#firstRunMainUser_PictureDelete', function (event) {
        event.preventDefault();

        $( '#firstRunMainUser_Picture' ).attr( 'src', '' ).css( 'display', 'none' );
    } );