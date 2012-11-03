function Tooltips () {
    var self = this;
    
    self.tooltips = {
        'tutorial141TapholdSelectPlayer' : 'Tap and hold the player image area to use an anonymous player that you don\'t have a profile for.',
        'tutorial141TapholdSevereFoul'   : 'Tap and hold the foul button to manually enter a severe foul punishment.',
    };
    
    self.get = function (key) {
        return self.tooltips[key];
    }
}