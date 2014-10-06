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
		var code = Ext.getCmp('join_group_code').getValue();
		if(code != '' && code.length >=CODE_MIN && code.length <=CODE_MAX)
		{
			// Do search on group
		}
		else {
			alert('Error: The group does not exist.');
		}
	},
	
	// Creates custom group provided by user
	createGroup: function(groupName) {
		var name = Ext.getCmp('group_name').getValue();
		var code = Ext.getCmp('create_group_code').getValue();
		if(name != '' && name.length <= NAME_MAX) {
			if(code == '') {
				// generate random code and add group to database				
				Ext.getCmp('load-indicator').show();
			}
			else if(code.length >= CODE_MIN && code.length <= CODE_MAX) {
				// add group to database
			}
			else {
				alert('Error: Customized group code must be between 3 to 7 characters');
			}
		}
		else {
			alert('Error: Please enter a group name (MAX: 30 characters)');
		}
	},
		
	// Removes user from specified group 
	removeGroup: function(groupName) {
		alert(groupName);
	}
});
