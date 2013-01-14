function FortuneUtilsClass () {
    /* DUMMY */
}

FortuneUtilsClass.prototype.setKeepScreenOn = function (mode) {
    cordova.exec(null, null, 'FortuneUtils', 'setKeepScreenOn', [mode]);
}

FortuneUtilsClass.prototype.openListDialog = function () {
    switch (arguments.length) {
        case 4:
            this._openListDialog([arguments[0], arguments[1]], arguments[2], arguments[3]);
            break;
        case 3:
            this._openListDialog(arguments[0], arguments[1], arguments[2]);
            break;
        default:
            return;
    }
}

FortuneUtilsClass.prototype._openListDialog = function (entries, dlgTitle, callback) {
    cordova.exec(callback, null, 'FortuneUtils', 'openListDialog', [entries, dlgTitle, callback]);
}

FortuneUtilsClass.prototype.showWhenLocked = function (mode) {
    cordova.exec(null, null, 'FortuneUtils', 'showWhenLocked', [mode]);
}


FortuneUtilsClass.prototype.WAKELOCK_OFF = 0;