Ext.define('DevCycleMobile.view.AboutMain', {
    extend: 'Ext.tab.Panel',
    xtype: 'aboutMain',
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
                title: 'Credits',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'accordionlist',
                        store: Ext.create('DevCycleMobile.store.Credits'),
                        flex: 1,
                        itemId: 'paging',
                        listeners: {
                            initialize: function() {
                                this.load();
                            }
                        }
                    }
                ],
                control: {
                    'button[action=expand]': {
                        tap: function() {
                            this.down('accordionlist').doAllExpand();
                        }
                    },
                     'button[action=collapse]': {
                        tap: function() {
                            this.down('accordionlist').doAllCollapse();
                        }
                    }
                }
            },
            {
                title: 'Tracking',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'accordionlist',
                        store: Ext.create('DevCycleMobile.store.AboutTracking'),
                        flex: 1,
                        itemId: 'basic',
                        listeners: {
                            initialize: function() {
                                this.load();
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        hidden: 'true',
                        ui: 'confirm',
                        text: 'Resume Tracking',
                        id: 'btnResume',
                        handler: function() {
                            // call resumeTracking on the cordova abstraction layer
                            cordova.exec(
                                function() {
                                    // do nothing on success
                                },
                                function(message) {
                                    alert( "Error: " + message );
                                },
                                'CDVInterface',
                                'resumeTracking',
                                []
                            );
                            // show pause button
                            Ext.get('btnPause').show();
                            // hide this button
                            Ext.get('btnResume').hide();
                        }
                    },
                    {
                        xtype: 'button',
                        ui: 'decline',
                        text: 'Pause Tracking',
                        id: 'btnPause',
                        handler: function() {
                            // call pauseTracking on the cordova abstraction layer
                            cordova.exec(
                                function() {
                                    // do nothing on success
                                },
                                function(message) {
                                    alert( "Error: " + message );
                                },
                                'CDVInterface',
                                'pauseTracking',
                                []
                            );
                            // show resume button
                            Ext.get('btnResume').show();
                            //hide this button
                            Ext.get('btnPause').hide();
                        }
                    }
                ],
                control: {}
            }
        ],
        listeners: {
            // XXX: For grouped accordionList
            activeitemchange: function(self, newItem) {
                var me    = this,
                    list  = newItem.down('accordionlist'),
                    store = list.getStore();

                if (store.getCount() === 0) {
                    me.setMasked({
                        xtype: 'loadmask'
                    });
                    store.on('load', function() {
                        me.setMasked(false);
                    }, me, { single: true });
                    store.load({
                        callback: function() {
                            list.getList().refresh();
                        }
                    });
                }
            }
        }
    }

});

// If you use index bar, it might be better to override
// Ext.dataview.List scroolToRecord in case of record is empty.
Ext.define('Override.dataview.List', {
    override : 'Ext.dataview.List',
    scrollToRecord: function(record, animate, overscroll) {
        var me = this,
            store = me.getStore(),
            index = store.indexOf(record);

        item = me.listItems[index];

        if (item) {
            me.callParent(arguments);
        }
    }
});

