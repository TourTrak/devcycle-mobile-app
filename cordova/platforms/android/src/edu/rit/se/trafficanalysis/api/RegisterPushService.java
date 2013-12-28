package edu.rit.se.trafficanalysis.api;

import android.app.IntentService;
import android.content.Intent;
import edu.rit.se.trafficanalysis.TourConfig;

/**
 * Intent service used to send the rider's GCM id to the DCS.
 *
 */
public class RegisterPushService extends IntentService {
	private final static String TAG = RegisterPushService.class.getSimpleName();

	public static final String KEY_REGISTRATION_ID = "regId";

	public RegisterPushService() {
		super(TAG);
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		String registrationId = intent.getStringExtra(KEY_REGISTRATION_ID);
		boolean success = new ApiClient(this).registerPushId(registrationId);
		if (success) {
			new TourConfig(this).setGcmPushId(registrationId);
		}
	}

}
