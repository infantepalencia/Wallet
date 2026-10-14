package co.edu.iub.wallet.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val restAuthenticationEntryPoint: RestAuthenticationEntryPoint,
    private val restAccessDeniedHandler: RestAccessDeniedHandler,
    @param:Value("\${app.cors.allowed-origin}") private val allowedOrigin: String
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration()
        config.allowedOrigins = listOf(allowedOrigin)
        config.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        config.allowedHeaders = listOf("*")
        config.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return source
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .cors { }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers(HttpMethod.GET, "/").permitAll()
                it.requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                it.requestMatchers(HttpMethod.POST, "/auth/login").permitAll()

                it.requestMatchers(HttpMethod.GET, "/roles/**").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.POST, "/roles/**").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.PUT, "/roles/**").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.DELETE, "/roles/**").hasRole("ADMIN")

                it.requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.PUT, "/users/me").authenticated()
                it.requestMatchers(HttpMethod.PUT, "/users/*/role").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.PUT, "/users/*/status").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.PUT, "/users/*").hasRole("ADMIN")
                it.requestMatchers(HttpMethod.DELETE, "/users/*").hasRole("ADMIN")

                it.requestMatchers(HttpMethod.GET, "/categories/**").authenticated()
                it.requestMatchers(HttpMethod.POST, "/categories/**").authenticated()
                it.requestMatchers(HttpMethod.PUT, "/categories/**").authenticated()
                it.requestMatchers(HttpMethod.DELETE, "/categories/**").authenticated()

                it.requestMatchers(HttpMethod.GET, "/expenses/all").hasRole("ADMIN")

                it.anyRequest().authenticated()
            }
            .exceptionHandling {
                it.authenticationEntryPoint(restAuthenticationEntryPoint)
                it.accessDeniedHandler(restAccessDeniedHandler)
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            .build()
    }
}
