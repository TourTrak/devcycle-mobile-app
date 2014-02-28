/**
* Controller for the Home View (tab panel).
* Initalizes with the correct tabs, with all views properly initalized 
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
	* @private 
	**/
	startTracking: function(rider_id){

		// Call the native plugins to begin tracking
		cordova.exec(
			function() {
				// do nothing: successful. 
			},
			function(message) {
				alert( "Error: " + message );
			},
			'CDVInterface',
			'start',
			[{
	    		"dcsUrl": this.tourInfo.data.dcs_url,
	    		"startTime": this.tourInfo.data.start_tour_time,
	    		"endTime": this.tourInfo.data.end_tour_time,
	    		"tourId": this.tourInfo.data.tour_id, 
	    		"riderId": rider_id
	   		}]
	    	);
	},

	/**
	* If rider is not already registered, register him or her.
	*
	* Note: registeration only works on mobile browsers due to AJAX calls; 
	* not a priority fix.
	* @private
	**/
	registerRider: function(){

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
				failure: function(response){

					alert("Registration Failure");
					return;
				}
			});
	

		} else {

			if (!Ext.browser.is.PhoneGap){

			}
			else{	
				var riderInfo = this.riderStore.first();

				// already registered so no need to re-register
				this.startTracking(riderInfo.data.riderId);

				// Good idea to update the push notification ID; however, as GCM can change this at any time.
				this.registerPushNotification(riderInfo.data.riderId);
			}
		}
	},

	/**
	* Register for push notifications 
	* @private
	**/
	registerPushNotification: function(riderId) {
		var pushNotification;

		var successHandler = function() {
			// success!
			// TODO
		};

		var failureHandler = function(msg) {
			// failure!
			// TODO
		};

		try {
			pushNotification = window.plugins.pushNotification;
			if(device.platform == 'android' || device.platform == 'Android') {
				pushNotification.register(successHandler, failureHandler, {"senderID": "741343817629", "ecb":"DevCycleMobile.app.onNotificationGCM"});
			}
		} catch(err) {
			alert(err.message);
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

		// Initalize all necessary views for tabs
		var mapContainerView = Ext.create('DevCycleMobile.view.map.Container');
		var faqContainerView = Ext.create('DevCycleMobile.view.faq.Container');
		var tourContainerView = Ext.create('DevCycleMobile.view.tourguide.Container');

		// define the dynamic tab panel and then add it to the component
		var tabPanel = [
			tourContainerView,
			mapContainerView,
			faqContainerView,
		] // End tab panel items

		// Add tab panel to component
		component.add(tabPanel);

		// Set active item to the map view
		component.setActiveItem(1); 
		
		try{
			this.registerRider();
		} catch (error) {
			alert("Registration failed!");
			alert(error.message);
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
