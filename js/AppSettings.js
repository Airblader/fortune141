function AppSettings () {
    var self = this;
    
    var keyKeepScreenOnDuring141Game = 'keepScreenOnDuring141Game',
        keyDateFormat                = 'dateFormat',
        keyLanguage                  = 'language',
        keyTooltips                  = 'tooltips';
        
    this.get = function (key) {
        return window.localStorage.getItem(key) || arguments[1];
    }
    this.set = function (key, val) {
        window.localStorage.setItem(key, val);
    }
    
    this.getKeepScreenOnDuring141Game = function () {
        return parseInt(self.get(keyKeepScreenOnDuring141Game, 0));
    }
    this.setKeepScreenOnDuring141Game = function (keepScreenOn) {
        self.set(keyKeepScreenOnDuring141Game, keepScreenOn);
    }
    
    this.getDateFormat = function () {
        return self.get(keyDateFormat, '[month]/[day]/[year]');
    }
    this.setDateFormat = function (dateFormat) {
        self.set(keyDateFormat, dateFormat);
    }
    
    this.getLanguage = function () {
        return self.get(keyLanguage, 'en');
    }
    this.setLanguage = function (lang) {
        self.set(keyLanguage, lang);
    }
    
    this.getTooltipsEnabled = function () {
        return (self.get(keyTooltips, 'false') == 'true');
    }
    this.setTooltipsEnabled = function (enableTooltips) {
        self.set(keyTooltips, enableTooltips);
    }
}