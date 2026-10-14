package co.edu.iub.wallet.dto.expense

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate

data class ExpenseCreateRequest(
    @field:NotBlank
    val description: String,

    @field:NotNull
    @field:DecimalMin(value = "0.0", inclusive = false)
    val amount: BigDecimal,

    @field:NotNull
    val date: LocalDate,

    @field:NotNull
    val categoryId: Long
)
