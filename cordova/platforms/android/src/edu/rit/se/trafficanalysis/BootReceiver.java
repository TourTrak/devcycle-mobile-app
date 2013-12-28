package edu.rit.se.trafficanalysis;

import edu.rit.se.trafficanalysis.api.UpdateTourConfigService;
import edu.rit.se.trafficanalysis.util.AlarmUtil;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Receives the boot event on device startup in order to re-register all
 * relevant alarms.
 * 
 */
public class BootReceiver extends BroadcastReceiver {

	private static final String BOOT_ACTION = "android.intent.action.BOOT_COMPLETED";

	@Override
	public void onReceive(Context context, Intent intent) {
		if (BOOT_ACTION.equals(intent.getAction())) {

			long curTime = System.currentTimeMillis();
			TourConfig rc = new TourConfig(context);
			/*
			 * Only register alarms or show notifications if the rider is
			 * registered for the configured tour
			 */
			if (rc.isRegistered() && !rc.isTourOver()) {

				// show notification that the tour is currently happening
				if (curTime > rc.getRiderStartTime()) {
//					NotificationHelper.showRaceOngoingNotification(context);
				}
				
				AlarmUtil.registerInitialRiderAlarms(context);
				
				// If the race times changed, ask to user to change their times.
				if (rc.needsUpdatedTimes()) {
//					NotificationHelper.showTourTimesChanged(context);
				}
				
				// Check for new tour config.
				context.startService(new Intent(context, UpdateTourConfigService.class));
			}
			
		}

	}

}
