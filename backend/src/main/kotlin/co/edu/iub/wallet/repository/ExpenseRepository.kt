package co.edu.iub.wallet.repository

import co.edu.iub.wallet.model.Expense
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface ExpenseRepository : JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    fun findAllByUserId(userId: Long): List<Expense>
    fun findByIdAndUserId(id: Long, userId: Long): Expense?
    fun existsByCategoryId(categoryId: Long): Boolean
    fun existsByUserId(userId: Long): Boolean
}
