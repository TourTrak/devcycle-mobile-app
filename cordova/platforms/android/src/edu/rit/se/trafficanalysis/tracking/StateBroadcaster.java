package edu.rit.se.trafficanalysis.tracking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.util.Log;

/**
 * Used to broadcast the state of the tour/tracking to consumers.
 * 
 */
public class StateBroadcaster {
	public static final String TAG = StateBroadcaster.class.getSimpleName();

	public static final String ACTION_STATE_UPDATE = StateBroadcaster.class
			.getName() + "$StateUpdate";
	public static final String ACTION_LOCATION_UPDATE = StateBroadcaster.class
			.getName() + "$LocationUpdate";

	public static final String EXTRA_STATE = "state";
	public static final String EXTRA_LOCATION = "location";

	public static final int STATE_BEFORE_TRACKING = 2;
	public static final int STATE_TRACKING_STARTED = 3;
	public static final int STATE_TRACKING_PAUSED = 4;
	public static final int STATE_TOUR_FINISHED = 5;

	private Context mContext;

	public StateBroadcaster(Context c) {
		mContext = c;
	}

	public void beforeTracking() {
		updateState(STATE_BEFORE_TRACKING);
	}

	public void trackingStarted() {
		updateState(STATE_TRACKING_STARTED);
	}

	public void trackingPaused() {
		updateState(STATE_TRACKING_PAUSED);
	}

	public void afterTour() {
		updateState(STATE_TOUR_FINISHED);
	}

	public void locationUpdate(Location l) {
		Intent i = new Intent(ACTION_LOCATION_UPDATE);
		i.putExtra(EXTRA_LOCATION, l);
		mContext.sendStickyBroadcast(i);
	}

	private void updateState(int state) {
		Intent i = new Intent(ACTION_STATE_UPDATE);
		i.putExtra(EXTRA_STATE, state);
		mContext.sendStickyBroadcast(i);
	}

	public static class StateReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context c, Intent i) {
			if (i == null) {
				// If the service hasn't been started yet it is before tracking.
				onBeforeTracking();
				return;
			}
			String action = i.getAction();
			if (action == null) {
				Log.w(TAG, "Received null action");
				return;
			} else if (action.equals(ACTION_LOCATION_UPDATE)) {
				Location location = (Location) i
						.getParcelableExtra(EXTRA_LOCATION);
				Log.i(TAG, "Received Location: " + location);
				onLocationUpdate(location);
			} else if (action.equals(ACTION_STATE_UPDATE)) {
				int state = i.getIntExtra(EXTRA_STATE, -1);
				Log.i(TAG, "Received State: " + state);
				switch (state) {
				case STATE_BEFORE_TRACKING:
					onBeforeTracking();
					break;
				case STATE_TRACKING_STARTED:
					onTrackingStarted();
					break;
				case STATE_TRACKING_PAUSED:
					onTrackingPaused();
					break;
				case STATE_TOUR_FINISHED:
					onTourFinished();
					break;
				default:
					Log.w(TAG, "Received unknown state: " + state);
				}
			} else {
				Log.w(TAG, "Received unknown action: " + action);
			}
		}

		public void onLocationUpdate(Location l) {
		}
		
		public void onBeforeTracking() {
		}

		public void onTrackingStarted() {
		}

		public void onTrackingPaused() {
		}

		public void onTourFinished() {
		}

	}
}
