package co.edu.iub.wallet.dto.role

import jakarta.validation.constraints.NotBlank

data class RoleRequest(
    @field:NotBlank
    val name: String,

    val description: String?
)
