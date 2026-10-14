package co.edu.iub.wallet.dto.user

import jakarta.validation.constraints.NotNull

data class UpdateUserRoleRequest(
    @field:NotNull
    val roleId: Long
)
