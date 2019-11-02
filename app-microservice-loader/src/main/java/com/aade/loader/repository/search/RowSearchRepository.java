package com.aade.loader.repository.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.aade.loader.domain.Row;

public interface RowSearchRepository extends ElasticsearchRepository<Row, String> {

}
