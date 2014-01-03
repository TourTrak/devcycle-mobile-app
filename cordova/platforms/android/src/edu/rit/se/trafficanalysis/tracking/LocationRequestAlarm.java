package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.trafficanalysis.util.AlarmUtil;
import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Class receives broadcasts when it is time
 * to request a new location from the device.
 *
 */
public class LocationRequestAlarm extends BroadcastReceiver {
	private final static String TAG = LocationRequestAlarm.class
			.getSimpleName();
	
	public static final String REQUEST_LOCATION_UPDATE_ACTION = "edu.rit.se.trafficanalysis.requestLocationUpdate";
	
	/**
	 * Set an alarm that signifies when to request a
	 * new location.
	 * 
	 * @param context - The Application Context.
	 * @param delay - when the alarm should be set based on the current time.
	 */
	public static void setAlarm(Context context, long delay) {
		AlarmUtil.setAlarm(context, REQUEST_LOCATION_UPDATE_ACTION, 
				System.currentTimeMillis() + delay);
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, REQUEST_LOCATION_UPDATE_ACTION);
	}

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.i(TAG, "onReceive");
		WakefulIntentService.acquireStaticLock(context);
		context.startService(new Intent(context,
				LocationRequestIntentService.class));
	}

}
