<?php
/**
 * ENDPOINT: REGISTRO DE USUARIO
 * POST /api/auth/register
 * 
 * Recibe:
 * {
 *   "name": "Juan García",
 *   "email": "juan@email.com",
 *   "password": "SecurePass123",
 *   "phone": "+57 3001234567",
 *   "role": "cliente"
 * }
 */

require_once '../../config/config.php';
require_once '../../config/Database.php';
require_once '../../utils/Response.php';
require_once '../../utils/Validator.php';
require_once '../../utils/JWTHandler.php';
require_once '../../middleware/AuthMiddleware.php';
require_once '../../middleware/RequestMiddleware.php';
require_once '../../models/User.php';
require_once '../../controllers/AuthController.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller = new AuthController();
        $response = $controller->register();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Register Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
