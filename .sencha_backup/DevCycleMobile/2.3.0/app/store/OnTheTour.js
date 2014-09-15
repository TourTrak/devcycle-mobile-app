Ext.define('DevCycleMobile.store.OnTheTour', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'DevCycleMobile.model.Answer'
    ],

    config: {
        defaultRootProperty: 'items',
        model: 'DevCycleMobile.model.Answer',

        // XXX: AccordionList Now show data from JSON
        proxy: {
            type: 'ajax',
            url: 'resources/data/OnTheTour.json'
        }
    }

});
