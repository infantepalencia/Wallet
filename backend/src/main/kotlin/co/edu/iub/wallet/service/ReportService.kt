package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.report.CategoryReportItem
import co.edu.iub.wallet.dto.report.CategoryReportResponse
import co.edu.iub.wallet.dto.report.PeriodReportItem
import co.edu.iub.wallet.dto.report.PeriodReportResponse
import co.edu.iub.wallet.dto.report.SummaryReportResponse
import co.edu.iub.wallet.dto.report.TotalReportResponse
import co.edu.iub.wallet.exception.InvalidCredentialsException
import co.edu.iub.wallet.model.Expense
import co.edu.iub.wallet.repository.ExpenseRepository
import co.edu.iub.wallet.repository.UserRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.format.DateTimeFormatter

@Service
class ReportService(
    private val expenseRepository: ExpenseRepository,
    private val userRepository: UserRepository
) {

    fun getTotal(ownerEmail: String): TotalReportResponse {
        val expenses = getOwnedExpenses(ownerEmail)
        return TotalReportResponse(
            total = expenses.sumOf { it.amount },
            count = expenses.size.toLong()
        )
    }

    fun getByCategory(ownerEmail: String): CategoryReportResponse {
        val expenses = getOwnedExpenses(ownerEmail)
        val items = expenses
            .groupBy { it.category }
            .map { (category, categoryExpenses) ->
                CategoryReportItem(
                    categoryId = requireNotNull(category.id),
                    categoryName = category.name,
                    total = categoryExpenses.sumOf { it.amount },
                    count = categoryExpenses.size.toLong()
                )
            }
            .sortedByDescending { it.total }
        return CategoryReportResponse(items)
    }

    fun getByPeriod(ownerEmail: String): PeriodReportResponse {
        val expenses = getOwnedExpenses(ownerEmail)
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")
        val items = expenses
            .groupBy { it.date.format(formatter) }
            .map { (period, periodExpenses) ->
                PeriodReportItem(
                    period = period,
                    total = periodExpenses.sumOf { it.amount },
                    count = periodExpenses.size.toLong()
                )
            }
            .sortedBy { it.period }
        return PeriodReportResponse(items)
    }

    fun getSummary(ownerEmail: String): SummaryReportResponse {
        return SummaryReportResponse(
            total = getTotal(ownerEmail),
            byCategory = getByCategory(ownerEmail).items,
            byPeriod = getByPeriod(ownerEmail).items
        )
    }

    private fun getOwnedExpenses(ownerEmail: String): List<Expense> {
        val owner = userRepository.findByEmail(ownerEmail)
            ?: throw InvalidCredentialsException("Usuario no encontrado")
        return expenseRepository.findAllByUserId(requireNotNull(owner.id))
    }
}
