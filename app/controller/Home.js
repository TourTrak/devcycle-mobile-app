/**
* Controller for the Home View (tab panel).
* Initalizes with the correct tabs, with all
* views properly initalized 
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

	//	alert("start tracking called with rider id: " + rider_id);

		cordova.exec(
			function() {
				// do nothing success
			},
			function(message) {
				alert( "Error: " + message );
			},
			'CDVInterface',
			'start',
			[{
        		"dcsUrl": "http://devcycle.se.rit.edu",
        		"startTime": 1386525600,
        		"endTime": 1389114000,
        		"tourId": "toffer", 
        		"riderId": rider_id
       		 }]
		);
	},

	/**
	* If rider is not already registered, register him or her
	* @private
	**/
	registerRider: function(){

		var riderInfo = Ext.getStore("RiderInfo");
		riderInfo.load();

		console.log(riderInfo.getCount());

		// If we haven't registered yet, get rider id from server
		if(riderInfo.getCount() == 0){
			var rider_id = null;

			Ext.Ajax.request({
				url: 'http://devcycle.se.rit.edu/register/',
				method: 'POST',
				scope: this, // set scope of ajax call to this
				params: {
					os: Ext.os.name + " " + Ext.os.version,
					device: Ext.os.name,
					tourId: "sussex"
				},
				success: function(response){

					var decodedResponse = Ext.JSON.decode(response.responseText);
					rider_id = decodedResponse.rider_id;
					var newRider = new DevCycleMobile.model.Rider({
						riderId: rider_id
					});

					// Save the rider info (id)
					riderInfo.add(newRider);
					riderInfo.sync();

					// start tracking
					this.startTracking(rider_id);
					this.registerPushNotification(rider_id);
				},
				failure: function(response){
					console.log(response);
					alert("Registration Failure");
					return;
				}
			});
		} else {
			// already registered so no need to re-register
			this.startTracking(riderInfo.getAt(0).data.riderId);

			// Good idea to update the push notification ID; however, as GCM can change this at any time.
			this.registerPushNotification(riderInfo.getAt(0).data.riderId);
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

	init:function(){
		this.callParent(arguments);
	},
});
