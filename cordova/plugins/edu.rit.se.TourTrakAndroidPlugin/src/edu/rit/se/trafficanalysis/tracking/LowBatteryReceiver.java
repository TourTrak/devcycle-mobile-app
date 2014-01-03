package edu.rit.se.trafficanalysis.tracking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;

public class LowBatteryReceiver extends BroadcastReceiver {

	private final static String TAG = LowBatteryReceiver.class
			.getSimpleName();
	public static final String ACTION_BATTERY_WATCHDOG_BASELINE = "edu.rit.se.trafficanalysis.batteryWatchdog";

	@Override
	public void onReceive(Context context, Intent i) {
		Log.i(TAG, "In battery watchdog receiver.");

		if (Intent.ACTION_BATTERY_LOW.equals(i.getAction())) {
			TrackingService.pauseTracking(context);
//			NotificationHelper.showTrackingStopForBattery(context);
		}
	}

}
