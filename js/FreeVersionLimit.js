function freeVersionLimit (isFreeVersion) {
    this.limits = {
        GAME141_MAX_INNINGS: 20,
        
        GAME8910_MAX_RACKS_PER_SET: 3,
        GAME8910_MAX_SETS: 1,
    };
    
    this.isLimited = function () {
        return isFreeVersion;
    }
}