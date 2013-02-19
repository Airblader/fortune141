function FreeVersionLimit (isFreeVersion) {
    this.limits = {
        GAME141_MAX_INNINGS: 20,

        GAME8910_MAX_RACKS_PER_SET: 3,
        GAME8910_MAX_SETS: 1,
        GAME8910_MAX_SHOTCLOCK: 25,
    };

    this.isLimited = function () {
        return isFreeVersion;
    }
}