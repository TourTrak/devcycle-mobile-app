package edu.rit.se.trafficanalysis.reminders;

import edu.rit.se.tourtrak.R;
//import edu.rit.se.se561.trafficanalysis.R;
import edu.rit.se.trafficanalysis.TourConfig;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;
import edu.rit.se.trafficanalysis.util.AlarmUtil;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;

/**
 * Class that receives a broadcast when the the race reminder notification
 * should be sent to the rider.
 * 
 */
public class TourReminderAlarm extends BroadcastReceiver {
	private static final String RACE_REMINDER_ACTION = "edu.rit.se.trafficanalysis.remindRace";

	/**
	 * Schedules an alarm to send a notification to the participant that the
	 * tour is starting soon.
	 * 
	 * @param context
	 *            Application context.
	 */
	public static void setAlarm(Context context) {
		TourConfig appPrefs = new TourConfig(context);
		long time = appPrefs.getRiderStartTime()
				- context.getResources().getInteger(
						R.integer.tourReminderNotifDelayMs);
		AlarmUtil.setAlarm(context, RACE_REMINDER_ACTION, time);
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, RACE_REMINDER_ACTION);
	}

	@Override
	public void onReceive(Context context, Intent intent) {
		TourConfig tourConfig = new TourConfig(context);

		LocationManager locationManager = (LocationManager) context
				.getSystemService(Context.LOCATION_SERVICE);
//		NotificationHelper.showRaceReminderNotification(context,
//				Util.hasAnyLocationProvider(locationManager),
//				tourConfig.isAutomaticTrackEnabled());
		tourConfig.setTourReminderShown();
	}

}
