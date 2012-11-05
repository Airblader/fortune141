$(document).on('pageshow', '#pageSettings', function () {
    $('#settingsKeepScreenOn').val(app.settings.getKeepScreenOnDuring141Game())
                              .selectmenu('refresh');
});

$(document).on('change', '#settingsKeepScreenOn', function (event) {
    app.settings.setKeepScreenOnDuring141Game($(this).val());
});