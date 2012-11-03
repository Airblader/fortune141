var app;

/*
 *  MAIN APP CLASS
 */
function FortuneApp () {
    var self = this;
    
    self.dbFortune = undefined;
    self.debugMode = !(navigator.userAgent.toLowerCase().indexOf("android") > -1);
    self.tooltips  = new Tooltips();
    
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
     *	Initialize variables for tutorial
     */
    self.initTutorialVariables = function () {
	window.localStorage.setItem('tutorial141TapholdSelectPlayer', '0');
	window.localStorage.setItem('tutorial141TapholdSevereFoul', '0');
    }
    
    /*
     *	Trigger a popup for the tutorial with the given key name
     */
    self.triggerTutorial = function (key) {
	if (window.localStorage.getItem(key) == '1') {
	    return false;
	}
	
	self.alertDlg(
	    self.tooltips.get(key),
	    function () {
		window.localStorage.setItem(key, '1');
	    },
	    'Did you know?',
	    'OK'
	);
	
	return true;
    }
    
    /*
     *	Updates information about main user on index page
     */
    self.updateMainUser = function () {
	self.Players.main.load(
	    1,
	    function () {
		// Image
		var image = (self.Players.main.image.length > 0) ? self.Players.main.image : (app.imgPlayerPath + 'playerDummy.jpg');
		$('#indexMainUserImg').attr('src', image);
		
		// Name
		var name = self.Players.main.name.split(" ");
		
		$('#pageIndex .firstName').html(name.shift());
		$('#pageIndex .lastName') .html(name.join(" "));
	    }
	);
    }
    
    /*
     *	Updates the bubble counts on the main page
     */
    self.updateIndexBubbles = function () {
	// resume game
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numResGame FROM ' + app.dbFortune.tables.Game141.name + ' WHERE isFinished="0"',
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		
		var row = result.rows.item(0);
		$('#resumeGameBubble').html(row['numResGame']);
		return true;
	    }
	);
	
	// view games
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numViewGames FROM ' + app.dbFortune.tables.Game141.name + ' WHERE isFinished="1"',
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		
		var row = result.rows.item(0);
		$('#viewGamesBubble').html(row['numViewGames']);
		return true;
	    }
	);
	
	// player profiles
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numPlayers FROM ' + app.dbFortune.tables.Player.name,
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		
		var row = result.rows.item(0);
		$('#playerProfilesBubble').html(row['numPlayers']);
		return true;
	    }
	);
	
	// game profiles
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numProfiles FROM ' + app.dbFortune.tables.Game141Profile.name,
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		
		var row = result.rows.item(0);
		$('#gameProfilesBubble').html(row['numProfiles']);
		return true;
	    }
	);
    }
    
    /*
     *	Checks whether this phone supports the HTML5 canvas element
     *		forceCheck (optional) : forces to recheck
     */
    self.checkForCanvasSupport = function () {
	var forceCheck = (typeof arguments[0] !== 'undefined') ? arguments[0] : false;
	    lsVarName  = 'supportsCanvas';
	
	if (window.localStorage.getItem(lsVarName) == 'true' && !forceCheck) {
	    return window.localStorage.getItem(lsVarName);
	}
	
	var isSupported = !!window.CanvasRenderingContext2D;
	window.localStorage.setItem(lsVarName, (isSupported) ? 'true' : 'false');
	
	return isSupported;
    }
    
    /*
     *	Converts a timestamp
     */
    self.convertTimestamp = function (timestamp) {
	var date = new Date(1000 * parseInt(timestamp));
	
	function addZeros (val) {
	    return (String(val).length < 2) ? ('0' + val) : val;
	}
	
	return {
	    year    : date.getFullYear(),
	    month   : addZeros(date.getMonth() + 1),
	    day     : addZeros(date.getDate()),
	    hours   : addZeros(date.getHours()),
	    minutes : addZeros(date.getMinutes()),
	    seconds : addZeros(date.getSeconds()),
	};
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
    
    /*
     *	Normalize getPicture function
     */
    self.getPicture = function () {
	var onSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    onError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	    
	if (self.debugMode) {
	    self.alertDlg(
		'Sorry, pictures cannot be taken on a computer!',
		app.dummyFalse,
		'Error',
		'OK'
	    );
	}
	else {
	    navigator.camera.getPicture(
		onSuccess,
		onError,
		{
		    quality: 100,
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.CAMERA,
		    allowEdit: true,
		    encodingType: Camera.EncodingType.JPEG,
		    targetWidth: 120,
		    targeHeight: 120,
		}
	    );
	}
    }
    
    self.trim = function (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}