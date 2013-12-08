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
				initialize: 'onTabpanelInitialize'
			}
		}
	},

	startTracking: function(){
		cordova.exec(
			function() {
				alert("success");
			},
			function(message){
				alert("Error: " + message);
			},
			'CDVInterface',
			'startUpdatingLocation',

			// JSON object w/ arguments passed into
			// the plugin
			[]
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
		this.startTracking();

		// If we haven't registered yet, get rider id from server
		if(riderInfo.getCount() == 0){
			var rider_id = null;

			Ext.Ajax.request({
				url: 'http://devcycle.se.rit.edu/register/',
				method: 'POST',
				params: {
					os: "tofferOS",
					device: "tofferDevice",
					tourId: "toffer"
				},
				success: function(response){
					console.log(response);
					var decodedResponse = Ext.JSON.decode(response.responseText);
					rider_id = decodedResponse.rider_id;
					var newRider = new DevCycleMobile.model.Rider({
						riderId: rider_id
					});
					alert("adding rider " + rider_id)

					// Save the rider info (id)
					riderInfo.add(newRider);
					riderInfo.sync();
				},
				failure: function(response){
					console.log(response);
					alert("Registration Failure");
					return;
				}
			});
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

		this.registerRider();
	},

	// Base Class functions
	launch: function(){
		this.callParent(arguments);
	},

	init:function(){
		this.callParent(arguments);
	},
});
