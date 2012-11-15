function game8910SetPlayer (idx, pID) {
    var anonName = (typeof arguments[2] !== 'undefined') ? arguments[2] : '';
    
    app.Players.ingame[idx] = new Player();
    app.Players.ingame[idx].load(pID, function () {
	var dispName = app.Players.ingame[idx].getDisplayName(),
	    image    = (app.Players.ingame[idx].image.length > 0) ? app.Players.ingame[idx].image : 'file:///android_asset/www/img/players/playerDummy.jpg';
	
	if (pID == app.ANONYMOUSPLAYERPID) {
	    app.Players.ingame[idx].name = anonName;
	    dispName                     = anonName;
	}
	    
	$('#game8910SetupPlayer' + idx + 'Name').html(dispName)
                                                .data('pid', app.Players.ingame[idx].pID);
	$('#game8910SetupPlayer' + idx + 'Img') .attr('src', image);
	
	var $btnSubmit = $('#game8910SetupSubmitButton');
	$btnSubmit.button('disable');
	if (($('#game8910SetupPlayer0Name').data('pid') != '-1' && $('#game8910SetupPlayer1Name').data('pid') != '-1') &&
	   ((app.Players.ingame[1-idx].pID != pID) || (app.Players.ingame[idx].pID == app.ANONYMOUSPLAYERPID))) {
	    
	    $btnSubmit.button('enable'); 
	}
    });
}

$(document).on('pageshow', '#pageGame8910Setup', function () {
    var $game8910SetupHead = $('#game8910SetupHead'),
	$game8910Setup1    = $('#game8910Setup1'),
	$game8910Setup2	   = $('#game8910Setup2'),
	$game8910SetupChoosePlayerHead = $('#game8910SetupChoosePlayerHead');
        
    $game8910Setup2               .hide();
    $game8910SetupChoosePlayerHead.hide();
    
    $('#game8910SetupAnonPlayer')  .hide();
    $('#game8910SetupSubmitButton').button('disable');
    
    // TODO Free version limit
    
    // TODO Memorize variables
    
    // Set up the main player per default
    game8910SetPlayer(0, app.Players.main.pID);
    
    // TODO Bind player select
    
    // TODO Create profile list
    
    // TODO Create game modes list
    
    // TODO Create players list
});