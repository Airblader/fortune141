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
    var pageID = $.mobile.activePage.data('activePage') || $.mobile.activePage.attr('id');
    
    switch (pageID) {
        // INDEX
        case 'pageIndex':
            navigator.app.exitApp();
            break;
        
        
        // GAME 14/1
        case 'pageGame141':
            app.confirmDlg(
                'You don\'t really want to quit. ;)',
                app.dummyFalse,
                app.dummyFalse,
                'Confirm',
                'No,No'
            );
            break;
        case 'pageGame141Setup':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        
        // GAME PROFILES
        case 'pageProfiles141Add':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        case 'pageProfiles141Details':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        case 'pageProfiles141List':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        
        // PLAYER PROFILES
        case 'pagePlayersAdd':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        case 'pagePlayerDetails':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        case 'pagePlayersList':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        
        // RESUME GAME
        case 'pageResumeGame':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        
        // SETTINGS
        case 'pageSettings':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        
        // HELP
        case 'pageHelpStart':
            $.mobile.changePage(getLinkFromBackButton());
            break;
        
        default:
            //
            break;
    }
}