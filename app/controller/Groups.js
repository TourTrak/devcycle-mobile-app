Ext.require(['Ext.Leaflet']);

/*
* Controller for the Groups component
* Users can join, create, or view/remove themselves from a specified
* tour group (aka, affinity group).
*
* @wlodarczyk, @eklundjoshua
*/

var CODE_MIN = 3;
var CODE_MAX = 7;
var NAME_MAX = 30;

Ext.define('DevCycleMobile.controller.Groups', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// Reference to the Leaflet Custom Component
			'button[action=join]': {
				tap: 'joinGroup',
			},
			'button[action=create]': {
				tap: 'createGroup',
			},
			'button[action=remove]': {
				tap: 'removeGroup',
			}
		}
	},

	/**
	* function: cacheGroup
	* Description: This function will cache a group on the clients device
	* 
	* @param code : The group code for the group you'd like to cache
	* @param name : The name of the group you'd like to cache
	*/
	cacheGroup: function(code, name) {
		this.groupStore = Ext.getStore("GroupInfo");
		var newGroup = new DevCycleMobile.model.Group({
			groupCode: code,
			groupName: name
		});

		this.groupStore.filter('groupCode', code);
		if(this.groupStore.getCount() == 0)
		{
			this.groupStore.add(newGroup);
			this.groupStore.sync();
		}
		else
		{
			console.log("Group already exists");
		}
		this.groupStore.clearFilter(true);
	},

	/**
	* function: cacheGroupRiders
	* Description: This function will cache riders that are associated 
	* with a group on the local clients store.
	* 
	* @param code : The group code for the group you'd like to cache
	* @param ridersArray : an array consisting of all riders that you want
	* to be associated with that group
	*/
	cacheGroupRiders: function(code, ridersArray, latArray, longArray) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
		var arrayLength = ridersArray.length;

		for(var i = 0; i<arrayLength; i++) 
		{
			var id = ridersArray[i];
			var myLat = latArray[i];
			var myLong = longArray[i];
			
			var newGroupRider = new DevCycleMobile.model.GroupRider({
				groupCode: code,
				riderId: id,
				latitude: myLat,
				longitude: myLong
			});

			this.groupRiderStore.add(newGroupRider);

		}
		this.groupRiderStore.sync();
	},

	/**
	* function clearStore
	* Description: Clears a specified store
	*
	*/
	clearStore: function(store_name) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
		this.groupStore = Ext.getStore("GroupInfo");

		if(store_name == "group") 
		{
			this.groupStore.removeAll(true);
		}
		else if(store_name == "groupRider")
		{
			this.groupRiderStore.removeAll(true);
		}
	},
	
	// Adds user to specified group
	joinGroup: function() {
		var groupCode = Ext.getCmp('join_group_code').getValue();
		if(groupCode != '' && groupCode.length >=CODE_MIN && groupCode.length <=CODE_MAX)
		{			
			this.clearStore("group");
			this.clearStore("groupRider");

			/**
			* 40.614014, -73.993263
			* 40.620008, -73.971977
			* 40.619226, -73.954468
			* 40.630691, -73.979530
			* 40.633557, -74.004936
			* 40.633036, -73.941765
			* 40.642676, -73.950005
			* 40.650751, -73.973351
			* 40.650490, -73.918419
			* 40.663253, -73.943481
			*/
			/*var lats = new Array(40.614014, 40.620008, 40.619226, 40.630691, 40.663253);
			var longs = new Array(-73.993263, -73.971977, -73.954468, -73.979530, -74.004936);
			var lats2 = new Array(40.633557, 40.633036, 40.642676, 40.650751, 40.650490);
			var longs2 = new Array(-73.941765, -73.950005, -73.973351, -73.918419, -73.943481);
			var lats3 = new Array(40.697950, 40.696063, 40.691702, 40.703220, 40.687602);
			var longs3 = new Array(-73.961935, -73.965068, -73.975196, -73.960261, -73.987985);*/

			var lats = new Array(40.771204, 40.614803, 40.773647, 40.798215, 40.802060);
			var longs = new Array(-73.972337, -74.064370,-73.959856, -73.952367,  -73.949755);
			var lats2 = new Array(40.814068, 40.813048, 40.634108, 40.804380, 40.798643, 40.807290);
			var longs2 = new Array(-73.940801, -73.92976, -74.074115, -73.937406, -73.941612, -73.933377);
			var lats3 = new Array(40.785882, 40.635535, 40.769785, 40.810752, 40.761991);
			var longs3 = new Array(-73.950930, -74.074035, -73.917716, -73.943303, -73.925004);
			var riderArray = new Array(1,2,3,4,5);
			var riderArray2 = new Array(6,7,8,9,10);
			var riderArray3 = new Array(11,12,13,14,15);


			this.cacheGroup("RMCD", "The Ronald McDonald Playhouse");
			this.cacheGroupRiders("RMCD", riderArray, lats, longs);

			this.cacheGroup("TOUR", "Tour Trak Riding Group")
			this.cacheGroupRiders("TOUR", riderArray2, lats2, longs2);

			this.cacheGroup("RIT", "The RIT Riders");
			this.cacheGroupRiders("RIT", riderArray3, lats3, longs3);
			
			DevCycleMobile.app.getController('Map').mapGroups();

		}
		else {
			alert('Error: The group does not exist.');
		}
	},
	
	// Handles creating a group based on provided user input, sends it off to postGroup 
	createGroup: function() {
		Ext.getCmp('load-indicator').show();	
		var groupName = Ext.getCmp('group_name').getValue();
		var groupCode = Ext.getCmp('create_group_code').getValue();
		var canCreateGroup = false;
		if(groupName != '' && groupName.length <= NAME_MAX) {
			if(groupCode == '') {
				// generate random code
				groupCode = Math.random().toString(36).slice(2);
				alert('Group Code: ' + groupCode);
				canCreateGroup = true;
			}
			else if(code.length >= CODE_MIN && code.length <= CODE_MAX) {
				canCreateGroup = true;
			}
			else {
				alert('Error: Customized group code must be between 3 to 7 characters');
			}
			
			if (canCreateGroup)
			{

			}			
		}
		else {
			alert('Error: Please enter a group name (MAX: 30 characters)');
		}
		Ext.getCmp('load-indicator').hide();
	},
		
	// Removes user from specified group 
	removeGroup: function(groupName) {
		Ext.data.JsonP.request({
			url: "http://centri-pedal2.se.rit.edu/list_group/3",
			type: "GET",
			callbackKey: "callback",
			callback: function(data, result){
    			//Data is true if can get, else false
    			if(data)
    			{
					for(var i = 0; i<result.length; i++)
					{
						console.log("Rider 3 is part of Group: " + result[i].name);
					}
    			}
    			else
    			{
    				console.log("Could not connect to server to get group data")
    			}
				
			}
		});
		/*Ext.Ajax.request({
			url: this.tourInfo.data.dcs_url + '/join_group/',
			method: 'POST',
			scope: this,
			params: {				
				riderId: this.riderInfo.get('riderId'),
				code: groupCode
			},
			success: function(response){
				alert('Joined group successfully!');
			}
		});*/
	}
});
