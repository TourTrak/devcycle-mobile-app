/*
 * View for the groups component; users have the option to join or create
 * a riding group and can view a list of groups they are currently in with
 * the option to remove themselves.
 *
 * @ WLODARCZYK
 */
Ext.define('DevCycleMobile.view.Groups', {
    extend: 'Ext.tab.Panel',
    xtype: 'groups',
    cls: 'groupView',
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
                // MY GROUPS View
                title: 'My Groups',
                layout: 'vbox',
                items: [                    
                    {html: '<b>Your riding groups:</b>'},                    
                    {flex: 4, xtype: 'list', id: 'myGroupsList', store: 'GroupInfo', itemTpl: '{groupCode}: {groupName}'},
                    {xtype: 'button', itemId: 'remove_group', text: 'Remove', action: 'remove'}
                ],              
                listeners: {
                    /*
                     *  REFRESHES MY GROUPS LIST; ONLOAD
                     */
                    painted: function() {
                        Ext.getCmp('load-indicator').show();
                        var groupInfoStore = Ext.getStore('GroupInfo');
                        groupInfoStore.removeAll(true);
                        Ext.data.JsonP.request({
                            url: "http://centri-pedal2.se.rit.edu/list_group/1", // !!!!!!!!!!!!! REPLACE RIDER_ID !!!!!!!!!!!!!
                            type: "GET",
                            callbackKey: "callback",
                            callback: function(data, result){
                                if(data)
                                {
                                    for(var i = 0; i<result.length; i++)
                                    {
                                        console.log("trying to set store...");
                                        groupInfoStore.add({groupCode:result[i].code, groupName:result[i].name});
                                        console.log("Rider 1 is part of Group: " + result[i].name + result[i].code);
                                    }
                                }
                                else
                                {                                    
                                    console.log("Could not connect to server to get group data");
                                    alert("You are not a member of a group.");
                                }                                
                            }
                        });                        
                        Ext.getCmp('load-indicator').hide();
                    }
                }
            },
            {
                // JOIN GROUP View
                title: 'Join Group',
                layout: 'vbox',
                items: [
                    {html: '<p><b>Enter your group code (e.g. BNY123):</b></p><p>If a member has already created created a group, enter the associated code.</p>'},
					{xtype: 'textfield', id: 'join_group_code', label: 'Code'},
					{xtype: 'button', itemId: 'join_group', text: 'Join', action: 'join'}
                ]
            },
			{
                // CREATE GROUP View
                title: 'Create Group',
                layout: 'vbox',
                items: [
                    {html: '<p><b>Enter the name of your riding group:</b></p>'},
					{xtype: 'textfield', id: 'group_name', label: 'Name'},
					{xtype: 'textfield', id: 'create_group_code', label: 'Code'},
                    {xtype: 'button', itemId: 'suggest_groupCode', text: 'Suggest', action:'suggest'},
					{xtype: 'button', itemId: 'create_group', text: 'Create', action: 'create'},
					{xtype: 'loadmask', id: 'load-indicator', indicator: true, hidden: true, target: this}
                ]
            }
        ]
    }
});
