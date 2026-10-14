package co.edu.iub.wallet.dto.report

import java.math.BigDecimal

data class TotalReportResponse(
    val total: BigDecimal,
    val count: Long
)

data class CategoryReportItem(
    val categoryId: Long,
    val categoryName: String,
    val total: BigDecimal,
    val count: Long
)

data class CategoryReportResponse(
    val items: List<CategoryReportItem>
)

data class PeriodReportItem(
    val period: String,
    val total: BigDecimal,
    val count: Long
)

data class PeriodReportResponse(
    val items: List<PeriodReportItem>
)

data class SummaryReportResponse(
    val total: TotalReportResponse,
    val byCategory: List<CategoryReportItem>,
    val byPeriod: List<PeriodReportItem>
)
