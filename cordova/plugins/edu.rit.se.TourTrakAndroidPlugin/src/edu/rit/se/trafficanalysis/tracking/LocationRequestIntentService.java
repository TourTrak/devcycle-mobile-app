package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;
import android.util.Log;

/**
 * Requests a location from the location manager
 * based on what provides area available.
 *
 */
public class LocationRequestIntentService extends WakefulIntentService {

	private final static String TAG = LocationRequestIntentService.class
			.getSimpleName();

	public LocationRequestIntentService() {
		super(TAG);
	}

	/*
	 * (non-Javadoc)
	 * @see edu.rit.se.se561.trafficanalysis.util.WakefulIntentService#onHandleIntent(android.content.Intent)
	 */
	@Override
	protected void onHandleIntent(Intent intent) {
		try {
			TimingController.recalculateBatteryUsage(this);
			
			LocationRequestAlarm.setAlarm(this,
					TimingController.getLocationRequestDelay(this));

			LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

			Intent i = new Intent(LocationManager.KEY_LOCATION_CHANGED);
			PendingIntent pi = PendingIntent.getBroadcast(this, 0, i, 0);

			if (locationManager
					.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
				locationManager.requestSingleUpdate(
						LocationManager.NETWORK_PROVIDER, pi);
				Log.i(TAG, "Requesting Location: Network");
			} else if (locationManager
					.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
				locationManager.requestSingleUpdate(
						LocationManager.GPS_PROVIDER, pi);
				Log.i(TAG, "Requesting Location: GPS");
			} else {
			}
		} finally {
			super.onHandleIntent(intent);
		}
	}

}
