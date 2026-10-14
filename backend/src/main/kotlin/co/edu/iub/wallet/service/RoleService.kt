package co.edu.iub.wallet.service

import co.edu.iub.wallet.dto.role.RoleRequest
import co.edu.iub.wallet.dto.role.RoleResponse
import co.edu.iub.wallet.exception.DuplicateResourceException
import co.edu.iub.wallet.exception.InvalidRequestException
import co.edu.iub.wallet.exception.ResourceNotFoundException
import co.edu.iub.wallet.model.Role
import co.edu.iub.wallet.repository.RoleRepository
import co.edu.iub.wallet.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class RoleService(
    private val roleRepository: RoleRepository,
    private val userRepository: UserRepository
) {

    fun getRoles(): List<RoleResponse> =
        roleRepository.findAll().map { it.toResponse() }

    fun getRole(id: Long): RoleResponse =
        findRoleById(id).toResponse()

    fun createRole(request: RoleRequest): RoleResponse {
        val name = request.name.trim().uppercase()
        if (roleRepository.existsByName(name)) {
            throw DuplicateResourceException("El rol $name ya existe")
        }
        val role = Role(name = name, description = request.description)
        return roleRepository.save(role).toResponse()
    }

    fun updateRole(id: Long, request: RoleRequest): RoleResponse {
        val role = findRoleById(id)
        val name = request.name.trim().uppercase()

        if (roleRepository.existsByNameAndIdNot(name, id)) {
            throw DuplicateResourceException("El rol $name ya existe")
        }

        role.name = name
        role.description = request.description
        return roleRepository.save(role).toResponse()
    }

    fun deleteRole(id: Long) {
        val role = findRoleById(id)
        if (userRepository.existsByRoleId(id)) {
            throw InvalidRequestException("No se puede eliminar un rol asignado a usuarios")
        }
        roleRepository.delete(role)
    }

    private fun findRoleById(id: Long) =
        roleRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Rol no encontrado") }

    private fun Role.toResponse() = RoleResponse(requireNotNull(id), name, description)
}
