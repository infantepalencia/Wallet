package co.edu.iub.wallet.dto.category

data class CategoryResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val active: Boolean
)
