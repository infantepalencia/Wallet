package co.edu.iub.wallet.dto.category

import jakarta.validation.constraints.NotBlank

data class CategoryRequest(
    @field:NotBlank
    val name: String,

    val description: String?,

    val active: Boolean = true
)
