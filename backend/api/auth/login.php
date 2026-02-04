<?php
/**
 * ENDPOINT: INICIO DE SESIÓN
 * POST /api/auth/login
 * 
 * Recibe:
 * {
 *   "email": "juan@email.com",
 *   "password": "SecurePass123"
 * }
 * 
 * Devuelve JWT token
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
        $response = $controller->login();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Login Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
