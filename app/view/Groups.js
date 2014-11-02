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
                        id: 'myGroupsList',
                        store: 'MyGroups',
						itemTpl: '{name}'
					},
					{flex: 1, xtype: 'button', itemId: 'remove_group', text: 'Remove', action: 'remove'}
                ],              
                listeners: {
                    painted: function() {
                        //Ext.getCmp('load-indicator').show();
                        var myGroupsStore = Ext.getStore('MyGroups');
                        myGroupsStore.removeAll(true);
                        Ext.data.JsonP.request({
                            url: "http://centri-pedal2.se.rit.edu/list_group/1", //REPLACE RIDER_ID
                            type: "GET",
                            callbackKey: "callback",
                            callback: function(data, result){
                                //Data is true if can get, else false
                                if(data)
                                {
                                    //console.log(result[i]);
                                    for(var i = 0; i<result.length; i++)
                                    {
                                        console.log("trying to set store...");
                                        myGroupsStore.add({name:result[i].name});
                                        console.log("Rider 1 is part of Group: " + result[i].name);
                                    }
                                }
                                else
                                {                                    
                                    console.log("Could not connect to server to get group data");
                                    alert("You are not a member of a group.");
                                }
                                
                            }
                        });                        
                        //Ext.getCmp('load-indicator').hide();
                    }
                }
            }
        ]
    }
});
