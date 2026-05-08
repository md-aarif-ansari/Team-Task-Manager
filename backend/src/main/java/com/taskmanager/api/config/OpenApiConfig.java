package com.taskmanager.api.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.context.annotation.Configuration;

/**
 * Basic OpenAPI metadata configuration. The `springdoc` starter will
 * auto-expose `/v3/api-docs` and a Swagger UI at `/swagger-ui/index.html`.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "TaskManager API",
                version = "v0.0.1",
                description = "API for TaskManager demo application",
                contact = @Contact(name = "Aleksa", email = "stajic1210@gmail.com"),
                license = @License(name = "MIT")
        )
)
public class OpenApiConfig {

}
