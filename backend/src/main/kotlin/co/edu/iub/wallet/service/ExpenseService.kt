package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.category.CategoryResponse
import co.edu.iub.wallet.dto.expense.ExpenseCreateRequest
import co.edu.iub.wallet.dto.expense.ExpenseResponse
import co.edu.iub.wallet.dto.expense.ExpenseUpdateRequest
import co.edu.iub.wallet.exception.InvalidCredentialsException
import co.edu.iub.wallet.exception.ResourceNotFoundException
import co.edu.iub.wallet.model.Expense
import co.edu.iub.wallet.repository.CategoryRepository
import co.edu.iub.wallet.repository.ExpenseRepository
import co.edu.iub.wallet.repository.UserRepository
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class ExpenseService(
    private val expenseRepository: ExpenseRepository,
    private val userRepository: UserRepository,
    private val categoryRepository: CategoryRepository
) {

    fun createExpense(ownerEmail: String, request: ExpenseCreateRequest): ExpenseResponse {
        val owner = findUserByEmail(ownerEmail)
        val category = findCategoryById(request.categoryId)

        val expense = Expense(
            description = request.description,
            amount = request.amount,
            date = request.date,
            user = owner,
            category = category
        )
        return expenseRepository.save(expense).toResponse()
    }

    fun getExpense(id: Long, ownerEmail: String): ExpenseResponse {
        val owner = findUserByEmail(ownerEmail)
        val expense = expenseRepository.findByIdAndUserId(id, requireNotNull(owner.id))
            ?: throw ResourceNotFoundException("Gasto no encontrado")
        return expense.toResponse()
    }

    fun updateExpense(id: Long, ownerEmail: String, request: ExpenseUpdateRequest): ExpenseResponse {
        val owner = findUserByEmail(ownerEmail)
        val expense = expenseRepository.findByIdAndUserId(id, requireNotNull(owner.id))
            ?: throw ResourceNotFoundException("Gasto no encontrado")

        request.description?.let { expense.description = it }
        request.amount?.let { expense.amount = it }
        request.date?.let { expense.date = it }
        request.categoryId?.let { expense.category = findCategoryById(it) }
        expense.updatedAt = LocalDateTime.now()

        return expenseRepository.save(expense).toResponse()
    }

    fun deleteExpense(id: Long, ownerEmail: String) {
        val owner = findUserByEmail(ownerEmail)
        val expense = expenseRepository.findByIdAndUserId(id, requireNotNull(owner.id))
            ?: throw ResourceNotFoundException("Gasto no encontrado")
        expenseRepository.delete(expense)
    }

    fun getExpenses(
        ownerEmail: String,
        categoryId: Long?,
        date: LocalDate?,
        dateFrom: LocalDate?,
        dateTo: LocalDate?,
        minAmount: BigDecimal?,
        maxAmount: BigDecimal?
    ): List<ExpenseResponse> {
        val owner = findUserByEmail(ownerEmail)
        val spec = buildSpecification(requireNotNull(owner.id), categoryId, date, dateFrom, dateTo, minAmount, maxAmount)
        return expenseRepository.findAll(spec).map { it.toResponse() }
    }

    fun getAllExpenses(
        categoryId: Long?,
        date: LocalDate?,
        dateFrom: LocalDate?,
        dateTo: LocalDate?,
        minAmount: BigDecimal?,
        maxAmount: BigDecimal?
    ): List<ExpenseResponse> {
        val spec = buildSpecification(null, categoryId, date, dateFrom, dateTo, minAmount, maxAmount)
        return expenseRepository.findAll(spec).map { it.toResponse() }
    }

    private fun buildSpecification(
        userId: Long?,
        categoryId: Long?,
        date: LocalDate?,
        dateFrom: LocalDate?,
        dateTo: LocalDate?,
        minAmount: BigDecimal?,
        maxAmount: BigDecimal?
    ): Specification<Expense> {
        return Specification { root, _, cb ->
            val predicates = mutableListOf<Predicate>()

            userId?.let { predicates.add(cb.equal(root.get<Any>("user").get<Long>("id"), it)) }
            categoryId?.let { predicates.add(cb.equal(root.get<Any>("category").get<Long>("id"), it)) }
            date?.let { predicates.add(cb.equal(root.get<LocalDate>("date"), it)) }
            dateFrom?.let { predicates.add(cb.greaterThanOrEqualTo(root.get("date"), it)) }
            dateTo?.let { predicates.add(cb.lessThanOrEqualTo(root.get("date"), it)) }
            minAmount?.let { predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), it)) }
            maxAmount?.let { predicates.add(cb.lessThanOrEqualTo(root.get("amount"), it)) }

            cb.and(*predicates.toTypedArray())
        }
    }

    private fun findUserByEmail(email: String) =
        userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException("Usuario no encontrado")

    private fun findCategoryById(id: Long) =
        categoryRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Categoría no encontrada") }

    private fun Expense.toResponse(): ExpenseResponse {
        return ExpenseResponse(
            id = requireNotNull(id),
            description = description,
            amount = amount,
            date = date,
            userId = requireNotNull(user.id),
            category = CategoryResponse(
                requireNotNull(category.id),
                category.name,
                category.description,
                category.active
            ),
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
