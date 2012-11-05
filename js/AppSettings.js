function AppSettings () {
    var self = this;
    
    var keyKeepScreenOnDuring141Game = 'keepScreenOnDuring141Game';
    
    self.getKeepScreenOnDuring141Game = function () {
        return parseInt(window.localStorage.getItem(keyKeepScreenOnDuring141Game)) || 0;
    }
    self.setKeepScreenOnDuring141Game = function (keepScreenOn) {
        window.localStorage.setItem(keyKeepScreenOnDuring141Game, keepScreenOn);
    }
    
    self.isTooltipsEnabled = function () {
        return true;
    }
}