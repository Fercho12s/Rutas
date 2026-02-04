<?php
/**
 * ENDPOINT: CREAR RUTA (Admin)
 * POST /api/routes/create
 * 
 * Requiere: Header Authorization: Bearer <token> (admin)
 * 
 * Recibe:
 * {
 *   "title": "Ruta Centro - Norte",
 *   "origin": "Terminal Centro",
 *   "destination": "Terminal Norte",
 *   "distanceKm": 25,
 *   "duration": "45 min"
 * }
 */

require_once '../../config/config.php';
require_once '../../config/Database.php';
require_once '../../utils/Response.php';
require_once '../../utils/Validator.php';
require_once '../../utils/JWTHandler.php';
require_once '../../middleware/AuthMiddleware.php';
require_once '../../middleware/RequestMiddleware.php';
require_once '../../models/Route.php';
require_once '../../controllers/RouteController.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller = new RouteController();
        $response = $controller->create();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Create Route Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
