package ru.studyplanner.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class AiService {

    private final WebClient webClient;

    // Читаем URL из конфига (по умолчанию localhost для разработки)
    public AiService(
            WebClient.Builder webClientBuilder,
            @Value("${app.ai.url:http://localhost:11434}") String aiUrl
    ) {
        this.webClient = webClientBuilder.baseUrl(aiUrl).build();
    }

    public String analyzePriority(String taskDescription) {
        String prompt = "Analyze the following task description and determine its priority (HIGH, MEDIUM, LOW). Return ONLY the word HIGH, MEDIUM, or LOW. Task: " + taskDescription;

        Map<String, Object> request = Map.of(
                "model", "llama3",
                "prompt", prompt,
                "stream", false
        );

        try {
            String response = webClient.post()
                    .uri("/api/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(res -> (String) res.get("response"))
                    .block();

            if (response != null) {
                String cleaned = response.trim().toUpperCase();
                if (cleaned.contains("HIGH")) return "HIGH";
                if (cleaned.contains("LOW")) return "LOW";
                return "MEDIUM";
            }
        } catch (Exception e) {
            System.err.println("Ошибка обращения к Ollama: " + e.getMessage());
            return "MEDIUM";
        }

        return "MEDIUM";
    }
}