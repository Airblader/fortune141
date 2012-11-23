$(document).on('pageshow', '#pageSettings', function () {
    $('#settingsKeepScreenOn')
        .val(app.settings.getKeepScreenOnDuring141Game())
        .selectmenu('refresh');
                              
    $('#settingsKeepScreenOn8910')
        .val(app.settings.getKeepScreenOnDuring8910Game())
        .selectmenu('refresh');
                              
    $('#settings8910NotifyWhoHasToBreak')
        .val(String(app.settings.get8910NotifyWhoHasToBreak()))
        .selectmenu('refresh');
    
    $('#settingsDateFormat')
        .val(app.settings.getDateFormat())
        .selectmenu('refresh');
    
    $('#settingsLanguage')
        .val(app.settings.getLanguage())
        .selectmenu('refresh');
                          
    $('#settingsTooltips')
        .val(String(app.settings.getTooltipsEnabled()))
        .slider('refresh');
                          
    $('#settingsSaveToAlbum')
        .val(String(app.settings.getSaveToAlbum()))
        .selectmenu('refresh');
});

$(document).on('change', '#settingsKeepScreenOn', function (event) {
    app.settings.setKeepScreenOnDuring141Game($(this).val());
});

$(document).on('change', '#settingsKeepScreenOn8910', function (event) {
    app.settings.setKeepScreenOnDuring8910Game($(this).val());
});

$(document).on('change', '#settings8910NotifyWhoHasToBreak', function (event) {
    app.settings.set8910NotifyWhoHasToBreak($(this).val());
});

$(document).on('change', '#settingsDateFormat', function (event) {
    app.settings.setDateFormat($(this).val());
});

$(document).on('change', '#settingsLanguage', function (event) {
    app.settings.setLanguage($(this).val());
});

$(document).on('change', '#settingsTooltips', function (event) {
    app.settings.setTooltipsEnabled( String($(this).val()) );
});

$(document).off('click', '#settingsTooltipsReset')
           .on ('click', '#settingsTooltipsReset', function (event) {
    event.preventDefault();
    
    app.confirmDlg(
        'This will show all tooltips again when they\'re being triggered. Are you sure you want to reset?',
        function () {
            app.tooltips.resetAll();
        },
        app.dummyFalse,
        'Confirm',
        'Reset,Cancel'
    );
});
           
$(document).on('change', '#settingsSaveToAlbum', function (event) {
    app.settings.setSaveToAlbum( String($(this).val()) );
});
           
           
           
$(document).on('pageshow', '#pageFreeVersion', function () {
    $('#pageFreeVersion141InningsLimit').html(app.freeVersionLimit.limits.GAME141_MAX_INNINGS);
    $('#pageFreeVersion8910RacksLimit') .html(app.freeVersionLimit.limits.GAME8910_MAX_RACKS_PER_SET);
    $('#pageFreeVersion8910SetsLimit')  .html(app.freeVersionLimit.limits.GAME8910_MAX_SETS);
});

$(document).off('click', '#pageFreeVersionBtnAccept')
           .on ('click', '#pageFreeVersionBtnAccept', function (event) {
    event.preventDefault();
    
    $.mobile.changePage('../../index.html');
});