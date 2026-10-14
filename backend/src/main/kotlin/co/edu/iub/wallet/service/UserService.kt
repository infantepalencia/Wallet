package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.role.RoleResponse
import co.edu.iub.wallet.dto.user.ChangePasswordRequest
import co.edu.iub.wallet.dto.user.CreateUserRequest
import co.edu.iub.wallet.dto.user.UpdateProfileRequest
import co.edu.iub.wallet.dto.user.UpdateUserRoleRequest
import co.edu.iub.wallet.dto.user.UserResponse
import co.edu.iub.wallet.exception.DuplicateResourceException
import co.edu.iub.wallet.exception.InvalidCredentialsException
import co.edu.iub.wallet.exception.InvalidRequestException
import co.edu.iub.wallet.exception.ResourceNotFoundException
import co.edu.iub.wallet.model.User
import co.edu.iub.wallet.repository.ExpenseRepository
import co.edu.iub.wallet.repository.RoleRepository
import co.edu.iub.wallet.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val expenseRepository: ExpenseRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun getProfile(currentEmail: String): UserResponse =
        findUserByEmail(currentEmail).toResponse()

    fun updateProfile(currentEmail: String, request: UpdateProfileRequest): UserResponse {
        val user = findUserByEmail(currentEmail)
        applyProfileChanges(user, request)
        return userRepository.save(user).toResponse()
    }

    fun changePassword(currentEmail: String, request: ChangePasswordRequest) {
        val user = findUserByEmail(currentEmail)

        if (!passwordEncoder.matches(request.currentPassword, user.passwordHash)) {
            throw InvalidRequestException("La contraseña actual no es correcta")
        }

        user.passwordHash = passwordEncoder.encode(request.newPassword)!!
        userRepository.save(user)
    }

    fun getAllUsers(): List<UserResponse> =
        userRepository.findAll().map { it.toResponse() }

    fun createUser(request: CreateUserRequest): UserResponse {
        val email = request.email.trim().lowercase()
        if (userRepository.existsByEmail(email)) {
            throw DuplicateResourceException("El correo $email ya está registrado")
        }
        val role = roleRepository.findById(request.roleId)
            .orElseThrow { ResourceNotFoundException("Rol no encontrado") }

        val user = User(
            email = email,
            name = request.name.trim(),
            phone = request.phone?.trim()?.ifBlank { null },
            passwordHash = passwordEncoder.encode(request.password)!!,
            role = role
        )
        return userRepository.save(user).toResponse()
    }

    fun adminUpdateUser(userId: Long, request: UpdateProfileRequest): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Usuario no encontrado") }
        applyProfileChanges(user, request)
        return userRepository.save(user).toResponse()
    }

    fun deleteUser(userId: Long, currentEmail: String) {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Usuario no encontrado") }

        if (user.email.equals(currentEmail, ignoreCase = true)) {
            throw InvalidRequestException("No puedes eliminar tu propio usuario")
        }
        if (expenseRepository.existsByUserId(userId)) {
            throw InvalidRequestException("No se puede eliminar un usuario con gastos registrados; desactívalo en su lugar")
        }
        userRepository.delete(user)
    }

    fun updateRole(userId: Long, request: UpdateUserRoleRequest): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Usuario no encontrado") }
        val role = roleRepository.findById(request.roleId)
            .orElseThrow { ResourceNotFoundException("Rol no encontrado") }

        user.role = role
        return userRepository.save(user).toResponse()
    }

    fun updateStatus(userId: Long, active: Boolean): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Usuario no encontrado") }

        user.active = active
        return userRepository.save(user).toResponse()
    }

    private fun applyProfileChanges(user: User, request: UpdateProfileRequest) {
        request.email?.let { newEmail ->
            val normalized = newEmail.trim().lowercase()
            if (userRepository.existsByEmailAndIdNot(normalized, requireNotNull(user.id))) {
                throw DuplicateResourceException("El correo ya está registrado")
            }
            user.email = normalized
        }
        request.name?.let { user.name = it.trim() }
        request.phone?.let { user.phone = it.trim().ifBlank { null } }
    }

    private fun findUserByEmail(email: String) =
        userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException("Usuario no encontrado")

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
