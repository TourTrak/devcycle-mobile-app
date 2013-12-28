package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.tourtrak.R;
//import edu.rit.se.se561.trafficanalysis.R;
import edu.rit.se.trafficanalysis.api.Messages.LocationUpdate;
import edu.rit.se.trafficanalysis.util.Util;
import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.util.Log;

/**
 * Class saves a location based on the accuracy of locations and availability of
 * location providers.
 * 
 */
public class LocationSaveIntentService extends WakefulIntentService {

	private static String TAG = LocationSaveIntentService.class.getSimpleName();

	public static final String EXTRA_LOCATION = "location";

	private static int curGpsRequests = 0;

	public LocationSaveIntentService() {
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
			Location location = (Location) intent.getExtras().get(
					EXTRA_LOCATION);
			Log.i(TAG, "LOCATION PROVIDED FROM: " + location.getProvider());

			String provider = location.getProvider();
			if (provider.equals(LocationManager.PASSIVE_PROVIDER)) {
				handlePassiveLocation(location);
			} else if (provider.equals(LocationManager.NETWORK_PROVIDER)) {
				handleNetworkLocation(location);
			} else if (provider.equals(LocationManager.GPS_PROVIDER)) {
				handleGPSLocation(location);
			} else {
				Log.i(TAG, "No Provider.");
			}
		} finally {
			super.onHandleIntent(intent);
		}

	}

	private void handlePassiveLocation(Location location) {
		if (location.hasAccuracy()
				&& location.getAccuracy() <= getResources().getInteger(
						R.integer.minAccuracyMeters)) {
			saveLocation(location);
		}
	}

	private void handleNetworkLocation(Location location) {
		LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

		// is the location provided accurate enough
		if ((location.hasAccuracy() && !(location.getAccuracy() <= getResources()
				.getInteger(R.integer.minAccuracyMeters)))
				|| !location.hasAccuracy()) {
			// is the GPS being responsive
			if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
					&& curGpsRequests < getResources().getInteger(
							R.integer.maxNumOfGPSRequests)) {

				// try to get a location from the GPS for better accuracy

				Log.i(TAG, "Defaulting to GPS.");
				curGpsRequests++;

				Intent i = new Intent(getApplicationContext(),
						LocationReceiver.class);
				i.setAction(LocationManager.KEY_LOCATION_CHANGED);
				PendingIntent pi = PendingIntent.getBroadcast(this, 0, i, 0);

				locationManager.requestSingleUpdate(
						LocationManager.GPS_PROVIDER, pi);
			}
		}
		//always save location regardless of accuracy
		saveLocation(location);
	}

	private void handleGPSLocation(Location location) {
		curGpsRequests = 0;
		saveLocation(location);
	}

	private void saveLocation(Location loc) {
		float batteryPercent = Util.getBatteryPercent(this);
		LocationDBOpenHelper db = new LocationDBOpenHelper(
				getApplicationContext());
		Log.i(TAG,
				"Saved Location: "
						+ db.insertLocation(new LocationUpdate(loc,
								batteryPercent)));
	}

}
