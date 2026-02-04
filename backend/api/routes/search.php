<?php
/**
 * ENDPOINT: BÚSQUEDA DE RUTAS
 * GET /api/routes/search?origin=...&destination=...&page=1
 * 
 * Parámetros:
 * - origin: Dirección de origen (requerido)
 * - destination: Dirección de destino (requerido)
 * - page: Número de página (opcional, default: 1)
 * 
 * Ejemplo: /api/routes/search?origin=Terminal%20Centro&destination=Terminal%20Norte&page=1
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
        $response = $controller->search();
        Response::send($response);
    } else {
        Response::send(Response::error('Método no permitido', 405));
    }
} catch (Exception $e) {
    error_log('Search Routes Error: ' . $e->getMessage());
    Response::send(Response::serverError($e->getMessage()));
}

?>
