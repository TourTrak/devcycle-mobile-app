package edu.rit.se.trafficanalysis.tracking;

import java.util.List;

import edu.rit.se.tourtrak.R;
//import edu.rit.se.se561.trafficanalysis.R;
import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.api.ApiClient;
import edu.rit.se.trafficanalysis.api.Messages.LocationUpdate;
import edu.rit.se.trafficanalysis.util.Util;
import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.content.Intent;
import android.util.Log;

/**
 * Class that delivers location updates to the DCS server. Holds onto a wakelock
 * to ensure the actions are completed.
 * 
 */
public class LocationDeliverIntentService extends WakefulIntentService {

	private final static String TAG = LocationDeliverIntentService.class
			.getSimpleName();

	public LocationDeliverIntentService() {
		super(TAG);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * edu.rit.se.se561.trafficanalysis.util.WakefulIntentService#onHandleIntent
	 * (android.content.Intent)
	 */
	@Override
	protected void onHandleIntent(Intent intent) {
		try {
			deliverLocations();
		} finally {
			resetDeliveryAlarm();
			super.onHandleIntent(intent);
		}
	}

	/**
	 * Deliver locations to the DCS server.
	 * 
	 * @return - whether or not the delivery was successful or there were not
	 *         locations to send
	 */
	private void deliverLocations() {

		if (!Util.isNetworkConnected(this)) {
			Log.d(TAG, "Network not connected");
			return;
		}

		Log.i(TAG, "There is a network connection");

		int batchSize = getResources().getInteger(
				R.integer.locationDeliveryBatchSize);
		
		LocationDBOpenHelper db = new LocationDBOpenHelper(
				getApplicationContext());

		List<LocationUpdate> locations = db.getLocations(batchSize);

		while (locations.size() > 0) {
			Log.i(TAG, "There are records to send");

			ApiClient ac = new ApiClient(getApplicationContext());

			int numRiders = ac.locationUpdate(locations);
			Log.i(TAG, "Response from server:" + numRiders);

			if (numRiders < 0) { // delivery was not successful
				break;
			}
			// if we get here we can delete the locations
			db.deleteByTimeStamp(locations.get(locations.size() - 1).time);
			TimingController.setRiderCount(numRiders);

			locations = db.getLocations(batchSize);
		}
	}

	/**
	 * Register alarm if tour is not finished or there are still locations to be
	 * sent to the DCS server.
	 */
	private void resetDeliveryAlarm() {
		LocationDBOpenHelper db = new LocationDBOpenHelper(
				getApplicationContext());

		TourConfig config = new TourConfig(this);
		long curTime = System.currentTimeMillis();
		
		//if tour is not over, set delivery alarm
		if (!config.isTourOver()) {
			LocationDeliverAlarm.setAlarm(this,
					TimingController.getLocationDeliveryDelay(this));
		//else if there is still time to send locations, set delivery alarm
		} else if (config.getTourFinishTime()
				+ getResources().getInteger(R.integer.maxWaitSendLocsToDCSMs) > curTime
				&& db.getLocations(
						getResources().getInteger(
								R.integer.locationDeliveryBatchSize)).size() > 0) {
			
			LocationDeliverAlarm.setAlarm(this,
					TimingController.getLocationDeliveryDelay(this));
		}
	}

}
