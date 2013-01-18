var app;

/*
 *  MAIN APP CLASS
 */
function FortuneApp () {
    var self = this;
    
    self.dbFortune = undefined;
    self.debugMode = !(navigator.userAgent.toLowerCase().indexOf('android') > -1);
    
    this.Players   = {
	main : undefined,	// Main User
	tmp  : undefined,	// Temporarily used user (modifying users, ...)
	ingame : new Array(),	// for games
    };
    
    this.settings     = new AppSettings();
    this.FortuneUtils = new FortuneUtilsClass();
    this.tooltips     = new Tooltips();
    
    this.FortuneUtils.isFreeVersion(function (result) {
	self.freeVersionLimit = new FreeVersionLimit(result);
    });
    
    this.hasCamera = false;
    window.featureDetector.hasFeature(
	window.featureDetector.FEATURE.FEATURE_CAMERA,
	function (hasFeature) {
	    self.hasCamera = true;
	}
    );

    // pID for anonymous player
    this.ANONYMOUSPLAYERPID = -10;
    
    // holds the currently running game
    this.currentGame = undefined;
    
    // Dummy functions to avoid unneccessary anonymous functions
    this.dummyFalse = function () { return false; }
    this.dummyTrue  = function () { return true;  }
    
    /*
     *	Trigger a popup for the tutorial with the given key name
     */
    this.triggerTutorial = function (key) {
	var tooltip = self.tooltips.get(key);
	
	if (tooltip.length === 0 || !self.settings.getTooltipsEnabled()) {
	    return false;
	}
	
	self.alertDlg(
	    tooltip,
	    function () {
		self.tooltips.set(key, '1');
	    },
	    'Did you know?',
	    'OK'
	);
	
	return true;
    }
    
    /*
     *	Updates information about main user on index page
     */
    this.updateMainUser = function () {
	self.Players.main.load(
	    1,
	    function () {
		// Image
		if (self.Players.main.image.length > 0)
		    $('#indexMainUserImg').attr('src', self.Players.main.image);
		else
		    $('#indexMainUserImg').attr('src', 'file:///android_asset/www/img/players/playerDummy.jpg');
		
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
    this.updateIndexBubbles = function () {
	// resume game
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numResGame FROM ('
		+ 'SELECT gID FROM '
		+ app.dbFortune.tables.Game141.name + ' WHERE isFinished=0'
		+ ' UNION ALL '
		+ 'SELECT gID FROM '
		+ app.dbFortune.tables.Game8910.name + ' WHERE isFinished=0)',
	    [],
	    function (tx, result) {
		if (result.rows.length == 0) {
		    return false;
		}
		
		var row = result.rows.item(0);
		$('#resumeGameBubble').html(
		    parseInt(row['numResGame'])
		);
		return true;
	    }
	);
	
	// view games
	app.dbFortune.query(
	    'SELECT COUNT(*) AS numViewGames FROM ('
		+ 'SELECT gID FROM '
		+ app.dbFortune.tables.Game141.name + ' WHERE isFinished=1'
		+ ' UNION ALL '
		+ 'SELECT gID FROM '
		+ app.dbFortune.tables.Game8910.name + ' WHERE isFinished=1)',
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
	    'SELECT COUNT(*) AS numProfiles FROM ('
		+ 'SELECT ID FROM '
		+ app.dbFortune.tables.Game141Profile.name
		+ ' UNION ALL '
		+ 'SELECT ID FROM '
		+ app.dbFortune.tables.Game8910Profile.name + ')',
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
    this.checkForCanvasSupport = function () {
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
    this.convertTimestamp = function (timestamp) {
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
    this.validateName = function (name, required) {
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
    this.confirmDlg = function () {
	var cbSuccess = arguments[1],
	    cbDenied  = arguments[2];
	
	if (self.debugMode) {
	    var response = confirm(arguments[0]);
	    if (response) {
		cbSuccess();
	    } else {
		cbDenied();
	    }
	} else {
	    navigator.notification.confirm(
		arguments[0],
		function (response) {
		    if (response == 1) {
			cbSuccess();
		    } else {
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
    this.alertDlg = function () {
	var cbSuccess = arguments[1];
	
	if (self.debugMode) {
	    alert(arguments[0]);
	    cbSuccess();
	} else {
	    navigator.notification.alert(
		arguments[0],
		cbSuccess,
		arguments[2],
		arguments[3]
	    );
	}
    }
    
    /*
     *	Pick a player
     *		namePlayer1,
     *		namePlayer2   : Name of players to be displayed
     *		dialogTitle   : Title of dialog
     *		callback      : callback function
     *				(will be called with index argument of selected option)
     */
    this.pickPlayer = function (namePlayer1, namePlayer2, dialogTitle, callback) {
	window.utils.pickPlayer(
	    namePlayer1,
	    namePlayer2,
	    dialogTitle,
	    String(callback)
	);
    }
    
    /*
     *	Normalize vibrate function
     *	DEPRECATED -- NO EFFECT
     *		duration : duration of vibration
     */
    this.vibrate = function () {
	if (self.debugMode) {
	    //
	} else {
	    //navigator.notification.vibrate(duration);
	}
    }
    
    /*
     *	Normalize getPicture function
     */
    this.getPicture = function () {
	var onSuccess = (typeof arguments[0] !== 'undefined') ? arguments[0] : app.dummyFalse,
	    onError   = (typeof arguments[1] !== 'undefined') ? arguments[1] : app.dummyFalse;
	    
	if (self.debugMode) {
	    self.alertDlg(
		'Sorry, pictures cannot be taken on a computer!',
		app.dummyFalse,
		'Error',
		'OK'
	    );
	} else {
	    self.confirmDlg(
		'Please choose whether you want to take a new picture or load one from your albums.',
		function () {
		    if (self.hasCamera) {
			self._getPicture(Camera.PictureSourceType.CAMERA, onSuccess, onError);
		    } else {
			app.alertDlg(
			    'Sorry, couldn\'t find a camera on your device!',
			    self.dummyFalse,
			    'Error',
			    'OK'
			);
		    }
		},
		function () {
		    self._getPicture(Camera.PictureSourceType.SAVEDPHOTOALBUM, onSuccess, onError);
		},
		'Player Picture',
		'Take Picture,Load Picture'
	    );
	}
    }
    
    self._getPicture = function (mode, onSuccess, onError) {
	navigator.camera.getPicture(
	    onSuccess,
	    function (msg) {
		if (msg.toLowerCase().indexOf('cancelled') == -1) {
		    onError(msg);
		}
	    },
	    {
		quality: 100,
		destinationType: Camera.DestinationType.FILE_URI,
		mediaType: navigator.camera.MediaType.PICTURE,
		sourceType: mode,
		allowEdit: true,
		encodingType: Camera.EncodingType.JPEG,
		targetWidth: 200,
		targeHeight: 200,
		saveToPhotoAlbum: self.settings.getSaveToAlbum(),
		correctOrientation: true,
	    }
	);
    }
    
    /*
     *	Check whether an image exists
     */
    this.checkImage = function (uri, cb) {
	$.ajax({
	    url:     uri,
	    type:    'HEAD',
	    success: function () { cb(true);  },
	    error:   function () { cb(false); },
	});
    }
    
    this.informAboutFullVersion = function () {
	if (window.localStorage.getItem('informedAboutFullVersion') === '1') {
	    return;
	}
	
	if (typeof self.freeVersionLimit === 'undefined') {
	    setTimeout(self.informAboutFullVersion, 100);
	    return;
	}
	
	if (self.freeVersionLimit.isLimited) {
	    self.confirmDlg(
		'Fortune 14/1 is now available as a full version! Do you want to open it in the Play Store?',
		function () {
		    window.location = 'market://details?id=de.fortune141.fortune141Full';
		},
		app.dummyFalse,
		'Fortune 14/1',
		'Yes,No'
	    );
	    window.localStorage.setItem('informedAboutFullVersion', '1');
	}
    }
    
    /*
     *	Exit app
     *		force: boolean whether to ask for confirmation first
     */
    this.exitApp = function (force) {
	if (force)
	    navigator.app.exitApp();
	else {
	    self.confirmDlg(
		'Do you really want to quit?',
		navigator.app.exitApp,
		app.dummyFalse,
		'Quit',
		'Yes,No'
	    );
	}
    }
    
    this.trim = function (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}