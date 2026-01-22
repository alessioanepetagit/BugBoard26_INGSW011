package ma.bugboard.bugboard26;

import ma.bugboard.bugboard26.model.*;
import ma.bugboard.bugboard26.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SimpleTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Test
	void testModelsFull() {
		// 1. SATURAZIONE USER
		User u = new User(88L, "m@test.it", "p", "Michele", "ADMIN");
		assertEquals(88L, u.getId());
		assertEquals("m@test.it", u.getEmail());
		assertEquals("p", u.getPassword());
		assertEquals("Michele", u.getName());
		assertEquals("ADMIN", u.getRole());

		// 2. SATURAZIONE ISSUE
		List<Comment> commentList = new ArrayList<>();
		LocalDateTime now = LocalDateTime.now();
		Issue i = new Issue(99L, "Title", "Desc", "img64", "BUG", "HIGH", "OPEN", "Michele", now, u, commentList);

		// Test di tutti i getter per saturare la classe Issue
		assertAll("Saturazione Issue",
				() -> assertEquals(99L, i.getId()),
				() -> assertEquals("Title", i.getTitle()),
				() -> assertEquals("Desc", i.getDescription()),
				() -> assertEquals("img64", i.getImageBase64()),
				() -> assertEquals("BUG", i.getType()),
				() -> assertEquals("HIGH", i.getPriority()),
				() -> assertEquals("OPEN", i.getStatus()),
				() -> assertEquals("Michele", i.getAssignee()),
				() -> assertEquals(now, i.getCreatedAt()),
				() -> assertEquals(u, i.getReporter()),
				() -> assertEquals(commentList, i.getComments())
		);

		// 3. SATURAZIONE COMMENT (Uso del costruttore completo)
		Comment c = new Comment(66L, "Test Text", u, i, now);
		assertAll("Saturazione Comment",
				() -> assertEquals(66L, c.getId()),
				() -> assertEquals("Test Text", c.getText()),
				() -> assertEquals(u, c.getAuthor()),
				() -> assertEquals(i, c.getIssue()),
				() -> assertEquals(now, c.getCreatedAt())
		);

		// 4. SATURAZIONE AUDITLOG
		AuditLog a = new AuditLog();
		a.setId(77L); a.setAction("CREATE"); a.setPayload("{}"); a.setEntityId(1L);
		a.setTimestamp(now);
		assertEquals(77L, a.getId());
	}

	@Test
	void finalPushCoverageFlow() {
		String emailReg = "reg." + System.currentTimeMillis() + "@test.it";
		String emailAdmin = "admin." + System.currentTimeMillis() + "@test.it";

		// A. USER CONTROLLER
		Map<String, String> regData = new HashMap<>();
		regData.put("email", emailReg);
		regData.put("password", "secret");
		regData.put("name", "User Registrato");

		ResponseEntity<User> regResp = restTemplate.postForEntity("/api/users/register", regData, User.class);
		Long userId = regResp.getBody().getId();

		// B. USER CONTROLLER - CREATE ADMIN
		User adminUser = new User();
		adminUser.setEmail(emailAdmin); adminUser.setPassword("admin123"); adminUser.setName("Admin"); adminUser.setRole("ADMIN");
		restTemplate.postForEntity("/api/users/create", adminUser, User.class);

		// C. AUTH CONTROLLER - LOGIN DTO
		LoginRequest loginReq = new LoginRequest();
		loginReq.setEmail(emailReg);
		loginReq.setPassword("secret");
		restTemplate.postForEntity("/api/auth/login", loginReq, User.class);

		// Test ramo: Password errata (401)
		loginReq.setPassword("sbagliata");
		ResponseEntity<String> authErr = restTemplate.postForEntity("/api/auth/login", loginReq, String.class);
		assertThat(authErr.getStatusCode().value()).isEqualTo(401);

		// Test ramo: Utente null/inesistente (401)
		loginReq.setEmail("non.esisto@test.it");
		ResponseEntity<String> authNull = restTemplate.postForEntity("/api/auth/login", loginReq, String.class);
		assertThat(authNull.getStatusCode().value()).isEqualTo(401);

		// D. ISSUE CONTROLLER
		Issue issue = new Issue();
		issue.setTitle("Coverage80"); issue.setDescription("Deep");
		issue.setPriority("HIGH"); issue.setType("BUG");

		ResponseEntity<Issue> iResp = restTemplate.postForEntity("/api/issues?reporterId=" + userId, issue, Issue.class);
		Long issueId = iResp.getBody().getId();

		restTemplate.put("/api/issues/" + issueId + "/close", null);
		restTemplate.put("/api/issues/" + issueId, issue);

		// E. COMMENTI
		Comment comment = new Comment();
		comment.setText("Test");
		String commentUrl = "/api/comments?issueId=" + String.valueOf(issueId) + "&authorId=" + String.valueOf(userId);
		restTemplate.postForEntity(commentUrl, comment, Comment.class);

		// F. AUDIT LOG CONTROLLER
		ResponseEntity<List> logsResp = restTemplate.getForEntity("/api/audit-logs", List.class);
		assertThat(logsResp.getStatusCode().is2xxSuccessful()).isTrue();

		// G. DATA INITIALIZER - LISTE
		restTemplate.getForEntity("/api/users", List.class);

		// H. DELETE E RAMI 404
		restTemplate.delete("/api/issues/" + issueId);
		ResponseEntity<Void> delErr = restTemplate.exchange("/api/issues/9999", HttpMethod.DELETE, null, Void.class);
		assertThat(delErr.getStatusCode().is4xxClientError()).isTrue();
	}
}