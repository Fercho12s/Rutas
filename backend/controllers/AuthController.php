<?php
/**
 * CONTROLADOR AUTH - GESTIÓN DE AUTENTICACIÓN
 * ============================================
 * 
 * Maneja los endpoints de:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Cierre de sesión
 */

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Registro de nuevo usuario
     * POST /api/auth/register
     */
    public function register() {
        $data = RequestMiddleware::getJsonBody();

        // Validar datos de entrada
        if (!Validator::validateUserRegistration($data)) {
            Response::send(Response::validationError(Validator::getErrors()));
        }

        // Sanitizar datos
        $data = Validator::sanitize($data);

        // Verificar que el email no exista
        if ($this->userModel->emailExists($data['email'])) {
            Response::send(Response::error('El email ya está registrado', 400, ['email' => 'Este email ya existe']));
        }

        // Crear usuario
        $user = $this->userModel->create(
            $data['name'],
            $data['email'],
            $data['password'],
            $data['role'] ?? 'cliente',
            $data['phone'] ?? null
        );

        if (!$user) {
            Response::send(Response::serverError('Error al crear el usuario'));
        }

        // Generar JWT
        $token = JWTHandler::create([
            'id' => $user['id'],
            'name' => $user['nombre'],
            'email' => $user['email'],
            'role' => $user['rol']
        ]);

        // Preparar respuesta (sin enviar la contraseña)
        $responseData = [
            'user' => [
                'id' => $user['id'],
                'name' => $user['nombre'],
                'email' => $user['email'],
                'role' => $user['rol'],
                'phone' => $user['telefono'],
                'createdAt' => $user['fecha_creacion']
            ],
            'token' => $token
        ];

        Response::send(Response::success($responseData, 'Usuario registrado exitosamente', 201));
    }

    /**
     * Inicio de sesión
     * POST /api/auth/login
     */
    public function login() {
        $data = RequestMiddleware::getJsonBody();

        // Validar datos
        if (empty($data['email']) || empty($data['password'])) {
            Response::send(Response::error('Email y contraseña son requeridos', 400));
        }

        // Sanitizar
        $data = Validator::sanitize($data);

        // Buscar usuario
        $user = $this->userModel->getByEmail($data['email']);

        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['contrasena'])) {
            Response::send(Response::error('Credenciales inválidas', 401));
        }

        // Generar JWT
        $token = JWTHandler::create([
            'id' => $user['id'],
            'name' => $user['nombre'],
            'email' => $user['email'],
            'role' => $user['rol']
        ]);

        // Preparar respuesta
        $responseData = [
            'user' => [
                'id' => $user['id'],
                'name' => $user['nombre'],
                'email' => $user['email'],
                'role' => $user['rol'],
                'phone' => $user['telefono'],
                'createdAt' => $user['fecha_creacion']
            ],
            'token' => $token
        ];

        Response::send(Response::success($responseData, 'Sesión iniciada exitosamente'));
    }

    /**
     * Cierre de sesión
     * POST /api/auth/logout
     * 
     * Nota: Con JWT, el logout es manejado en el frontend eliminando el token.
     * Este endpoint puede usarse para revocar tokens en una lista negra si es necesario.
     */
    public function logout() {
        // Verificar autenticación
        $userData = AuthMiddleware::verify();

        // Con JWT stateless, el logout es manejado en el cliente
        // Pero podemos registrar el evento
        error_log("User logout: " . $userData['id']);

        Response::send(Response::success(null, 'Sesión cerrada exitosamente'));
    }

    /**
     * Obtener perfil del usuario autenticado
     * GET /api/auth/me
     */
    public function getProfile() {
        $userData = AuthMiddleware::verify();

        $user = $this->userModel->getById($userData['id']);

        if (!$user) {
            Response::send(Response::notFound('Usuario no encontrado'));
        }

        $responseData = [
            'id' => $user['id'],
            'name' => $user['nombre'],
            'email' => $user['email'],
            'role' => $user['rol'],
            'phone' => $user['telefono'],
            'active' => (bool)$user['activo'],
            'createdAt' => $user['fecha_creacion'],
            'updatedAt' => $user['fecha_actualizacion']
        ];

        Response::send(Response::success($responseData, 'Perfil obtenido exitosamente'));
    }

    /**
     * Actualizar perfil del usuario
     * PUT /api/auth/me
     */
    public function updateProfile() {
        $userData = AuthMiddleware::verify();
        $data = RequestMiddleware::getJsonBody();

        // Solo permitir actualizar ciertos campos
        $allowedUpdates = [
            'nombre' => $data['name'] ?? null,
            'telefono' => $data['phone'] ?? null
        ];

        $updateData = array_filter($allowedUpdates, fn($v) => $v !== null);

        if (empty($updateData)) {
            Response::send(Response::error('No hay datos para actualizar', 400));
        }

        // Sanitizar
        $updateData = Validator::sanitize($updateData);

        // Actualizar usuario
        if (!$this->userModel->update($userData['id'], $updateData)) {
            Response::send(Response::serverError('Error al actualizar perfil'));
        }

        $user = $this->userModel->getById($userData['id']);

        $responseData = [
            'id' => $user['id'],
            'name' => $user['nombre'],
            'email' => $user['email'],
            'phone' => $user['telefono']
        ];

        Response::send(Response::success($responseData, 'Perfil actualizado exitosamente'));
    }

    /**
     * Cambiar contraseña
     * POST /api/auth/change-password
     */
    public function changePassword() {
        $userData = AuthMiddleware::verify();
        $data = RequestMiddleware::getJsonBody();

        if (empty($data['oldPassword']) || empty($data['newPassword'])) {
            Response::send(Response::error('Contraseña actual y nueva son requeridas', 400));
        }

        // Obtener usuario actual con contraseña
        $user = $this->userModel->getByEmail($userData['email']);

        // Verificar contraseña actual
        if (!$this->userModel->verifyPassword($data['oldPassword'], $user['contrasena'])) {
            Response::send(Response::error('Contraseña actual incorrecta', 401));
        }

        // Validar nueva contraseña
        if (!Validator::validatePassword($data['newPassword'])) {
            Response::send(Response::error('La contraseña no cumple los requisitos', 400, [
                'password' => 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'
            ]));
        }

        // Actualizar contraseña
        $hashedPassword = password_hash($data['newPassword'], PASSWORD_HASH_ALGO, PASSWORD_HASH_OPTIONS);
        $sql = "UPDATE usuarios SET contrasena = :password, fecha_actualizacion = NOW() WHERE id = :id";
        $result = Database::getInstance()->execute($sql, [
            ':password' => $hashedPassword,
            ':id' => $userData['id']
        ]);

        if (!$result['success']) {
            Response::send(Response::serverError('Error al cambiar contraseña'));
        }

        Response::send(Response::success(null, 'Contraseña actualizada exitosamente'));
    }
}

?>
