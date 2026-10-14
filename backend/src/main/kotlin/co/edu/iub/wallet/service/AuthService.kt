package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.auth.LoginRequest
import co.edu.iub.wallet.dto.auth.RegisterRequest
import co.edu.iub.wallet.dto.auth.TokenResponse
import co.edu.iub.wallet.dto.role.RoleResponse
import co.edu.iub.wallet.dto.user.UserResponse
import co.edu.iub.wallet.exception.DuplicateResourceException
import co.edu.iub.wallet.exception.InvalidCredentialsException
import co.edu.iub.wallet.model.User
import co.edu.iub.wallet.repository.RoleRepository
import co.edu.iub.wallet.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    fun register(request: RegisterRequest): UserResponse {
        val email = request.email.trim().lowercase()

        if (userRepository.existsByEmail(email)) {
            throw DuplicateResourceException("El correo $email ya está registrado")
        }

        val defaultRole = roleRepository.findByName("USER")
            ?: throw IllegalStateException("Default role USER is not configured")

        val user = User(
            email = email,
            name = request.name.trim(),
            phone = request.phone?.trim()?.ifBlank { null },
            passwordHash = passwordEncoder.encode(request.password)!!,
            role = defaultRole
        )
        return userRepository.save(user).toResponse()
    }

    fun login(request: LoginRequest): TokenResponse {
        val email = request.email.trim().lowercase()
        val user = userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException("Credenciales inválidas")

        if (!user.active || !passwordEncoder.matches(request.password, user.passwordHash)) {
            throw InvalidCredentialsException("Credenciales inválidas")
        }

        val token = jwtService.generateToken(user)
        return TokenResponse(
            accessToken = token,
            expiresIn = jwtService.expirationMinutes * 60
        )
    }

    private fun User.toResponse(): UserResponse {
        return UserResponse(
            id = requireNotNull(id),
            email = email,
            name = name,
            phone = phone,
            active = active,
            role = RoleResponse(requireNotNull(role.id), role.name, role.description),
            createdAt = createdAt
        )
    }
}
