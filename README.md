# adverity-example

Instal doker and docker compose if not have to runthis example

## Clone this repository. `git clone`

## Build docker image
Go to `app-gateway` folder and run `./gradlew -Pdev bootJar jibDockerBuild`
Go to `app-microservice-loader` folder and run same command.

After images builded go to folder `docker-compose` and run `docker-compose up -d`

## App is running.
Now wait few minutes to run all images in docker. 

# Example description

This example is build with misroservice architecture, basick stack was generated with jHipster code generator. 
This architecture contains this components.
######Two basic component used in development
1. App gateway, `app-gateway` this is Spring boot application running as backend and Angular app as frontend. 
2. app microservise `app-microservice-loader` just for purpose of automatically download and process files. 
######Maintanance component used for microservice network organization. 
3. Elastick - user to store analitics data to show on application presentation layer. 
4. Eureka and configurations server with jhipster registry app - The JHipster Registry is a runtime application on which all applications registers and get their configuration from. It also provides runtime monitoring dashboards.
5. Monitoring & alerting console, based on the ELK stack
6. Zuul load balance on app gatway

### 1. Import file and process
Import file is done with Spring integration.

```java
    // this will run file download, first start with delay 15sec.
    @Scheduled(fixedDelay = 900000, initialDelay = 15000)
    public void scheduleFixedRateWithInitialDelayTask() {
      msg.getCsvFileMessage("Run flow: download csv file");
    }
    // this is dowlad file flow from URL.
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
