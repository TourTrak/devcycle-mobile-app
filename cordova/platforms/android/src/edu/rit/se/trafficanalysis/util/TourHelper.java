package edu.rit.se.trafficanalysis.util;

import android.content.Context;
import android.content.Intent;
import edu.rit.se.trafficanalysis.tracking.TrackingService;

public class TourHelper {
	public static void unregisterRider(Context c) {
//		NotificationHelper.hideAllNotifications(c);
		AlarmUtil.unregisterInitialRiderAlarms(c);
		GCMHelper.unregisterPush(c);
		c.stopService(new Intent(c, TrackingService.class));
	}
}
