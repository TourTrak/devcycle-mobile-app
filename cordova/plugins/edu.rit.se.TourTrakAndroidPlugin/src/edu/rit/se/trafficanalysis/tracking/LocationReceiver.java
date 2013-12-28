package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.util.Log;

/**
 * Class that receives broadcasts when locations
 * are retrieved from the Location Manager.
 *
 */
public class LocationReceiver extends BroadcastReceiver {

	private final static String TAG = LocationReceiver.class.getSimpleName();

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.i(TAG, "In Location receiver with intent " + intent.getAction());

		if (intent.hasExtra(LocationManager.KEY_LOCATION_CHANGED)) {
			WakefulIntentService.acquireStaticLock(context);
			Location loc = (Location) intent.getExtras().get(
					LocationManager.KEY_LOCATION_CHANGED);
			Intent i = new Intent(context, LocationSaveIntentService.class);
			i.putExtra(LocationSaveIntentService.EXTRA_LOCATION, loc);
			context.startService(i);
		}
	}

}
