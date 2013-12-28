package edu.rit.se.trafficanalysis.util;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;

/**
 * Service base class used to ensure that events occurring while the device is
 * asleep are not killed. The service keeps a wake lock until the actions are
 * complete. Any services launched from receivers which could fire when the
 * device is asleep should extend this class.
 */
public class WakefulIntentService extends IntentService {
	public static final String LOCK_NAME_STATIC = "static";
	public static final String LOCK_NAME_LOCAL = "local";
	private static PowerManager.WakeLock lockStatic = null;
	private PowerManager.WakeLock lockLocal = null;

	public WakefulIntentService(String name) {
		super(name);
	}

	public static void acquireStaticLock(Context context) {
		getLock(context).acquire();
	}

	synchronized private static PowerManager.WakeLock getLock(Context context) {
		if (lockStatic == null) {
			PowerManager mgr = (PowerManager) context
					.getSystemService(Context.POWER_SERVICE);
			lockStatic = mgr.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
					LOCK_NAME_STATIC);
			lockStatic.setReferenceCounted(true);
		}
		return (lockStatic);
	}

	@Override
	public void onCreate() {
		super.onCreate();
		PowerManager mgr = (PowerManager) getSystemService(Context.POWER_SERVICE);
		lockLocal = mgr.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
				LOCK_NAME_LOCAL);
		lockLocal.setReferenceCounted(true);
	}

	@Override
	public void onStart(Intent intent, final int startId) {
		try {
			lockLocal.acquire();
			super.onStart(intent, startId);
		} finally {
			getLock(this).release();
		}
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		lockLocal.release();
	}
}
