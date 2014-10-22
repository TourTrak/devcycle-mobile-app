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
	cacheGroupRiders: function(code, ridersArray) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
		var arrayLength = ridersArray.length;

		for(var i = 0; i<arrayLength; i++) 
		{
			var id = ridersArray[i];
			var newGroupRider = new DevCycleMobile.model.GroupRider({
				groupCode: code,
				riderId: id
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
			
			this.clearStore("group");
			this.clearStore("groupRider");

			var riderArray = new Array(1,2,3,4,5);
			this.cacheGroupRiders("RMCD", riderArray);
			this.cacheGroup("NEWG", "This is a new group");
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
				Ext.Ajax.request({
				url: this.tourInfo.data.dcs_url + '/create_group/',// need to define
				method: 'POST',
				scope: this,
				params: {				
					riderId: this.riderInfo.get('riderId'),
					group: groupName,
					code: code
				},
				success: function(response){
					alert('Group successfully created!');
				}			
				});
			}			
		}
		else {
			alert('Error: Please enter a group name (MAX: 30 characters)');
		}
		Ext.getCmp('load-indicator').hide();
	},
		
	// Removes user from specified group 
	removeGroup: function(groupName) {
		alert(groupName);
	}
});
