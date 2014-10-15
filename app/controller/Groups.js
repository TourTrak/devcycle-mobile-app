Ext.require(['Ext.Leaflet']);

/*
* Controller for the Groups component
* Users can join, create, or view/remove themselves from a specified
* tour group (aka, affinity group).
*
* @wlodarczyk
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
		
	// Adds user to specified group
	joinGroup: function() {
		var groupCode = Ext.getCmp('join_group_code').getValue();
		if(groupCode != '' && groupCode.length >=CODE_MIN && groupCode.length <=CODE_MAX)
		{
			Ext.Ajax.request({
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
			});
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
