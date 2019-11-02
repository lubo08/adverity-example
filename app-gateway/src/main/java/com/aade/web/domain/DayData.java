package com.aade.web.domain;

import java.util.Date;

public class DayData {
	
	private Date day;
	
	private Double clicks;
	
	private Double impresions;
	
	public Date getDay() {
		return day;
	}

	public void setDay(Date day) {
		this.day = day;
	}

	public Double getImpresions() {
		return impresions;
	}

	public void setImpresions(Double impresions) {
		this.impresions = impresions;
	}

	public Double getClicks() {
		return clicks;
	}

	public void setClicks(Double clicks) {
		this.clicks = clicks;
	}
}
