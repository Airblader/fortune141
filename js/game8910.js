function Game8910 () {
    var self = this;
    
    this.gameID       = -1;
    this.historyStack = new Array();
    
    this.initNewGame = function () {
        self.gameType = 0;
        self.breakType = 0;
        
        
        // TODO
    }
    
    this.loadGame = function (gID, cbSuccess) {
        // TODO
    }
    
    this.saveGame = function () {
        // TODO
    }
    
    this.setPlayers = function () {
        // TODO
    }
    
    this.warnLeaveGame = function () {
        // TODO
    }
    
    this.initHistory = function () {
        // TODO
    }
    
    this.saveHistory = function () {
        // TODO
    }
    
    this.loadHistory = function () {
        // TODO
    }
    
    this.undo = function () {
        // TODO
    }
    
    this.handleBtnCallExtension = function (event) {
        event.preventDefault();
        // TODO
    }
    
    this.handleBtnUndo = function (event) {
        event.preventDefault();
        // TODO
    }
    
    this.initUI = function () {
        $('#game8910GameType').html(self.gameType);
        
        // TODO
    }
}