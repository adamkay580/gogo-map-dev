// # base/utils.js
// ----------------
// Keep your app's utility methods here. Add any methods
// to the `utils` object to make them accessible within your app.

define( function() {

	var utils = {

		enableCtrlORCMDSKeys: function( callback ){
			var isCtrl = false;
			$(document).keyup(function (e) {
				if(e.which == 17) isCtrl=false;
			}).keydown(function (e) {
				if(e.which == 17) isCtrl=true;
				if(e.which == 83 && isCtrl == true) {
					callback();
					return false;
				}
			});
		}
	};

	return utils;

});