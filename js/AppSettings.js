function AppSettings () {
    var self = this;
    
    var keyKeepScreenOnDuring141Game = 'keepScreenOnDuring141Game',
        keyDateFormat                = 'dateFormat',
        keyLanguage                  = 'language';
    
    self.getKeepScreenOnDuring141Game = function () {
        return parseInt(window.localStorage.getItem(keyKeepScreenOnDuring141Game)) || 0;
    }
    self.setKeepScreenOnDuring141Game = function (keepScreenOn) {
        window.localStorage.setItem(keyKeepScreenOnDuring141Game, keepScreenOn);
    }
    
    self.getDateFormat = function () {
        return window.localStorage.getItem(keyDateFormat) || '[month]/[day]/[year]';
    }
    self.setDateFormat = function (dateFormat) {
        window.localStorage.setItem(keyDateFormat, dateFormat);
    }
    
    self.getLanguage = function () {
        return window.localStorage.getItem(keyLanguage) || 'de';
    }
    self.setLanguage = function (lang) {
        window.localStorage.setItem(keyLanguage, lang);
    }
    
    self.isTooltipsEnabled = function () {
        return true;
    }
}