/*
 *  QUERY CLASS
 *  	Represents a query wrapper that can handle several SQL statements
 */
function dbFortuneQuery () {
    var self = this;
    
    this.db	    = app.dbFortune.db;
    this.statements = new Array();
    
    /*
     *	Add an SQL statement to the query
     *		sql                   : SQL string to be executed
     *		args (optional)       : array containing values for '?'-placeholders 
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.add = function (sql) {
	var args      = (typeof arguments[1] !== 'undefined') ? arguments[1] : [],
            cbSuccess = (typeof arguments[2] !== 'undefined') ? arguments[2] : app.dummyFalse,
            cbError   = (typeof arguments[3] !== 'undefined') ? arguments[3] : app.dummyFalse;
	
	self.statements.push({
	    sql       : sql,
	    args      : args,
	    cbSuccess : cbSuccess,
	    cbError   : cbError,
	});
    }
    
    /*
     *	Execute the query
     *		cbSuccess (optional),
     *		cbError (optional)    : callback functions
     */
    this.execute = function () {
	var cbSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    cbError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	
	self.db.transaction(function (tx) {
	    for (var i = 0; i < self.statements.length; i++) {
		tx.executeSql(
		    self.statements[i].sql,
		    self.statements[i].args,
		    self.statements[i].cbSuccess,
		    self.statements[i].cbError
		);
	    }
        }, cbError, cbSuccess);
    }
}