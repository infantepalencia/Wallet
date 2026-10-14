package co.edu.iub.wallet.controller

import co.edu.iub.wallet.dto.role.RoleRequest
import co.edu.iub.wallet.dto.role.RoleResponse
import co.edu.iub.wallet.service.RoleService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/roles")
class RoleController(
    private val roleService: RoleService
) {

    @GetMapping
    fun list(): List<RoleResponse> = roleService.getRoles()

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): RoleResponse = roleService.getRole(id)

    @PostMapping
    fun create(@Valid @RequestBody request: RoleRequest): ResponseEntity<RoleResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.createRole(request))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: RoleRequest): RoleResponse {
        return roleService.updateRole(id, request)
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        roleService.deleteRole(id)
        return ResponseEntity.noContent().build()
    }
}
