package edu.rit.se.trafficanalysis.tracking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.util.AlarmUtil;

/**
 * Class receives broadcasts for when the tracking
 * service should be stopped if it is running.
 *
 */
public class EndTrackingAlarm extends BroadcastReceiver {

	private static final String END_TRACKING_ACTION = "edu.rit.se.se561.trafficanalysis.endTracking";

	/**
	 * Schedules an alarm that signifies that the tour
	 * is over and tracking should be stopped.
	 * 
	 * @param context Application context.
	 */
	public static void setAlarm(Context context) {
		TourConfig appPrefs = new TourConfig(context);
		AlarmUtil.setAlarm(context, END_TRACKING_ACTION,
				appPrefs.getTourFinishTime());
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, END_TRACKING_ACTION);
	}

	@Override
	public void onReceive(Context context, Intent intent) {
		TrackingService.pauseTracking(context);
		context.stopService(new Intent(context, TrackingService.class));
	}
}
