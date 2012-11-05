function Tooltips () {
    var self = this;
    
    self.tooltips = {
        'tutorial141TapholdSelectPlayer' : 'Tap and hold the player image area to use an anonymous player that you don\'t have a profile for.',
        'tutorial141TapholdSevereFoul'   : 'Tap and hold the foul button to manually enter a severe foul punishment.',
        'tutorial141SelectCueBall'       : 'If you made both remaining balls with the last shot, the only remaining ball is the cue ball – so select it to enter this scenario.',
    };
    
    self.get = function (key) {
        return self.tooltips[key];
    }
    
    self.resetAll = function () {
        for (var key in self.tooltips) {
            window.localStorage.setItem(self.tooltips[key], '0');
        }
    }
}