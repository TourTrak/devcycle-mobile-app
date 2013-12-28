package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.tourtrak.R;
//import edu.rit.se.se561.trafficanalysis.R;
//import edu.rit.se.se561.trafficanalysis.util.NotificationHelper;
import edu.rit.se.trafficanalysis.util.DateUtil;
import edu.rit.se.trafficanalysis.util.Util;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.preference.PreferenceManager;
import android.util.Log;

/**
 * Class that holds the current timing values that represent when to request
 * location updates and when to send them to the DCS server.
 * 
 * Values are adjusted based on number of riders and battery usage. Each
 * controls a multiplier for the location requesting time interval.
 */
public class TimingController {
	private final static String TAG = TimingController.class.getSimpleName();

	/**
	 * Algorithm configuration parameters
	 */
	private static boolean mInitConfig = false;
	private static long mInitialLocationDeliveryDelay = -1;
	private static long mInitialLocationRequestDelay = -1;
	private static float mMaxBatteryUsePerHour = -1;
	private static float mMaxGlobalTimingMultiplier = -1;
	private static float mMaxBatteryTimingMultiplier = -1;
	private static float mMinBatteryTimingMultiplier = -1;

	/**
	 * Timing Multipliers
	 */
	private static double mRiderMultiplier = 1.0;
	private static double mBatteryMultiplier = 1.0;

	/**
	 * Current state.
	 */
	private static float mLastBatteryPercent = -1;
	private static long mLastBatteryPercentTime = -1;
	private static int mNumPercentChanges = 0;
	private static boolean mLowBatteryShown = false;
	
	public static long getLocationDeliveryDelay(Context c) {
		if (!mInitConfig) {
			initConfig(c);
		}
		return mInitialLocationDeliveryDelay;
	}

	public static long getLocationRequestDelay(Context c) {
		if (!mInitConfig) {
			initConfig(c);
		}
		double multiplier = mRiderMultiplier * mBatteryMultiplier;
		if (multiplier > mMaxGlobalTimingMultiplier) {
			multiplier = mMaxGlobalTimingMultiplier;
		}
		return (long) (mInitialLocationRequestDelay * multiplier);
	}
	
	/**
	 * Check the battery next time we start tracking.
	 */
	public static void resetBatteryAlarm() {
		mLowBatteryShown = false;
	}
	
	/**
	 * Based on the current battery level, should we track the user?
	 * @param c
	 * @param batteryPercent
	 * @return
	 */
	public static boolean shouldTrack(Context c, Float batteryPercent) {
		SharedPreferences prefs = PreferenceManager
				.getDefaultSharedPreferences(c);
		double minBatteryPercent = Math.max(
				prefs.getInt("low_battery_percent", 30), 15);
		if (batteryPercent == null) {
			batteryPercent = Util.getBatteryPercent(c);
		}
		return batteryPercent > (minBatteryPercent / 100);
	}

	/**
	 * Recalculate the battery multiplier based on the current drainage rate.
	 * @param c
	 */
	public static void recalculateBatteryUsage(Context c) {
		if (!mInitConfig) {
			initConfig(c);
		}
		float batteryPercent = Util.getBatteryPercent(c);
		Log.i(TAG, "Battery: " + batteryPercent);
		if (!mLowBatteryShown && !shouldTrack(c, batteryPercent)) {
			// Battery is below minimum.
			TrackingService.pauseTracking(c);
//			NotificationHelper.showTrackingStopForBattery(c);
			mBatteryMultiplier = 1;
			mLowBatteryShown = true;
		} else if (mLastBatteryPercent == -1) {
			// Initialization - set the values when we first start tracking
			mLastBatteryPercent = batteryPercent;
			mLastBatteryPercentTime = System.currentTimeMillis();
		} else if (batteryPercent != mLastBatteryPercent) {
			// Battery percentage changed.
			float db = batteryPercent - mLastBatteryPercent;
			mNumPercentChanges++;
			if (db > 0) {
				// Battery is charging.
				mBatteryMultiplier = 1;
			} else if (mNumPercentChanges >= 2) {
				// We need 2 updates since the first update will likely be fractional
				// Ex: First update 95%, actually 94.1%, next update 94%. We would be 0.9% off.
				long dt = System.currentTimeMillis() - mLastBatteryPercentTime;
				double hours = dt / (DateUtil.HOUR * 1000.0);
				// At this rate, how much battery will be use din an hour
				double batteryPerHour = db / hours;
				Log.i(TAG, "Battery Per Hour: " + batteryPerHour);
				// Attempt to hit our target battery usage
				mBatteryMultiplier *= (batteryPerHour / mMaxBatteryUsePerHour);
				if (mBatteryMultiplier < mMinBatteryTimingMultiplier) {
					// If it looks like we are using too little, be cautious and
					// increase how often be update location slowly.
					mBatteryMultiplier = mMinBatteryTimingMultiplier;
				} else if (mBatteryMultiplier > mMaxBatteryTimingMultiplier) {
					// We also want to get a decent amount of data
					mBatteryMultiplier = mMaxBatteryTimingMultiplier;
				}
				Log.i(TAG, "New Battery Multiplier: " + mBatteryMultiplier);
			}
			mLastBatteryPercent = batteryPercent;
			mLastBatteryPercentTime = System.currentTimeMillis();
		}
	}

	/**
	 * Recalculate the multipliers based on the current number of riders.
	 * @param riderCount
	 */
	public static void setRiderCount(int riderCount) {
		if (riderCount <= 30) {
			mRiderMultiplier = 1;
		} else if (riderCount <= 230) {
			mRiderMultiplier = 1 + ((riderCount - 30) / 50.0);
		} else {
			mRiderMultiplier = 6 + ((riderCount - 230) / 100.0);
		}
		Log.i(TAG, "New Rider Multiplier: " + mRiderMultiplier);
	}
	
	private static void initConfig(Context c) {
		Resources r = c.getResources();
		mInitialLocationDeliveryDelay = (long) r.getInteger(
				R.integer.locationDeliveryDelayMs);
		mInitialLocationRequestDelay = (long) r.getInteger(
				R.integer.locationRequestDelayMs);
		mMaxBatteryUsePerHour = r.getInteger(
				R.integer.maxBatteryUsePerHourPct) / 100f;
		mMaxGlobalTimingMultiplier = r.getInteger(
				R.integer.maxGlobalTimingMultiplier100) / 100f;
		mMaxBatteryTimingMultiplier = r.getInteger(
				R.integer.maxBatteryTimingMultiplier100) / 100f;
		mMinBatteryTimingMultiplier = r.getInteger(
				R.integer.minBatteryTimingMultiplier100) / 100f;
	}
}
