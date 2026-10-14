package co.edu.iub.wallet.dto.expense

import co.edu.iub.wallet.dto.category.CategoryResponse
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ExpenseResponse(
    val id: Long,
    val description: String,
    val amount: BigDecimal,
    val date: LocalDate,
    val userId: Long,
    val category: CategoryResponse,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
