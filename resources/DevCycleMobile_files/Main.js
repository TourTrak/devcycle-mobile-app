Ext.define('DevCycleMobile.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
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
                title: 'Tour Guide',
                docked: 'top'
            },
            {
                title: 'Before The Tour',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'accordionlist',
                        store: Ext.create('DevCycleMobile.store.BeforeTheTour'),
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
                title: 'Getting Ready',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'accordionlist',
                        store: Ext.create('DevCycleMobile.store.GettingReady'),
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

