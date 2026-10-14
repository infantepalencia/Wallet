package co.edu.iub.wallet.controller

import co.edu.iub.wallet.dto.report.CategoryReportResponse
import co.edu.iub.wallet.dto.report.PeriodReportResponse
import co.edu.iub.wallet.dto.report.SummaryReportResponse
import co.edu.iub.wallet.dto.report.TotalReportResponse
import co.edu.iub.wallet.service.ReportService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/reports")
class ReportController(
    private val reportService: ReportService
) {

    @GetMapping("/total")
    fun total(authentication: Authentication): TotalReportResponse =
        reportService.getTotal(authentication.name)

    @GetMapping("/by-category")
    fun byCategory(authentication: Authentication): CategoryReportResponse =
        reportService.getByCategory(authentication.name)

    @GetMapping("/by-period")
    fun byPeriod(authentication: Authentication): PeriodReportResponse =
        reportService.getByPeriod(authentication.name)

    @GetMapping("/summary")
    fun summary(authentication: Authentication): SummaryReportResponse =
        reportService.getSummary(authentication.name)
}
