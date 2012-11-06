function AppSettings () {
    var self = this;
    
    var keyKeepScreenOnDuring141Game = 'keepScreenOnDuring141Game',
        keyDateFormat                = 'dateFormat',
        keyLanguage                  = 'language',
        keyTooltips                  = 'tooltips';
        
    self.get = function (key) {
        return window.localStorage.getItem(key) || arguments[1];
    }
    self.set = function (key, val) {
        window.localStorage.setItem(key, val);
    }
    
    self.getKeepScreenOnDuring141Game = function () {
        return parseInt(self.get(keyKeepScreenOnDuring141Game, 0));
    }
    self.setKeepScreenOnDuring141Game = function (keepScreenOn) {
        self.set(keyKeepScreenOnDuring141Game, keepScreenOn);
    }
    
    self.getDateFormat = function () {
        return self.get(keyDateFormat, '[month]/[day]/[year]');
    }
    self.setDateFormat = function (dateFormat) {
        self.set(keyDateFormat, dateFormat);
    }
    
    self.getLanguage = function () {
        return self.get(keyLanguage, 'de');
    }
    self.setLanguage = function (lang) {
        self.set(keyLanguage, lang);
    }
    
    self.getTooltipsEnabled = function () {
        return (self.get(keyTooltips, 'false') == 'true');
    }
    self.setTooltipsEnabled = function (enableTooltips) {
        self.set(keyTooltips, enableTooltips);
    }
}