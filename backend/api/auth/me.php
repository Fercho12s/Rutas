<?php
/**
 * ENDPOINT: OBTENER PERFIL DEL USUARIO
 * GET /api/auth/me
 * 
 * Requiere: Header Authorization: Bearer <token>
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
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $controller = new AuthController();
        $response = $controller->getProfile();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Get Profile Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
