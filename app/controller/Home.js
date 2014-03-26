/**
* Controller for the Home View (tab panel).
* Initalizes with the correct tabs, with all views properly initalized
*
* Contains the start tracking function which interfaces with the native
* cordova plugins and the register rider function that attempts to register
* a rider to a tour.
*
* Once successfully registered, a rider id is saved to local storage with HTML5 proxy.
* This id will persist with the rider throughout the tour.
**/

Ext.define('DevCycleMobile.controller.Home', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			'#home':{
				initialize: 'onTabpanelInitialize',
			},
		}
	},

	/**
	* Calls start on the phonegap/cordova abstraction layer
	* Expects the CDVInterface plugin with method start implemented,
	* which will start initalize everything to properly track the rider
	**/
	startTracking: function(rider_id){

		// Call the native plugins to begin tracking
		cordova.exec(
			function() {
				// do nothing: successful.
				console.log("call to native plugin successful.");
			},
			function(message) {
					console.error("start tracking error " + message );
					// this should never ever happen :S
			},
			'CDVInterface',
			'start',
			[{
	    		"dcsUrl": this.tourInfo.data.dcs_url,
	    		"startTime": this.tourInfo.data.tour_start_time,
	    		"endTime": this.tourInfo.data.tour_end_time,
	    		"tourId": this.tourInfo.data.tour_id,
	    		"riderId": rider_id
	   		}]
	    	);
	},

	/**
	* If rider is not already registered, register him or her.
	* If registraiton doesn't work, it retries in intervals defined in the
	* json.config file. The first 10 tries are using the reg_retry_init value
	* in seconds, and after this it uses the value of the reg_retry_after value
	* to determine how long to wait until attempting to register again.
	*
	* Note: registeration only works on mobile browsers due to AJAX calls;
	* not a priority fix.
	**/
	registerRider: function(){

		var self = this;

		// If we haven't registered yet, get rider id from server
		if(this.riderStore.getCount() == 0){ //& Ext.browser.is.PhoneGap){
			var rider_id = null; // rider_id to get from ajax response

  		// Register rider
  		Ext.Ajax.request({
				url: this.tourInfo.data.dcs_url + '/register/',
				method: 'POST',
				scope: this, // set scope of ajax call to this
				params: {
					os: Ext.os.name + " " + Ext.os.version,
					device: Ext.os.name,
					tourId: this.tourInfo.data.tour_id
				},
				success: function(response){

					var decodedResponse = Ext.JSON.decode(response.responseText);
					rider_id = decodedResponse.rider_id;
					var newRider = new DevCycleMobile.model.Rider({
						riderId: rider_id
					});

					// Save the rider info (id)
					this.riderStore.add(newRider);
					this.riderStore.sync();

					// start tracking
					this.startTracking(rider_id);
					this.registerPushNotification(rider_id);
				},
				failure: function(response, options){

					console.error("Registration Failure");
					console.error(response);
					console.error("retry attempts: " + self.regAttempts);

					// if less than 10 attempts at made, use the reg retry init limit
					if ( self.regAttempts < 10 ) {
						setTimeout(function() {
							self.registerRider(); }, self.tourInfo.data.reg_retry_init * 1000);
					}

					// otherwise, use the reg retry after limit
					else {
						setTimeout(function() {
							self.registerRider();}, self.tourInfo.data.reg_retry_after * 1000);
					}

					self.regAttempts++;
				}
			});


		} else {

			if (!Ext.browser.is.PhoneGap){

			}
			else{
				var riderInfo = this.riderStore.first();

				// already registered so no need to re-register
				this.startTracking(riderInfo.data.riderId);
			}
		}
	},

	/**
	* Called when the tab is initalized, sets up all the tabs
	* in the home view.
	* @private
	**/
	onTabpanelInitialize: function(component, options){

		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info
		this.riderStore = Ext.getStore("RiderInfo"); // reference to the rider store
		this.regAttempts = 1; // # of registration attempts.

		// Initalize all necessary views for tabs
		var mapContainerView = Ext.create('DevCycleMobile.view.map.Container');
		var faqContainerView = Ext.create('DevCycleMobile.view.guide.Container');
    var aboutContainerView = Ext.create('DevCycleMobile.view.about.Container');

		// define the dynamic tab panel and then add it to the component
		var tabPanel = [
			mapContainerView,
			faqContainerView,
      aboutContainerView
		] // End tab panel items

		// Add tab panel to component
		component.add(tabPanel);

		// Set active item to the map view
		component.setActiveItem(0);

		try{
			this.registerRider();
		} catch (error) {
			console.error("registration failed!");
		}

	},

	// Base Class functions
	launch: function(){
		this.callParent(arguments);
	},

	// init and set variables.
	init:function(){
		this.callParent(arguments);
	},
});
