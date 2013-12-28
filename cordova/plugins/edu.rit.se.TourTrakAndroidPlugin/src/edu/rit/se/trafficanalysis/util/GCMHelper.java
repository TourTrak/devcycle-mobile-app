package edu.rit.se.trafficanalysis.util;

import android.content.Context;

import com.google.android.gcm.GCMRegistrar;

import edu.rit.se.trafficanalysis.TourConfig;

public class GCMHelper {

	public static void registerPush(Context c) {
		TourConfig cfg = new TourConfig(c);
		if (!cfg.isRegistered() || cfg.getGcmSenderId() == null) {
			return;
		}
		GCMRegistrar.checkDevice(c);
		GCMRegistrar.checkManifest(c);
		String regId = GCMRegistrar.getRegistrationId(c);
		if (cfg.getGcmPushId() == null
				|| !regId.equals(cfg.getGcmPushId())) {
			GCMRegistrar.register(c, cfg.getGcmSenderId());
		}
	}
	
	public static void unregisterPush(Context c) {
		TourConfig cfg = new TourConfig(c);
		if (cfg.getGcmSenderId() != null) {
			return;
		}
		GCMRegistrar.unregister(c);
	}
	
}
