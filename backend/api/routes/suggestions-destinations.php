<?php
/**
 * ENDPOINT: OBTENER SUGERENCIAS DE DESTINO
 * GET /api/routes/suggestions/destinations
 * 
 * Devuelve lista de destinos únicos disponibles
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
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $controller = new RouteController();
        $response = $controller->suggestDestinations();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Get Destinations Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
