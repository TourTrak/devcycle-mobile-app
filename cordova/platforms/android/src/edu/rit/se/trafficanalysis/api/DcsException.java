package edu.rit.se.trafficanalysis.api;

/**
 * Exception used to represent errors thrown by the DCS.
 * 
 */
public class DcsException extends Exception {

	private static final long serialVersionUID = 1L;

	public DcsException() {
		super();
	}

	public DcsException(String message) {
		super(message);
	}

	public DcsException(String detailMessage, Throwable throwable) {
		super(detailMessage, throwable);
	}

	public DcsException(Throwable throwable) {
		super(throwable);
	}

}
