package co.edu.iub.wallet.dto.user

import co.edu.iub.wallet.dto.role.RoleResponse
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val email: String,
    val name: String,
    val phone: String?,
    val active: Boolean,
    val role: RoleResponse,
    val createdAt: LocalDateTime
)
