package edu.rit.se.trafficanalysis.reminders;

import edu.rit.se.tourtrak.R;
//import edu.rit.se.trafficanalysis.R;
import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.util.AlarmUtil;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Class that receives broadcasts for when the rider
 * should be reminded through the user of a notification
 * that the tour may have ended and that tracking
 * can be manually stopped.
 *
 */
public class TourFinishReminderAlarm extends BroadcastReceiver {

	private static final String RACE_FINISH_ACTION = "edu.rit.se.trafficanalysis.raceEndingAlarm";

	/**
	 * Schedules an alarm at specified percentage of the time between when the
	 * user starts riding and the official end of the tour.
	 * 
	 * @param context Application context.
	 */
	public static void setAlarm(Context context) {
		TourConfig appPrefs = new TourConfig(context);

		long riderStartOffset = appPrefs.getRiderStartTime()
				- appPrefs.getTourStartTime();
		long tourLength = appPrefs.getTourMaxTime() - riderStartOffset;

		double endNotificationPercent = context.getResources().getInteger(R.integer.endRaceNotifAtPercent) / 100.0;
		long time = (long) (appPrefs.getRiderStartTime() + tourLength
				* endNotificationPercent);

		AlarmUtil.setAlarm(context, RACE_FINISH_ACTION, time);
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, RACE_FINISH_ACTION);
	}

	@Override
	public void onReceive(Context context, Intent intent) {
//		NotificationHelper.showRaceFinishedNotification(context);
	}
}
