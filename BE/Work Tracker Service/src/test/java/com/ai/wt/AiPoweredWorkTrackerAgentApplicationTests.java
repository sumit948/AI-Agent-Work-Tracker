package com.ai.wt;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootTest
class AiPoweredWorkTrackerAgentApplicationTests {

	@MockBean
	WebClient openAiWebClient;

	@Test
	void contextLoads() {
	}

}
