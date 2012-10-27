var app;

/*
 *  MAIN APP CLASS
 */
function FortuneApp () {
    var self = this;
    
    self.dbFortune = undefined;
    self.debugMode = !(navigator.userAgent.toLowerCase().indexOf("android") > -1);
    
    self.Players   = {
	main : undefined,	// Main User
	tmp  : undefined,	// Temporarily used user (modifying users, ...)
	ingame : new Array(),	// for games
    };
    
    self.imgPlayerPath = 'img/players/';
    
    // pID for anonymous player
    self.ANONYMOUSPLAYERPID = -10;
    
    // holds the currently running game
    self.currentGame = undefined;
    
    // key names for running games
    self.keyActiveGame = {
	id   : 'activeGame',
	type : 'activeGameType', 
    };
    
    // Dummy functions to avoid unneccessary anonymous functions
    self.dummyFalse = function () { return false; }
    self.dummyTrue  = function () { return true;  }
    
    /*
     *	Updates information about main user on index page
     */
    self.updateMainUser = function () {
	// Image
	var image = (self.Players.main.image.length > 0) ? self.Players.main.image : (app.imgPlayerPath + 'playerDummy.jpg');
	$('#indexMainUserImg').attr('src', image);
	
	// Name
	var name = self.Players.main.name.split(" ");
	
	$('#pageIndex .firstName').html(name.shift());
	$('#pageIndex .lastName') .html(name.join(" "));
    }
    
    /*
     *	Validate a name
     *		name     : string to be checked
     *		required : whether the name can be empty
     *
     *	Returns an object with the properties
     *		name  : name after validation
     *		valid : whether the name is valid
     */
    self.validateName = function (name, required) {
	var validated = {
	    name  : self.trim(name),
	    valid : true,
	};
	
	if (required && validated.name.length == 0) {
	    validated.valid = false;
	}
	else if (validated.name.length != 0 && validated.name.length < 3) {
	    validated.valid = false;
	}
	
	return validated;
    }
    
    /*
     *	Set the phone's back button to execute a certain function
     *		func (optional) : function to execute
     */
    self.currBackButtonFunc = undefined;
    self.setBackButton = function () {
	var func = arguments[0];
	
	if (typeof self.currBackButtonFunc !== 'undefined') {
	    document.removeEventListener('backbutton', self.currBackButtonFunc, false);
	}
	
	if (typeof func === 'undefined') {
	    func = function () {
		document.history.go(-1);
	    }
	}
	
	self.currBackButtonFunc = func;
	document.addEventListener('backbutton', self.currBackButtonFunc, false);
    }
    
    /*
     *	Normalize confirm dialogs for desktop and mobile usage.
     *		message            : dialog content
     *		cbSuccess,
     *		cbDenied           : callback functions
     *		title (optional)   : dialog title (only available on mobile phones)
     *		buttons (optional) : button labels (only available on mobile phones)
     */
    self.confirmDlg = function () {
	var cbSuccess = arguments[1],
	    cbDenied  = arguments[2];
	
	if (self.debugMode) {
	    var response = confirm(arguments[0]);
	    if (response) {
		cbSuccess();
	    }
	    else {
		cbDenied();
	    }
	}
	else {
	    navigator.notification.confirm(
		arguments[0],
		function (response) {
		    if (response == 1) {
			cbSuccess();
		    }
		    else {
			cbDenied();
		    }
		},
		arguments[3],
		arguments[4]
	    );
	}
    }
    
    /*
     *	Normalize alert dialog for desktop and mobile usage
     *		message           : dialog content
     *		cbSuccess         : callback
     *		title (optional)  : dialog title (only available on mobile phones)
     *		button (optional) : button label (only available on mobile phones)
     */
    self.alertDlg = function () {
	var cbSuccess = arguments[1];
	
	if (self.debugMode) {
	    alert(arguments[0]);
	    cbSuccess();
	}
	else {
	    navigator.notification.alert(
		arguments[0],
		cbSuccess,
		arguments[2],
		arguments[3]
	    );
	}
    }
    
    /*
     *	Normalize vibrate function
     *	DEPRECATED -- NO EFFECT
     *		duration : duration of vibration
     */
    self.vibrate = function () {
	if (self.debugMode) {
	    //
	}
	else {
	    //navigator.notification.vibrate(duration);
	}
    }
    
    self.trim = function (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}