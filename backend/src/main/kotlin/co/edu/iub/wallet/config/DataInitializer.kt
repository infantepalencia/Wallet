package co.edu.iub.wallet.config

import co.edu.iub.wallet.model.Category
import co.edu.iub.wallet.model.Role
import co.edu.iub.wallet.model.User
import co.edu.iub.wallet.repository.CategoryRepository
import co.edu.iub.wallet.repository.RoleRepository
import co.edu.iub.wallet.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class DataInitializer(
    private val roleRepository: RoleRepository,
    private val userRepository: UserRepository,
    private val categoryRepository: CategoryRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    override fun run(vararg args: String) {
        val adminRole = roleRepository.findByName("ADMIN")
            ?: roleRepository.save(Role(name = "ADMIN", description = "Administrador del sistema"))
        roleRepository.findByName("USER")
            ?: roleRepository.save(Role(name = "USER", description = "Usuario estándar"))

        if (!userRepository.existsByEmail("admin@wallet.com")) {
            val admin = User(
                email = "admin@wallet.com",
                name = "Administrador",
                passwordHash = passwordEncoder.encode("Admin1234")!!,
                role = adminRole,
                active = true
            )
            userRepository.save(admin)
        }

        val defaultCategories = listOf(
            "Alimentación" to "Comida y supermercado",
            "Transporte" to "Movilidad y combustible",
            "Salud" to "Consultas y medicamentos",
            "Educación" to "Cursos y materiales",
            "Vivienda" to "Arriendo y servicios del hogar",
            "Entretenimiento" to "Ocio y esparcimiento",
            "Servicios" to "Servicios públicos y suscripciones",
            "Otros" to "Gastos varios"
        )

        defaultCategories.forEach { (name, description) ->
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(Category(name = name, description = description, active = true))
            }
        }
    }
}
