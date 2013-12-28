package edu.rit.se.trafficanalysis.util;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.BatteryManager;

/**
 * Miscellaneous utility functions.
 */
public class Util {
	/**
	 * Retrieves the device's battery level as a percent.
	 * 
	 * @param context
	 * @return
	 */
	public static float getBatteryPercent(Context context) {
		Intent batteryLevelIntent = context.registerReceiver(null,
				new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
		int level = batteryLevelIntent.getIntExtra(BatteryManager.EXTRA_LEVEL,
				-1);
		int scale = batteryLevelIntent.getIntExtra(BatteryManager.EXTRA_SCALE,
				-1);
		return level / (float) scale;
	}

	/**
	 * Determines whether the device has a network connection available.
	 * 
	 * @param context
	 * @return
	 */
	public static boolean isNetworkConnected(Context context) {
		final ConnectivityManager conMgr = (ConnectivityManager) context
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		final NetworkInfo activeNetwork = conMgr.getActiveNetworkInfo();
		return activeNetwork != null && activeNetwork.isConnected();
	}
	
	/**
	 * Determines whether either the gpd or network provider is enabled.
	 * 
	 * @param context
	 * @return
	 */
	public static boolean hasAnyLocationProvider(LocationManager locationManager) {
		return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) 
				|| locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
	}

}
