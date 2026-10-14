package co.edu.iub.wallet.controller

import co.edu.iub.wallet.dto.MessageResponse
import co.edu.iub.wallet.dto.user.ChangePasswordRequest
import co.edu.iub.wallet.dto.user.CreateUserRequest
import co.edu.iub.wallet.dto.user.UpdateProfileRequest
import co.edu.iub.wallet.dto.user.UpdateUserRoleRequest
import co.edu.iub.wallet.dto.user.UpdateUserStatusRequest
import co.edu.iub.wallet.dto.user.UserResponse
import co.edu.iub.wallet.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
    private val userService: UserService
) {

    @GetMapping("/users/me")
    fun me(authentication: Authentication): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.getProfile(authentication.name))
    }

    @PutMapping("/users/me")
    fun updateProfile(
        @Valid @RequestBody request: UpdateProfileRequest,
        authentication: Authentication
    ): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.updateProfile(authentication.name, request))
    }

    @PostMapping("/users/me/change-password")
    fun changePassword(
        @Valid @RequestBody request: ChangePasswordRequest,
        authentication: Authentication
    ): ResponseEntity<MessageResponse> {
        userService.changePassword(authentication.name, request)
        return ResponseEntity.ok(MessageResponse("Password changed successfully"))
    }

    @GetMapping("/users")
    fun list(): ResponseEntity<List<UserResponse>> {
        return ResponseEntity.ok(userService.getAllUsers())
    }

    @PostMapping("/users")
    fun create(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request))
    }

    @PutMapping("/users/{id}")
    fun adminUpdate(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.adminUpdateUser(id, request))
    }

    @DeleteMapping("/users/{id}")
    fun delete(@PathVariable id: Long, authentication: Authentication): ResponseEntity<Void> {
        userService.deleteUser(id, authentication.name)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/users/{id}/role")
    fun updateRole(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateUserRoleRequest
    ): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.updateRole(id, request))
    }

    @PutMapping("/users/{id}/status")
    fun updateStatus(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateUserStatusRequest
    ): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.updateStatus(id, request.active))
    }
}
