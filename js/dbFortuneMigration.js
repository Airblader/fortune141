/**
 *  Takes care of migrating/updating the database
 */
function dbFortuneMigrator () {
    var self = this;
    
    var consts = {
        MIGRATION_PENDING  : 0,
        MIGRATION_STARTED  : 1,
        MIGRATION_FINISHED : 2,
    };
    
    var database       = undefined,
        initialVersion = -1,
        currentState   = consts.MIGRATION_PENDING,
        migrationFuncs = new Array(),
        cbFinished     = undefined,
        keyVersion     = 'dbFortuneVersion';
        
    /**
     *  Execute migration to specified version
     */
    function executeMigration (toVersion) {
        // Migration to toVersion is available
        if (typeof migrationFuncs[toVersion] !== 'undefined') {
            database.transaction(
                function (tx) {
                    self.setCurrentVersion(toVersion);
    
                    // call migration function and execute the next migration
                    migrationFuncs[toVersion](tx);
                    executeMigration(toVersion + 1);
                }
            );
        }
        // Migration to toVersion is not available,
        // i.e. we reached the end
        else {
            currentState = consts.MIGRATION_FINISHED;
            endMigration();
        }
    }
    
    function startMigration (toVersion) {
        currentState = consts.MIGRATION_STARTED;
        executeMigration(toVersion + 1);
    }
    
    function endMigration () {
        cbFinished(initialVersion);
    }
    
    /**
     *  Add a migration
     *      toVersion : version to which this migration will update
     *      func      : migration function
     *                  (will be called with a transaction object)
     */
    self.addMigration = function (toVersion, func) {
        migrationFuncs[toVersion] = func;
    }
    
    self.init = function (db) {
        initialVersion = self.getCurrentVersion();
        database = db;
    }
    
    /**
     *  Start the migration process
     *      func : Callback function when all migrations have finished
     *             (will be called with the version installed before migration started)
     */
    self.start = function (func) {
        if (currentState != consts.MIGRATION_PENDING || initialVersion === -1)
            return false;
        
        cbFinished = func;

        startMigration(initialVersion);
        return true;
    }
    
    self.setCurrentVersion = function (version) {
        window.localStorage.setItem(keyVersion, version);
    }
    
    self.getCurrentVersion = function () {
        return parseInt(window.localStorage.getItem(keyVersion)) || 0;
    }
}