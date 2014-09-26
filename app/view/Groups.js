/*
* View for the groups component; users have the option to join or create
* a riding group and can view a list of groups they are currently in and
have the option to remove themselves.
* Every time the map is rendered, we check if the user is within the tour area.
* If the user is, his or her location is pulsed on the map.
*
* If geolocation fails, it retries until successful.
*
* @wlodarczyk
*/

Ext.define('DevCycleMobile.view.Groups', {
    extend: 'Ext.tab.Panel',
    xtype: 'groups',
    requires: [
        'Ext.TitleBar',
        'Ext.SegmentedButton',
        'Ext.ux.AccordionList',
        'Ext.plugin.ListPaging',
        'Ext.plugin.PullRefresh'
    ],
    config: {
        tabBarPosition: 'top',
        tabBar: {
            scrollable : 'horizontal'
        },
        items: [
            {
                xtype: 'titlebar',
                title: 'TourTrak TD Five Boro Bike Tour',
                docked: 'top',
                style: {
                    backgroundImage: 'url(resources/images/carbon_fibre.png)'
                }
            },
            {
                title: 'Join Group',
                layout: 'vbox',
                items: [
					{height: '25px', padding: '10px'},
                    {html: '<p><b>Enter your group code (e.g. BNY123):</b></p><p>If a member has already created created a group, enter the associated code.</p>'},
					{xtype: 'textfield', id: 'join_group_code', label: 'Code'},
					{xtype: 'button', itemId: 'join_group', text: 'Join', action: 'join'}
                ]
            },
			{
                title: 'Create Group',
                layout: 'vbox',
                items: [
					{height: '25px'},
                    {html: '<p><b>Enter the name of your riding group:</b></p>'},
					{xtype: 'textfield', id: 'group_name', label: 'Name'},
					{html: '<p><b>Group reference code:</b></p><p>Enter a alphanumeric code to represent your group. This code will need to be given to those who want to join the group. <i>(Leave blank for a code to be generated for you)</i>'},
					{xtype: 'textfield', id: 'create_group_code', label: 'Code'},
					{xtype: 'button', itemId: 'create_group', text: 'Create', action: 'create'}
                ]
            },
			{
                title: 'My Groups',
                layout: 'vbox',
                items: [
					{height: '25px'},
                    {html: 'Enter the name of your riding group'},
					{xtype: 'textfield', name: 'group_name', label: 'Name'},
					{xtype: 'button', itemId: 'remove_group', text: 'Create'}
                ]
            }
        ]
    }
});

