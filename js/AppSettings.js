function AppSettings () {
    var self = this;
    
    var keyKeepScreenOnDuring141Game  = 'keepScreenOnDuring141Game',
        keyKeepScreenOnDuring8910Game = 'keepScreenOnDuring8910Game',
        keyDateFormat                 = 'dateFormat',
        keyLanguage                   = 'language',
        keyTooltips                   = 'tooltips',
        keySaveToAlbum                = 'saveToAlbum';
        
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
    
    this.getKeepScreenOnDuring8910Game = function () {
        return parseInt(self.get(keyKeepScreenOnDuring8910Game, 0));
    }
    this.setKeepScreenOnDuring8910Game = function (keepScreenOn) {
        self.set(keyKeepScreenOnDuring8910Game, keepScreenOn);
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
    
    this.getSaveToAlbum = function () {
        return (self.get(keySaveToAlbum, 'true') == 'true');
    }
    this.setSaveToAlbum = function (saveToAlbum) {
        self.set(keySaveToAlbum, saveToAlbum);
    }
}