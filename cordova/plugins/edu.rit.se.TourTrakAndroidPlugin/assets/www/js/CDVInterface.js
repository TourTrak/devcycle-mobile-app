/**
* CDVInterface.js
* This is the Cordova Interface to the TourTrak Android Plugin. These functions can then be called by 
* the HTML5 mobile application once the plugin is installed.
*
* Created by Christoffer Rosen
* 12/23/2013
**/

CDVInterface: function ( callbackSuccess, callbackError ){
	
	/**
	* Expects the following arguments; dcs url, start time, end time,
	* tour id, and rider id. It will automatically start tracking the user
	* at the start time and stop tracking at the tour end time.
	**/
	start: function( callbackSuccess, callbackError, arguments ){
		cordova.exec(callbackSuccess, callbackError, "CDVInterface", "start", arguments)
	},
	
	/**
	* Pauses tracking the rider, expects no arguments
	*/
	pauseTracking: function( callbackSuccess, callbackError, arguments ){
		cordova.exec(callbackSuccess, callbackError, "CDVInterface", "pauseTracking", arguments)
	},
	
	/**
	* Resumes tracking the rider if paused AND the tour is still ongoing.
	* Expects no arguments.
	*/
	resumeTracking: function( callbackSuccess, callbackError, arguments ){
		cordova.exec(callbackSuccess, callbackError, "CDVInterface", "resumeTracking", arguments)
	}
};