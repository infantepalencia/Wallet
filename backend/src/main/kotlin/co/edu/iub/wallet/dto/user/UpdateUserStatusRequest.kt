package co.edu.iub.wallet.dto.user

import jakarta.validation.constraints.NotNull

data class UpdateUserStatusRequest(
    @field:NotNull
    val active: Boolean
)
