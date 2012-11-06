$(document).on('pageshow', '#pageSettings', function () {
    $('#settingsKeepScreenOn').val(app.settings.getKeepScreenOnDuring141Game())
                              .selectmenu('refresh');
    
    $('#settingsDateFormat').val(app.settings.getDateFormat())
                            .selectmenu('refresh');
    
    $('#settingsLanguage').val(app.settings.getLanguage())
                          .selectmenu('refresh');
                          
    $('#settingsTooltips').val(String(app.settings.getTooltipsEnabled()))
                          .slider('refresh');
});

$(document).on('change', '#settingsKeepScreenOn', function (event) {
    app.settings.setKeepScreenOnDuring141Game($(this).val());
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