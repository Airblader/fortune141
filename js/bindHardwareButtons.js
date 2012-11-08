document.addEventListener(
    'deviceready',
    function () {
        document.addEventListener('backbutton', onBackButtonPress, false);
    },
    false
);

/**
 *  Grab link target from back button (if empty, defaults to ../../index.html)
 */
function getLinkFromBackButton () {
    var href = $('div[data-role=header] a').first().attr('href');
    
    return (href != '') ? href : '../../index.html';
}

function onBackButtonPress () {
    // First look for 'data-activePage="..."' to control special cases.
    // Otherwise simply use the page's ID
    var pageID = $.mobile.activePage.attr('id'),
        subID  = $.mobile.activePage.data('activePage');
    
    switch (pageID) {
        case 'pageIndex':
            navigator.app.exitApp();
            break;
        
        case 'pageGame141': // TODO
            switch (subID) {
                case 'pageGame141_DetailsPanel':
                    app.currentGame.closeDetailsPanel();
                    break;
                case 'pageGame141_MainPanel':
                default:
                    app.currentGame.warnLeaveGame();
                    break;
            }
            
            break;
        case 'pageGame141Setup': // TODO
            switch (subID) {
                case 'pageGame141Setup_PlayerList':
                    game141HidePlayerList();
                    break;
                case 'pageGame141Setup_AnonPlayer':
                    game141HideAnonPlayer();
                    break;
                case 'pageGame141Setup_Main':
                default:
                    $.mobile.changePage(getLinkFromBackButton());
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
            $.mobile.changePage(getLinkFromBackButton());
            break;
    }
}