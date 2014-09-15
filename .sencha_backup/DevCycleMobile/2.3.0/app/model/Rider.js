Ext.define('DevCycleMobile.model.Rider', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			'riderId',
			'prod' 	// this is a flag added to show we got this rider id from production server -> old beta riders were registered to the beta servers
		],
	}
});
