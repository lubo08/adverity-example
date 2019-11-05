# adverity-example

Instal docker and docker compose if not have to run this example

## Clone this repository. `git clone`

## Build docker image
Go to `app-gateway` folder and run `./gradlew -Pdev bootJar jibDockerBuild`
Go to `app-microservice-loader` folder and run same command.

After images builded go to folder `docker-compose` and run `docker-compose up -d`

Description how is this stack generated and what is running see in my blog on linkedin. 
[Microservices in 10 minutes](https://www.linkedin.com/pulse/microservices-java-jhipster-10-minutes-lubomir-sobinovsky/)

## App is running.
Now wait few minutes to run all images in docker. 

# Example description

This example is build as microservice architecture, basic stack was generated with jHipster code generator. 
This architecture contains this components.
###### Two basic component used in development
1. App gateway, `app-gateway` this is Spring boot application running as backend and Angular app as frontend. 
2. app microservise `app-microservice-loader` just for purpose of automatically download and process files. 
###### Maintenance component used for microservice network organization. 
3. Elastic - user to store analytics data to show on application presentation layer. 
4. Eureka and configurations server with jhipster registry app - The JHipster Registry is a runtime application on which all applications registers and get their configuration from. It also provides runtime monitoring dashboards.
5. Monitoring & alerting console, based on the ELK stack
6. Zuul load balance on app gateway

### 1. Import file and process
Import file is done with Spring integration.

```java
// this will run file download, first start with delay 15sec.
@Scheduled(fixedDelay = 900000, initialDelay = 15000)
public void scheduleFixedRateWithInitialDelayTask() {
	msg.getCsvFileMessage("Run flow: download csv file");
}
// this is downlad file flow from URL.
@Bean
public IntegrationFlow getCsvFile() {
	return IntegrationFlows.from(httpRequestChannel())
		.handle(httpOutboundGw())
		.handle(Files.outboundGateway(new File(tmpPath)))
		// .handle(processFileChannel())
		.log(LoggingHandler.Level.DEBUG, "TEST_LOGGER",
	m -> m.getHeaders().getId() + ": " + m.getPayload())
		.handle(fileMessageToJobRequest())
		.handle(jobLaunchingGateway())
		.get();
}
```
File is processed with spring integration batch, and load data to elasticksearch in 5000 rows chunk. Should take les then second.

```java
@Bean
protected Step stepLoadCsv() {
return steps.get("stepLoadCsv").chunk(5000)
		.reader(cvsFileItemReader(null, null))
	.writer((ItemWriter) rowWriter())
	.build();
}
```
### 2. load data from elasticsearch on backend
This is done with spring boot and spring elasticsearch data repository.
This query aggregate datasources for selection list.
```java
@GetMapping("/_search/datasources")
public List<String> searchDataSources() {
	SearchQuery searchQuery = new NativeSearchQueryBuilder()
	    .withIndices("data")             
	    .addAggregation(AggregationBuilders.terms("uniq_datasource").size(100).field("datasource.keyword"))
	    .build();

	MetricAggregation aggregations = elasticsearchTemplate.query(searchQuery, 
		new JestResultsExtractor<MetricAggregation>() {
					@Override
					public MetricAggregation extract(SearchResult response) {
						return response.getAggregations();
					}
	});
	List<String> datasources = new ArrayList<String>();
	for (Entry bucket: aggregations.getTermsAggregation("uniq_datasource").getBuckets()) {
		datasources.add(bucket.getKey());
	}

	return datasources;
}

```
This query aggregate campaigns for selection list
```java
@GetMapping("/_search/campaigns")
public List<String> searchCampaigns() {
	SearchQuery searchQuery = new NativeSearchQueryBuilder()
	    .withIndices("data")             
	    .addAggregation(AggregationBuilders.terms("uniq_campaigns").size(100).field("campaign.keyword"))
	    .build();

	MetricAggregation aggregations = elasticsearchTemplate.query(searchQuery, 
		new JestResultsExtractor<MetricAggregation>() {
					@Override
					public MetricAggregation extract(SearchResult response) {
						return response.getAggregations();
					}
	});
	List<String> campaigns = new ArrayList<String>();
	for (Entry bucket: aggregations.getTermsAggregation("uniq_campaigns").getBuckets()) {
		campaigns.add(bucket.getKey());
	}

	return campaigns;
}
```
This is query to load data into graph.js all or based on list of fatasources and campaigns
```java
@GetMapping("/_search/datagram/{query}")
public List<DayData> searchDatagram(@PathVariable String query) throws ParseException {

SearchQuery searchQuery = new NativeSearchQueryBuilder()
	    .withIndices("data")
	    .withQuery(queryStringQuery(query))
	    .addAggregation(
			AggregationBuilders
			.dateHistogram("per_day").field("date").dateHistogramInterval(DateHistogramInterval.DAY)
			.subAggregation(AggregationBuilders.sum("clicks").field("clicks"))
			.subAggregation(AggregationBuilders.sum("impressions").field("impressions"))
			)
	    .build();

	MetricAggregation aggregations = elasticsearchTemplate.query(searchQuery, 
		new JestResultsExtractor<MetricAggregation>() {
					@Override
					public MetricAggregation extract(SearchResult response) {
						return response.getAggregations();
					}
	});
	List<DayData> data = new ArrayList<DayData>();
	for (DateHistogram bucket: aggregations.getDateHistogramAggregation("per_day").getBuckets()) {
		DayData row = new DayData();
		row.setDay(new SimpleDateFormat("yyyy-MM-dd").parse(bucket.getTimeAsString()));
		row.setClicks(bucket.getSumAggregation("clicks").getSum());
		row.setImpresions(bucket.getSumAggregation("impressions").getSum());
		data.add(row);
	}
	return data;

}
```

![Frontend](https://github.com/lubo08/adverity-example/blob/master/example1.png)

