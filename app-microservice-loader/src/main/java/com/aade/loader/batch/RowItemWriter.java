package com.aade.loader.batch;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemWriter;

import com.aade.loader.domain.Row;
import com.aade.loader.repository.search.RowSearchRepository;

public class RowItemWriter implements ItemWriter<Row> {
	
	private final Logger log = LoggerFactory.getLogger(RowItemWriter.class);
	
	private RowSearchRepository elstickRepo;
	
	public RowItemWriter(RowSearchRepository elstickRepo) {
		this.elstickRepo = elstickRepo;
	}

	@Override
	public void write(List<? extends Row> items) throws Exception {
		elstickRepo.saveAll(items);
//		for (Row row : items) {
//			elstickRepo.save(row);
//		}
	}

}
