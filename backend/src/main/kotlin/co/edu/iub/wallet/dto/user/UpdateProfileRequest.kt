package co.edu.iub.wallet.dto.user

import jakarta.validation.constraints.Email

data class UpdateProfileRequest(
    @field:Email
    val email: String?,

    val name: String?,

    val phone: String?
)
