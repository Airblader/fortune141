function FortuneUtilsClass () {
    /* DUMMY */
}

FortuneUtilsClass.prototype.setKeepScreenOn = function (mode) {
    cordova.exec( null, null, 'FortuneUtils', 'setKeepScreenOn', [mode] );
}

FortuneUtilsClass.prototype.turnScreenOn = function () {
    cordova.exec( null, null, 'FortuneUtils', 'turnScreenOn', [] );
}

FortuneUtilsClass.prototype.openListDialog = function () {
    switch( arguments.length ) {
        case 4:
            this._openListDialog( [arguments[0], arguments[1]], arguments[2], arguments[3] );
            break;
        case 3:
            this._openListDialog( arguments[0], arguments[1], arguments[2] );
            break;
        default:
            return;
    }
}

FortuneUtilsClass.prototype._openListDialog = function (entries, dlgTitle, callback) {
    cordova.exec( callback, null, 'FortuneUtils', 'openListDialog', [entries, dlgTitle, callback] );
}

FortuneUtilsClass.prototype.showWhenLocked = function (mode) {
    cordova.exec( null, null, 'FortuneUtils', 'showWhenLocked', [mode] );
}

FortuneUtilsClass.prototype.isFreeVersion = function (callback) {
    cordova.exec( callback, null, 'FortuneUtils', 'isFreeVersion', [] );
}


FortuneUtilsClass.prototype.WAKELOCK_OFF = 0;
FortuneUtilsClass.prototype.WAKELOCK_DIM = 1;
FortuneUtilsClass.prototype.WAKELOCK_ON = 2;
FortuneUtilsClass.prototype.WAKELOCK_PARTIAL = 3;