/**
* Custom tab bar component for displaying the 
* the tabs dynamically through the Home contoller
**/

Ext.define('DevCycleMobile.view.Home', {
	extend: 'Ext.tab.Panel',
	xtype: 'home',

	config: {
		id: 'home',
		tabBarPosition: 'bottom',
	}
});
