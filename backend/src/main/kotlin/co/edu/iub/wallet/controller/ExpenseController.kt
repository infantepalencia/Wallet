package co.edu.iub.wallet.controller

import co.edu.iub.wallet.dto.expense.ExpenseCreateRequest
import co.edu.iub.wallet.dto.expense.ExpenseResponse
import co.edu.iub.wallet.dto.expense.ExpenseUpdateRequest
import co.edu.iub.wallet.service.ExpenseService
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.LocalDate

@RestController
@RequestMapping("/expenses")
class ExpenseController(
    private val expenseService: ExpenseService
) {

    @PostMapping
    fun create(
        @Valid @RequestBody request: ExpenseCreateRequest,
        authentication: Authentication
    ): ResponseEntity<ExpenseResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(expenseService.createExpense(authentication.name, request))
    }

    @GetMapping
    fun list(
        authentication: Authentication,
        @RequestParam categoryId: Long?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) dateFrom: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) dateTo: LocalDate?,
        @RequestParam minAmount: BigDecimal?,
        @RequestParam maxAmount: BigDecimal?
    ): List<ExpenseResponse> {
        return expenseService.getExpenses(authentication.name, categoryId, date, dateFrom, dateTo, minAmount, maxAmount)
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long, authentication: Authentication): ExpenseResponse {
        return expenseService.getExpense(id, authentication.name)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: ExpenseUpdateRequest,
        authentication: Authentication
    ): ExpenseResponse {
        return expenseService.updateExpense(id, authentication.name, request)
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long, authentication: Authentication): ResponseEntity<Void> {
        expenseService.deleteExpense(id, authentication.name)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/all")
    fun listAll(
        @RequestParam categoryId: Long?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) dateFrom: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) dateTo: LocalDate?,
        @RequestParam minAmount: BigDecimal?,
        @RequestParam maxAmount: BigDecimal?
    ): List<ExpenseResponse> {
        return expenseService.getAllExpenses(categoryId, date, dateFrom, dateTo, minAmount, maxAmount)
    }
}
