package com.aade.loader.service;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Proxy.Type;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.launch.support.SimpleJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.integration.launch.JobLaunchingGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.integration.annotation.Gateway;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.dsl.IntegrationFlowBuilder;
import org.springframework.integration.dsl.IntegrationFlows;
import org.springframework.integration.dsl.MessageChannels;
import org.springframework.integration.dsl.StandardIntegrationFlow;
import org.springframework.integration.file.dsl.Files;
import org.springframework.integration.handler.LoggingHandler;
import org.springframework.integration.http.outbound.HttpRequestExecutingMessageHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseErrorHandler;

import com.aade.loader.batch.FileMessageToJobRequest;

/**
 * Download csv file from url and push into elastic search
 */
@Service
@Configuration
@EnableIntegration
public class FileDownloadSerevice {

	private final Logger log = LoggerFactory.getLogger(FileDownloadSerevice.class);
	
	@Value("${java.io.tmpdir}")
    private String tmpPath;
	
	@Autowired
	private MessageGateway msg;
	
	@Autowired
    private SimpleJobLauncher jobLauncher;
		
	@Bean
    public SimpleClientHttpRequestFactory proxy() {
        SimpleClientHttpRequestFactory proxy = new SimpleClientHttpRequestFactory();     
        return proxy;
    }
	
	@Autowired
    @Qualifier("loadCsv")
    private Job loadCsv;
	
	@Bean
    public HttpRequestExecutingMessageHandler httpOutboundGw() {
        HttpRequestExecutingMessageHandler httpHandler = new HttpRequestExecutingMessageHandler("http://adverity-challenge.s3-website-eu-west-1.amazonaws.com/DAMKBAoDBwoDBAkOBAYFCw.csv");
        httpHandler.setRequestFactory(proxy());
        httpHandler.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) throws IOException {
                return false;
            }
            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                log.error(response.getStatusText());                
            }            
        });
        httpHandler.setHttpMethod(HttpMethod.GET);
        httpHandler.setExpectedResponseType(byte[].class);      
        return httpHandler;
    }
	
	@Bean
    public DirectChannel httpRequestChannel() {
        return MessageChannels.direct().get();
    }
	
	@Bean 
    public DirectChannel processFileChannel() {
        return MessageChannels.direct().get();
    }
	
	@Bean 
    public JobLaunchingGateway jobLaunchingGateway() {
        JobLaunchingGateway gw = new JobLaunchingGateway(jobLauncher);
        return gw;
    }
	
	
	@Bean
	public FileMessageToJobRequest fileMessageToJobRequest() {
	    FileMessageToJobRequest fileMessageToJobRequest = new FileMessageToJobRequest();
	    fileMessageToJobRequest.setFileParameterName("filename");
	    fileMessageToJobRequest.setJob(loadCsv);
	    return fileMessageToJobRequest;
	}
	
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
	
	@Scheduled(fixedDelay = 900000, initialDelay = 15000)
	public void scheduleFixedRateWithInitialDelayTask() {
		msg.getCsvFileMessage("Run flow: download csv file");
	}
}
