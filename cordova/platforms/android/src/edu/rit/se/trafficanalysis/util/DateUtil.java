package edu.rit.se.trafficanalysis.util;

public class DateUtil {
	
	public static final long SECOND = 1;
	public static final long MINUTE = 60 * SECOND;
	public static final long HOUR = 60 * MINUTE;
	public static final long DAY = 24 * HOUR;
	
	
	public static String getTimeDifferenceStr(long timeDifference) {
		StringBuilder text = new StringBuilder();
		
		long seconds = timeDifference / 1000;
		
		long days = seconds / DAY;
		if (days > 0) {
			text.append(days + "d ");
		}
		seconds %= DAY;
		
		long hours = seconds / HOUR;
		if (hours > 0) {
			text.append(hours + "h ");
		}
		seconds %= HOUR;
		
		long minutes = seconds / MINUTE;
		if (minutes > 0) {
			text.append(minutes + "m ");
		}
		seconds %= MINUTE;
		
		if (days == 0 && hours == 0) {
			text.append(seconds + "s");
		}
		
		return text.toString();
	}

}
