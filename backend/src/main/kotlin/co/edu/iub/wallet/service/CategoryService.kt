package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.category.CategoryRequest
import co.edu.iub.wallet.dto.category.CategoryResponse
import co.edu.iub.wallet.exception.DuplicateResourceException
import co.edu.iub.wallet.exception.InvalidRequestException
import co.edu.iub.wallet.exception.ResourceNotFoundException
import co.edu.iub.wallet.model.Category
import co.edu.iub.wallet.repository.CategoryRepository
import co.edu.iub.wallet.repository.ExpenseRepository
import org.springframework.stereotype.Service

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val expenseRepository: ExpenseRepository
) {

    fun getCategories(): List<CategoryResponse> =
        categoryRepository.findAll().map { it.toResponse() }

    fun getCategory(id: Long): CategoryResponse =
        findCategoryById(id).toResponse()

    fun createCategory(request: CategoryRequest): CategoryResponse {
        val name = request.name.trim()
        if (categoryRepository.existsByName(name)) {
            throw DuplicateResourceException("La categoría $name ya existe")
        }
        val category = Category(name = name, description = request.description, active = request.active)
        return categoryRepository.save(category).toResponse()
    }

    fun updateCategory(id: Long, request: CategoryRequest): CategoryResponse {
        val category = findCategoryById(id)
        val name = request.name.trim()

        if (categoryRepository.existsByNameAndIdNot(name, id)) {
            throw DuplicateResourceException("La categoría $name ya existe")
        }

        category.name = name
        category.description = request.description
        category.active = request.active
        return categoryRepository.save(category).toResponse()
    }

    fun deleteCategory(id: Long) {
        val category = findCategoryById(id)
        if (expenseRepository.existsByCategoryId(id)) {
            throw InvalidRequestException("No se puede eliminar una categoría con gastos asociados")
        }
        categoryRepository.delete(category)
    }

    private fun findCategoryById(id: Long) =
        categoryRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Categoría no encontrada") }

    private fun Category.toResponse() = CategoryResponse(requireNotNull(id), name, description, active)
}
