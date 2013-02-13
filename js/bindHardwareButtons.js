document.addEventListener(
    'deviceready',
    function () {
        document.addEventListener( 'backbutton', onBackButtonPress, false );
    },
    false
);

/**
 *  Grab link target from back button (if empty, defaults to ../../index.html)
 */
function getLinkFromBackButton () {
    var href = $( 'div[data-role=header] a' ).first().attr( 'href' );

    return (href != '') ? href : '../../index.html';
}

function onBackButtonPress () {
    // First look for 'data-activePage="..."' to control special cases.
    // Otherwise simply use the page's ID
    var pageID = $.mobile.activePage.attr( 'id' ),
        subID = $.mobile.activePage.data( 'activePage' );

    switch ( pageID ) {
        case 'pageIndex':
            app.exitApp( true );
            break;

        case 'pageGame141':
            switch ( subID ) {
                case 'pageGame141_DetailsPanel':
                    app.currentGame.closeDetailsPanel();
                    break;
                case 'pageGame141_MainPanel':
                default:
                    app.currentGame.warnLeaveGame();
                    break;
            }

            break;

        case 'pageGame141Setup':
            switch ( subID ) {
                case 'pageGame141Setup_PlayerList':
                    game141HidePlayerList();
                    break;
                case 'pageGame141Setup_AnonPlayer':
                    game141HideAnonPlayer();
                    break;
                case 'pageGame141Setup_Main':
                default:
                    $.mobile.changePage( getLinkFromBackButton() );
                    break;
            }

            break;

        case 'pageView141GamesDetails':
            switch ( subID ) {
                case 'pageView141GamesDetails_Scoreboard2':
                    view141GamesDetailsHideScoreboard();
                    break;
                case 'pageView141GamesDetails_Scoreboard1':
                    view141GamesDetailsHideScoreboard();
                    $.mobile.changePage( '../../index.html' );
                    break;
                case 'pageView141GamesDetails_Main':
                default:
                    $.mobile.changePage( getLinkFromBackButton() );
                    break;
            }

            break;

        case 'pageGame8910Setup':
            switch ( subID ) {
                case 'pageGame8910Setup_PlayerList':
                    game8910HidePlayerList();
                    break;
                case 'pageGame8910Setup_AnonPlayer':
                    game8910HideAnonPlayer();
                    break;
                case 'pageGame8910Setup_Main':
                default:
                    $.mobile.changePage( getLinkFromBackButton() );
                    break;
            }
            break;

        case 'pageGame8910':
            switch ( subID ) {
                default:
                    app.currentGame.warnLeaveGame();
                    break;
            }
            break;

        case 'pageFreeVersion':
            app.alertDlg(
                'Please read the limitations and accept them!',
                app.dummyFalse,
                'Free Version',
                'OK'
            );
            break;


        default:
            $.mobile.changePage( getLinkFromBackButton() );
            break;
    }
}