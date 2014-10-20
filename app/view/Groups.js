/*
* View for the groups component; users have the option to join or create
* a riding group and can view a list of groups they are currently in and
* have the option to remove themselves.
*
* @wlodarczyk
*/
Ext.define('DevCycleMobile.view.Groups', {
    extend: 'Ext.tab.Panel',
    xtype: 'groups',
    requires: [
		'Ext.dataview.List',
		'Ext.data.Store',
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
                    {html: '<p><b>Enter the name of your riding group:</b></p>'},
					{flex: 2, xtype: 'textfield', id: 'group_name', label: 'Name'},
					{flex: 4, html: '<p><b>Group reference code:</b></p><p>Enter a alphanumeric code to represent your group. This code will need to be given to those who want to join the group. <i>(Leave blank for a code to be generated for you)</i>'},
					{flex: 2, xtype: 'textfield', id: 'create_group_code', label: 'Code'},
					{flex: 1, xtype: 'button', itemId: 'create_group', text: 'Create', action: 'create'},
					{xtype: 'loadmask', id: 'load-indicator', indicator: true, hidden: true, target: this}
                ]
            },
			{
                title: 'My Groups',
				layout: 'vbox',
                items: [					
                    {flex: 2, html: '<b>Your riding groups:</b>'},
					{
						flex: 10,
						xtype: 'list',
						itemTpl: 'Group: {groupName} - Code: {groupCode}',
						data: (function() {
							riderId = this.riderInfo.get('riderId');
							Ext.Ajax.request({
								url: this.tourInfo.data.dcs_url + '/list_group/' + riderId + '/',
								method: 'POST',
								scope: this,
								success: function(response){
									alert('Group successfully created!');
								}			
							});
						
							var data = [{groupName: 'Rochester', groupCode: 'RIT1'},{groupName: 'Red Cross', groupCode: 'RedX911'}];
							return data;
							})()
					},
					{flex: 1, xtype: 'button', itemId: 'remove_group', text: 'Remove', action: 'remove'}
				]
            }
        ]
    }
});
