package co.edu.iub.wallet.dto.expense

import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal
import java.time.LocalDate

data class ExpenseUpdateRequest(
    val description: String?,

    @field:DecimalMin(value = "0.0", inclusive = false)
    val amount: BigDecimal?,

    val date: LocalDate?,

    val categoryId: Long?
)
