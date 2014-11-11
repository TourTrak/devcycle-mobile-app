Ext.require(['Ext.Leaflet']);

/*
 * Controller for the Groups component
 * Users can join, create, or view/remove themselves from a specified
 * tour group (aka, affinity group).
 *
 * @ WLODARCZYK, @ EKLUND
*/

// CONSTANTS
var CODE_MIN = 3;
var CODE_MAX = 7;
var NAME_MAX = 30;
var numGroups = 0;
var colorArray = ["blue", "red", "green", "orange", "purple"];


Ext.define('Group', {
	singleton: true,
	currentColorIndex: 0,
	joinedGroups: ["init"]
});

Ext.define('DevCycleMobile.controller.Groups', {
	extend: 'Ext.app.Controller',

	config: {
		// ACTION HANDLERS
		control: {
			'button[action=join]': {
				tap: 'joinGroup'
			},
			'button[action=create]': {
				tap: 'createGroup'
			},
			'button[action=remove]': {
				tap: 'removeGroup'
			},
			'button[action=suggest]': {
				tap: 'suggestCode'
			}
		}
	},
	/**
	* Chooses a color based on what colors have already been used.
	*/
	chooseAColor: function(){
		var color;
		/*Ext.define('Group', {
			singleton: true,
			currentColorIndex: null,
			joinedGroups: ["init"]
		});*/
		console.log("Group Current Color Index " + Group.currentColorIndex);

		if(Group.currentColorIndex == (colorArray.length))
		{
			Group.currentColorIndex = 0;
		}
		color = colorArray[Group.currentColorIndex];
		Group.currentColorIndex = Group.currentColorIndex + 1;
		
		return color;
	},
	/**
	* function: cacheGroup
	* Description: This function will cache a group on the clients device
	* 
	* @param code : The group code for the group you'd like to cache
	* @param name : The name of the group you'd like to cache
	*/
	cacheGroup: function(code, name, action) {
		this.groupStore = Ext.getStore("GroupInfo");
		var groupColor = this.chooseAColor();

		var newGroup = new DevCycleMobile.model.Group({
			groupCode: code,
			groupName: name,
			groupColor: groupColor
		});

		this.groupStore.filter('groupCode', code);
		if(this.groupStore.getCount() == 0)
		{
			this.groupStore.add(newGroup);
			Group.joinedGroups.push(code);

			this.groupStore.sync();
		}
		else
		{
			console.log("Group already exists");
		}
		this.groupStore.clearFilter(true);
		
		if(action == "join")
		{
			//Get all the riders in the group and populate them in the store
			DevCycleMobile.app.getController('Groups').populateGroupRiderStore(code, name);
		}
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
	cacheGroupRiders: function(code, rider, latitude, longitude) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
	
		var newGroupRider = new DevCycleMobile.model.GroupRider({
			groupCode: code,
			riderId: rider,
			latitude: latitude,
			longitude: longitude
		});
		//console.log("Count of store" + this.groupRiderStore.getCount());
		console.log("Caching " + code + " " +  rider + " " + latitude + " " + longitude + " ");

		this.groupRiderStore.add(newGroupRider);
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
			this.groupStore.sync();
		}
		else if(store_name == "groupRider")
		{
			this.groupRiderStore.removeAll(true);
			this.groupRiderStore.sync();
		}
	},

	// Populates the group rider store which 
	// holds all the riders from the server
	populateGroupRiderStore: function(group_code, group_name) {
		var groupRiderStore = Ext.getStore("GroupRiderInfo");

		//Send a get request to the server which will join the given group
		Ext.data.JsonP.request({
	        url: "http://centri-pedal2.se.rit.edu/get_location_data/" + group_code + "/",
	        type: "GET",
	        callbackKey: "callback",
	        callback: function(data, result)
	        {
	        	if(data)
	        	{
	        		for(var i = 0; i<result.length; i++)
                    {
                    	//console.log("Populating " + group_code + " " +  result[i].riderId + " " + result[i].latitude + " " + result[i].longitude + " ");
						DevCycleMobile.app.getController('Groups').cacheGroupRiders(group_code, result[i].riderId, result[i].latitude, result[i].longitude);	        			
	        		}
	        		DevCycleMobile.app.getController('Map').addGroup(group_code, group_name);	

	        	}
	        	else
	        	{
	        		alert(result);
	        	}

	        }
	    });
	},

	// Adds user to specified group
	joinGroup: function() {
		
		var groupRiderStore = Ext.getStore("GroupRiderInfo");
		var groupStore = Ext.getStore("GroupInfo");
		var riderStore = Ext.getStore("RiderInfo");
		//var riderRecord = riderStore.first();
		//var thisRiderId = riderRecord.get("riderId");
		var thisRiderId = 1;

	
		var groupCode = Ext.getCmp('join_group_code').getValue();
		if(groupCode != '' && groupCode.length >=CODE_MIN && groupCode.length <=CODE_MAX)
		{

			if(Group.joinedGroups.indexOf(groupCode) == -1)
			{
				//Send a get request to the server which will join the given group
				Ext.data.JsonP.request({
	                url: "http://centri-pedal2.se.rit.edu/join_group/" + groupCode + "/" + thisRiderId + "/",
	                type: "GET",
	                callbackKey: "callback",
	                callback: function(data, result)
	                {
	                	console.log("cb was successful");

	                  	// Successful response from the server
	               		if(data)
	                    {
	                    	console.log("data was successful");
	                       	// If the name was returned from the server
	                       	// We know there were no errors.
	                   		if(result[0].name)
	                   		{
								// Cache the group in local storage
								DevCycleMobile.app.getController('Groups').cacheGroup(groupCode, result[0].name, "join");
	                   	   	}
                   	   		else
                   	   		{
                   	   			//Result from server
                   	   			alert(result);
                   	   		}
	                	}
	                	else
	                	{                                    
	 	               		alert(result);
	                	}                                
	             	} 
	            	}); //End of JSONP Request
	            }
	            else
	            {
	            	alert('You are already part of this group');
	            }           				
		}
		else 
		{
			alert('Error: Invalid Group Format (Must be 3-7 characters)');
		}		
	},
	
	// Handles creating a group based on provided user input, sends it off to postGroup 
	createGroup: function() {			
		//Ext.getCmp('load-indicator').show();
		var groupName = Ext.getCmp('group_name').getValue();
		var groupCode = Ext.getCmp('create_group_code').getValue();
		var canCreateGroup = false;
		if(groupName != '' && groupName.length <= NAME_MAX) {
			if(groupCode == '') {
				// generate random code 
				groupCode = Math.random().toString(36).slice(2).substring(0,7);
				Ext.getCmp('create_group_code').setValue(groupCode.toUpperCase());
				canCreateGroup = true;
			}
			else if(groupCode.length >= CODE_MIN && groupCode.length <= CODE_MAX) {
				canCreateGroup = true;
			}
			else {
				alert('Error: Customized group code must be between 3 to 7 characters');
			}

			//name/rider_id/aff_code
			
			if (canCreateGroup)
			{
				Ext.Ajax.request({
					url: "http://centri-pedal2.se.rit.edu/create_group/",
					method: "POST",
					scope: this,
					params: {
						name: groupName,
						rider_id: '1',
						aff_code: groupCode.toUpperCase(),
					},
					success: function(response){
						console.log("Successfully created group");
					},
	    			failure: function(response){
						console.log("Failed creating group")	
					}
				});
			}		
		}
		else {
			alert('Error: Please enter a group name (MAX: 30 characters)');
		}		
		//Ext.getCmp('load-indicator').hide();
	},
		
	// Removes user from specified group 
	removeGroup: function() {
		var groupInfoStore = Ext.getStore("GroupInfo");
		var groupRiderInfoStore = Ext.getStore("GroupRiderInfo");
		var riderStore = Ext.getStore("RiderInfo");
		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");		

		// Gets group that is highlighted within my groups list
		var selectedGroup = Ext.getCmp('myGroupsList').getSelection();

		 //Need to be placed inside of SUCCESS function of AJAX call!!!
		groupInfoStore.remove(selectedGroup[0])
		console.log("count before filter: " + groupRiderInfoStore.getCount())
		groupRiderInfoStore.filter("groupCode", selectedGroup[0].get("groupCode"));
		groupRiderInfoStore.removeAll();
		groupRiderInfoStore.clearFilter(true);
		groupInfoStore.sync();		
	 	Ext.getCmp('myGroupsList').refresh();

		//Send a get request to the server which will join the given group
		Ext.data.JsonP.request({
	    	url: "http://centri-pedal2.se.rit.edu/leave_group/" + groupCode + "/" + thisRiderId + "/",
	        type: "GET",
	        callbackKey: "callback",
	        callback: function(data, result)
	        {
	        	if(data)
	        	{

	        	}
	        	else
	        	{
	        		alert(result);
	        	}

	        }
	    }); //End of JSONP Request
	}
});
