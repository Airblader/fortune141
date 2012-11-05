$(document).on('pageshow', '#pageSettings', function () {
    $('#settingsKeepScreenOn').val(app.settings.getKeepScreenOnDuring141Game())
                              .selectmenu('refresh');
    
    $('#settingsDateFormat').val(app.settings.getDateFormat())
                            .selectmenu('refresh');
    
    $('#settingsLanguage').val(app.settings.getLanguage())
                          .selectmenu('refresh');
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