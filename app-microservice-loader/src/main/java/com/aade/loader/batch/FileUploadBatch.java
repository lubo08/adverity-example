package com.aade.loader.batch;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.UUID;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.SimpleJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.JobRepositoryFactoryBean;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.batch.support.DatabaseType;
import org.springframework.batch.support.transaction.ResourcelessTransactionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.validation.BindException;

import com.aade.loader.domain.Row;
import com.aade.loader.repository.search.RowSearchRepository;

@Configuration
@EnableBatchProcessing
public class FileUploadBatch {
	
	private final Logger log = LoggerFactory.getLogger(FileUploadBatch.class);

	@Autowired
    private JobBuilderFactory jobs;

    @Autowired
    private StepBuilderFactory steps;
    
    @Autowired
    private ApplicationContext ctx;

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private RowSearchRepository elastickRepo;

//    @Autowired
//    private DataSource dataSource;
//    

//    @Bean
//    public JobRepository jobRepository() throws Exception {
//        JobRepositoryFactoryBean factory = new JobRepositoryFactoryBean();
//        // factory.setDatabaseType(DatabaseType.H2.getProductName());
//        factory.setDataSource(dataSource);
//        // factory.setTransactionManager(transactionManager());
//        return factory.getObject();
//    }
    
    @Bean
    public SimpleJobLauncher jobLauncher() throws Exception {
        SimpleJobLauncher simpleJobLauncher = new SimpleJobLauncher();
        simpleJobLauncher.setTaskExecutor(new SyncTaskExecutor());
        simpleJobLauncher.setJobRepository(jobRepository);
        return simpleJobLauncher;
    }
	
	@Bean
    public Job loadCsv() {
        return jobs.get("loadCsv")
                .start(stepLoadCsv())
                .build();
    }
	
	@Bean
    protected RowItemWriter rowWriter() {
        return new RowItemWriter(elastickRepo);
    }
	
	@Bean
    protected Step stepLoadCsv() {
        return steps.get("stepLoadCsv").chunk(5000)
        		.reader(cvsFileItemReader(null, null))
                .writer((ItemWriter) rowWriter())
                .build();
    }
	
	@Bean
    @StepScope
    protected FlatFileItemReader<Row> cvsFileItemReader(@Value("#{jobParameters[filename]}") String pathToFile,
            @Value("#{jobParameters[linesToSkip]}") Integer linesToSkip) {

        FlatFileItemReader<Row> flatFileItemReader = new FlatFileItemReader<Row>();
        flatFileItemReader.setResource(ctx.getResource("file:" + pathToFile));
        flatFileItemReader.setLinesToSkip(1);
        flatFileItemReader.setLineMapper(defaultLineMapper());
        return flatFileItemReader;
    }
	
	@Bean
    protected DefaultLineMapper<Row> defaultLineMapper() {
        DefaultLineMapper<Row> defaultLineMapper = new DefaultLineMapper<Row>();
        DelimitedLineTokenizer delimitedLineTokenizer = new DelimitedLineTokenizer();
        delimitedLineTokenizer.setStrict(false);
        delimitedLineTokenizer.setDelimiter(",");
        delimitedLineTokenizer.setNames(new String[] { "Date", "Datasource", "Campaign", "Clicks", "Impressions" });
        defaultLineMapper.setLineTokenizer(delimitedLineTokenizer);
        FieldSetMapper<Row> domainMapper = new FieldSetMapper<Row>() {
            public Row mapFieldSet(FieldSet fieldSet) throws BindException {
                // log.debug(fieldSet.toString());
            	Row data = new Row();
            	data.setId(UUID.randomUUID().toString());
                data.setDate(fieldSet.readDate(0, "dd.MM.yyyy"));
            	data.setDatasource(fieldSet.readString(1).trim());
                data.setCampaign(fieldSet.readString(2).trim());
                data.setClicks(fieldSet.readInt(3, 0));
                data.setImpressions(fieldSet.readInt(4, 0));
                return data;
            }
        };
        defaultLineMapper.setFieldSetMapper(domainMapper);
        return defaultLineMapper;
    }
}
