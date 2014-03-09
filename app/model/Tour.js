/*
* This model reprents the tour
*/

Ext.define('DevCycleMobile.model.Tour', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			'app_name',
			'dcs_url',
			'tour_id',
			'tour_start_time',
			'tour_end_time'
		],
	}
});
