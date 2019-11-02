package com.aade.web.domain;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.FieldType;

@org.springframework.data.elasticsearch.annotations.Document(indexName = "data")
public class Row {

	@Id
    @org.springframework.data.elasticsearch.annotations.Field(type = FieldType.Keyword)
    private String id;
	
	private Date date;
	private String datasource;
	private String campaign;
	private Integer Clicks;
	private Integer Impressions;
	
	public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getDatasource() {
		return datasource;
	}
	public void setDatasource(String datasource) {
		this.datasource = datasource;
	}
	public String getCampaign() {
		return campaign;
	}
	public void setCampaign(String campaign) {
		this.campaign = campaign;
	}
	public Integer getClicks() {
		return Clicks;
	}
	public void setClicks(Integer clicks) {
		Clicks = clicks;
	}
	public Integer getImpressions() {
		return Impressions;
	}
	public void setImpressions(Integer impressions) {
		Impressions = impressions;
	}
	
}
