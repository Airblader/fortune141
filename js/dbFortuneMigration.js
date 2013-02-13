/**
 *  Takes care of migrating/updating the database
 */
function dbFortuneMigrator () {
    var self = this;

    var consts = {
        MIGRATION_PENDING:0,
        MIGRATION_STARTED:1,
        MIGRATION_FINISHED:2,
    };

    var database = undefined,
        initialVersion = -1,
        currentState = consts.MIGRATION_PENDING,
        migrationFuncs = new Array(),
        cbFinished = undefined,
        keyVersion = 'dbFortuneVersion';

    /**
     *  Execute migration to specified version
     */
    function executeMigration (toVersion) {
        // Migration to toVersion is available
        if ( typeof migrationFuncs[toVersion] !== 'undefined' ) {
            database.transaction(
                function (tx) {
                    self.setCurrentVersion( toVersion );

                    migrationFuncs[toVersion]( tx );
                },
                function () {
                    return;
                },
                function () {
                    executeMigration( toVersion + 1 );
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
        executeMigration( toVersion + 1 );
    }

    function endMigration () {
        cbFinished( initialVersion );
    }

    /**
     *  Add a migration
     *      toVersion : version to which this migration will update
     *      func      : migration function
     *                  (will be called with a transaction object)
     */
    this.addMigration = function (toVersion, func) {
        migrationFuncs[toVersion] = func;
    }

    this.init = function (db) {
        initialVersion = self.getCurrentVersion();
        database = db;
    }

    /**
     *  Start the migration process
     *      func : Callback function when all migrations have finished
     *             (will be called with the version installed before migration started)
     */
    this.start = function (func) {
        if ( currentState != consts.MIGRATION_PENDING || initialVersion === -1 ) {
            return false;
        }

        cbFinished = func;

        startMigration( initialVersion );
        return true;
    }

    this.setCurrentVersion = function (version) {
        window.localStorage.setItem( keyVersion, version );
    }

    this.getCurrentVersion = function () {
        return parseInt( window.localStorage.getItem( keyVersion ) ) || 0;
    }
}