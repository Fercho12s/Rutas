<?php
/**
 * CONTROLADOR ROUTE - GESTIÓN DE RUTAS
 * ====================================
 * 
 * Maneja los endpoints de:
 * - Buscar rutas
 * - Crear rutas
 * - Obtener rutas
 * - Actualizar rutas
 * - Eliminar rutas
 */

class RouteController {
    private $routeModel;

    public function __construct() {
        $this->routeModel = new Route();
    }

    /**
     * Buscar rutas por origen y destino
     * GET /api/routes/search?origin=...&destination=...&page=1
     */
    public function search() {
        $origin = RequestMiddleware::getParam('origin');
        $destination = RequestMiddleware::getParam('destination');
        $page = (int)(RequestMiddleware::getParam('page', 1));

        // Validar entrada
        if (!Validator::validateRouteSearch([
            'origin' => $origin,
            'destination' => $destination
        ])) {
            Response::send(Response::validationError(Validator::getErrors()));
        }

        // Limitar página
        $page = max(1, min($page, 1000));

        // Buscar rutas
        $routes = $this->routeModel->search($origin, $destination, $page);
        $total = $this->routeModel->countSearch($origin, $destination);
        $limit = DEFAULT_PAGE_SIZE;

        $responseData = [
            'routes' => $routes,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'items_per_page' => $limit
            ],
            'query' => [
                'origin' => $origin,
                'destination' => $destination
            ]
        ];

        Response::send(Response::success($responseData, 'Búsqueda realizada exitosamente'));
    }

    /**
     * Crear nueva ruta
     * POST /api/routes
     */
    public function create() {
        $userData = AuthMiddleware::verifyAdmin();
        $data = RequestMiddleware::getJsonBody();

        // Validar datos
        if (empty($data['title']) || empty($data['origin']) || empty($data['destination']) || !isset($data['distanceKm'])) {
            Response::send(Response::error('Campos requeridos: title, origin, destination, distanceKm', 400));
        }

        // Sanitizar
        $data = Validator::sanitize($data);

        // Crear ruta
        $route = $this->routeModel->create(
            $data['title'],
            $data['origin'],
            $data['destination'],
            (int)$data['distanceKm'],
            $data['duration'] ?? null,
            $userData['id']
        );

        if (!$route) {
            Response::send(Response::serverError('Error al crear la ruta'));
        }

        Response::send(Response::success($route, 'Ruta creada exitosamente', 201));
    }

    /**
     * Obtener todas las rutas (admin)
     * GET /api/routes?page=1
     */
    public function getAll() {
        AuthMiddleware::verifyAdmin();

        $page = (int)(RequestMiddleware::getParam('page', 1));
        $page = max(1, min($page, 1000));

        $routes = $this->routeModel->getAll($page);
        $total = $this->routeModel->countAll();
        $limit = DEFAULT_PAGE_SIZE;

        $responseData = [
            'routes' => $routes,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'items_per_page' => $limit
            ]
        ];

        Response::send(Response::success($responseData, 'Rutas obtenidas exitosamente'));
    }

    /**
     * Obtener ruta por ID
     * GET /api/routes/:id
     */
    public function getById($id) {
        $route = $this->routeModel->getById($id);

        if (!$route) {
            Response::send(Response::notFound('Ruta no encontrada'));
        }

        Response::send(Response::success($route, 'Ruta obtenida exitosamente'));
    }

    /**
     * Actualizar ruta
     * PUT /api/routes/:id
     */
    public function update($id) {
        $userData = AuthMiddleware::verifyAdmin();
        $data = RequestMiddleware::getJsonBody();

        // Verificar que la ruta exista
        $route = $this->routeModel->getById($id);
        if (!$route) {
            Response::send(Response::notFound('Ruta no encontrada'));
        }

        // Sanitizar
        $data = Validator::sanitize($data);

        // Actualizar
        if (!$this->routeModel->update($id, $data)) {
            Response::send(Response::serverError('Error al actualizar la ruta'));
        }

        $updatedRoute = $this->routeModel->getById($id);
        Response::send(Response::success($updatedRoute, 'Ruta actualizada exitosamente'));
    }

    /**
     * Eliminar ruta
     * DELETE /api/routes/:id
     */
    public function delete($id) {
        $userData = AuthMiddleware::verifyAdmin();

        // Verificar que la ruta exista
        $route = $this->routeModel->getById($id);
        if (!$route) {
            Response::send(Response::notFound('Ruta no encontrada'));
        }

        // Eliminar
        if (!$this->routeModel->delete($id)) {
            Response::send(Response::serverError('Error al eliminar la ruta'));
        }

        Response::send(Response::success(null, 'Ruta eliminada exitosamente'));
    }

    /**
     * Obtener rutas populares
     * GET /api/routes/popular
     */
    public function getPopular() {
        $limit = (int)(RequestMiddleware::getParam('limit', 10));
        $limit = min($limit, 50); // Máximo 50

        $routes = $this->routeModel->getPopular($limit);

        Response::send(Response::success($routes, 'Rutas populares obtenidas exitosamente'));
    }

    /**
     * Obtener sugerencias de origen
     * GET /api/routes/suggestions/origins
     */
    public function suggestOrigins() {
        $origins = $this->routeModel->getUniqueOrigins();

        Response::send(Response::success($origins, 'Orígenes obtenidos exitosamente'));
    }

    /**
     * Obtener sugerencias de destino
     * GET /api/routes/suggestions/destinations
     */
    public function suggestDestinations() {
        $destinations = $this->routeModel->getUniqueDestinations();

        Response::send(Response::success($destinations, 'Destinos obtenidos exitosamente'));
    }
}

?>
