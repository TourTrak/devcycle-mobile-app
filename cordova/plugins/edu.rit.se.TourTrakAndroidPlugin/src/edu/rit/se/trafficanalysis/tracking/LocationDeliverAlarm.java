package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.trafficanalysis.util.AlarmUtil;
import edu.rit.se.trafficanalysis.util.WakefulIntentService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Class receives broadcasts when locations
 * should be delivered to the DCS server.
 *
 */
public class LocationDeliverAlarm extends BroadcastReceiver {

	private final static String TAG = LocationDeliverAlarm.class
			.getSimpleName();
	
	/**
	 * Schedules an alarm that signifies that the currently
	 * stored locations should be sent to the DCS server.
	 * 
	 * @param context Application context.
	 */
	public static final String DELIVER_LOCATION_UPDATE_ACTION = "edu.rit.se.trafficanalysis.deliverLocationUpdate";

	public static void setAlarm(Context context, long delay) {
		AlarmUtil.setAlarm(context, DELIVER_LOCATION_UPDATE_ACTION,
				System.currentTimeMillis() + delay);
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, DELIVER_LOCATION_UPDATE_ACTION);
	}

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.i(TAG, "In deliver receiver.");
		WakefulIntentService.acquireStaticLock(context);
		context.startService(new Intent(context,
				LocationDeliverIntentService.class));
	}

}
