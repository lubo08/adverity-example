package com.aade.loader.service;

import java.util.concurrent.Future;

import org.springframework.integration.annotation.Gateway;
import org.springframework.integration.annotation.MessagingGateway;

@MessagingGateway
public interface MessageGateway {

	@Gateway(requestChannel = "httpRequestChannel")
	Future<Integer> getCsvFileMessage(String payload);

}
