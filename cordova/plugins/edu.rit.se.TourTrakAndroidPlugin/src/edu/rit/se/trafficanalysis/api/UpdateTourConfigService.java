package edu.rit.se.trafficanalysis.api;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.TourConfig.TourConfigData;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;
import edu.rit.se.trafficanalysis.tracking.StateBroadcaster;
import edu.rit.se.trafficanalysis.tracking.TrackingService;
import edu.rit.se.trafficanalysis.util.AlarmUtil;

/**
 * Intent service used to update a rider's tour configuration.
 * 
 */
public class UpdateTourConfigService extends IntentService {
	private final static String TAG = UpdateTourConfigService.class
			.getSimpleName();

	public static final String BROADCAST_UPDATED_EVENT = UpdateTourConfigService.class
			.getName() + ".Updated";

	public UpdateTourConfigService() {
		super(TAG);
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		TourConfig cfg = new TourConfig(this);
		TourConfigData newConfig = new ApiClient(this).getConfig(
				cfg.getServerUrl(), cfg.getTourId());
		updateConfig(this, cfg, newConfig);
		LocalBroadcastManager.getInstance(this).sendBroadcast(
				new Intent(BROADCAST_UPDATED_EVENT));
	}

	public static void updateConfig(Context c, TourConfig cfg,
			TourConfigData newConfig) {
		if (newConfig != null && cfg.getTourId().equals(newConfig.tour_id)) {
			cfg.setNewTourConfig(newConfig);

			if (cfg.isTourCancelled()) {
				AlarmUtil.unregisterInitialRiderAlarms(c);
				c.stopService(new Intent(c, TrackingService.class));
//				NotificationHelper.showTourCancelled(c);
				new StateBroadcaster(c).afterTour();
			} else if (cfg.needsUpdatedTimes()) {
				// Reset the alarms based on new configuration
				AlarmUtil.unregisterInitialRiderAlarms(c);
				AlarmUtil.registerInitialRiderAlarms(c);
				// Alert the user that they must update their start time.
//				NotificationHelper.showTourTimesChanged(c);
				// Reset the current state.
				if (!cfg.isTourOver()) {
					new StateBroadcaster(c).beforeTracking();
				}
			}
		}
	}

}
