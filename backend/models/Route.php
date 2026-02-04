<?php
/**
 * MODELO ROUTE - OPERACIONES CON RUTAS/BÚSQUEDAS
 * ===============================================
 * 
 * Maneja todas las operaciones relacionadas con rutas:
 * - Crear ruta
 * - Buscar rutas por origen y destino
 * - Obtener ruta por ID
 * - Actualizar ruta
 * - Eliminar ruta
 */

class Route {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Crear nueva ruta
     */
    public function create($title, $origin, $destination, $distanceKm, $duration = null, $userId = null) {
        $sql = "INSERT INTO rutas (titulo, origen, destino, distancia_km, duracion_estimada, usuario_id, fecha_creacion) 
                VALUES (:title, :origin, :destination, :distance, :duration, :userId, NOW())";

        $result = $this->db->execute($sql, [
            ':title' => $title,
            ':origin' => $origin,
            ':destination' => $destination,
            ':distance' => $distanceKm,
            ':duration' => $duration,
            ':userId' => $userId
        ]);

        if ($result['success']) {
            return $this->getById($result['lastId']);
        }

        return null;
    }

    /**
     * Buscar rutas por origen y destino
     */
    public function search($origin, $destination, $page = 1, $limit = DEFAULT_PAGE_SIZE) {
        $offset = ($page - 1) * $limit;

        // Búsqueda con LIKE para permitir coincidencias parciales
        $sql = "SELECT id, titulo, origen, destino, distancia_km, duracion_estimada, estado, 
                        fecha_creacion, usuario_id
                FROM rutas 
                WHERE (origen LIKE :origin OR destino LIKE :destination) 
                AND activa = 1
                ORDER BY fecha_creacion DESC 
                LIMIT :limit OFFSET :offset";

        return $this->db->query($sql, [
            ':origin' => '%' . $origin . '%',
            ':destination' => '%' . $destination . '%',
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Contar resultados de búsqueda
     */
    public function countSearch($origin, $destination) {
        $sql = "SELECT COUNT(*) as total FROM rutas 
                WHERE (origen LIKE :origin OR destino LIKE :destination) 
                AND activa = 1";

        $result = $this->db->queryOne($sql, [
            ':origin' => '%' . $origin . '%',
            ':destination' => '%' . $destination . '%'
        ]);

        return $result['total'] ?? 0;
    }

    /**
     * Obtener ruta por ID
     */
    public function getById($id) {
        $sql = "SELECT id, titulo, origen, destino, distancia_km, duracion_estimada, estado, 
                        fecha_creacion, usuario_id
                FROM rutas WHERE id = :id AND activa = 1";

        return $this->db->queryOne($sql, [':id' => $id]);
    }

    /**
     * Obtener todas las rutas
     */
    public function getAll($page = 1, $limit = DEFAULT_PAGE_SIZE) {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT id, titulo, origen, destino, distancia_km, duracion_estimada, estado, 
                        fecha_creacion, usuario_id
                FROM rutas WHERE activa = 1 
                ORDER BY fecha_creacion DESC 
                LIMIT :limit OFFSET :offset";

        return $this->db->query($sql, [
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Contar total de rutas
     */
    public function countAll() {
        $sql = "SELECT COUNT(*) as total FROM rutas WHERE activa = 1";
        $result = $this->db->queryOne($sql);
        return $result['total'] ?? 0;
    }

    /**
     * Actualizar ruta
     */
    public function update($id, $data) {
        $allowedFields = ['titulo', 'origen', 'destino', 'distancia_km', 'duracion_estimada', 'estado'];
        $updates = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($updates)) {
            return true;
        }

        $updates[] = "fecha_actualizacion = NOW()";
        $sql = "UPDATE rutas SET " . implode(', ', $updates) . " WHERE id = :id AND activa = 1";

        $result = $this->db->execute($sql, $params);
        return $result['success'];
    }

    /**
     * Eliminar ruta (soft delete)
     */
    public function delete($id) {
        $sql = "UPDATE rutas SET activa = 0, fecha_actualizacion = NOW() WHERE id = :id";
        $result = $this->db->execute($sql, [':id' => $id]);
        return $result['success'];
    }

    /**
     * Obtener rutas por usuario
     */
    public function getByUserId($userId, $page = 1, $limit = DEFAULT_PAGE_SIZE) {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT id, titulo, origen, destino, distancia_km, duracion_estimada, estado, 
                        fecha_creacion
                FROM rutas 
                WHERE usuario_id = :userId AND activa = 1 
                ORDER BY fecha_creacion DESC 
                LIMIT :limit OFFSET :offset";

        return $this->db->query($sql, [
            ':userId' => $userId,
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Obtener rutas populares (más buscadas)
     */
    public function getPopular($limit = 10) {
        $sql = "SELECT id, titulo, origen, destino, distancia_km, duracion_estimada, estado, 
                        fecha_creacion, COUNT(*) as search_count
                FROM rutas 
                WHERE activa = 1
                GROUP BY id, titulo, origen, destino, distancia_km, duracion_estimada, estado, fecha_creacion
                ORDER BY search_count DESC 
                LIMIT :limit";

        return $this->db->query($sql, [':limit' => $limit]);
    }

    /**
     * Obtener originales únicos (para sugerencias)
     */
    public function getUniqueOrigins() {
        $sql = "SELECT DISTINCT origen FROM rutas WHERE activa = 1 ORDER BY origen ASC";
        return $this->db->query($sql);
    }

    /**
     * Obtener destinos únicos (para sugerencias)
     */
    public function getUniqueDestinations() {
        $sql = "SELECT DISTINCT destino FROM rutas WHERE activa = 1 ORDER BY destino ASC";
        return $this->db->query($sql);
    }
}

?>
