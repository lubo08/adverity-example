package com.aade.web.repository.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.aade.web.domain.Row;


public interface RowSearchRepository extends ElasticsearchRepository<Row, String> {
	
}
