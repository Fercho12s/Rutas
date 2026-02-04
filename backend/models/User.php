<?php
/**
 * MODELO USER - OPERACIONES CON USUARIOS
 * =======================================
 * 
 * Maneja todas las operaciones relacionadas con usuarios:
 * - Crear usuario (registro)
 * - Obtener usuario por ID o email
 * - Actualizar usuario
 * - Eliminar usuario
 */

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Crear nuevo usuario
     */
    public function create($name, $email, $password, $role = 'cliente', $phone = null) {
        $hashedPassword = password_hash($password, PASSWORD_HASH_ALGO, PASSWORD_HASH_OPTIONS);

        $sql = "INSERT INTO usuarios (nombre, email, contrasena, rol, telefono, activo, fecha_creacion) 
                VALUES (:name, :email, :password, :role, :phone, 1, NOW())";

        $result = $this->db->execute($sql, [
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':role' => $role,
            ':phone' => $phone
        ]);

        if ($result['success']) {
            return $this->getById($result['lastId']);
        }

        return null;
    }

    /**
     * Obtener usuario por ID
     */
    public function getById($id) {
        $sql = "SELECT id, nombre, email, rol, telefono, activo, fecha_creacion, fecha_actualizacion 
                FROM usuarios WHERE id = :id AND activo = 1";

        return $this->db->queryOne($sql, [':id' => $id]);
    }

    /**
     * Obtener usuario por email
     */
    public function getByEmail($email) {
        $sql = "SELECT id, nombre, email, contrasena, rol, telefono, activo, fecha_creacion 
                FROM usuarios WHERE email = :email AND activo = 1";

        return $this->db->queryOne($sql, [':email' => $email]);
    }

    /**
     * Verificar contraseña
     */
    public function verifyPassword($plainPassword, $hashedPassword) {
        return password_verify($plainPassword, $hashedPassword);
    }

    /**
     * Actualizar usuario
     */
    public function update($id, $data) {
        $allowedFields = ['nombre', 'telefono', 'rol'];
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
        $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = :id";

        $result = $this->db->execute($sql, $params);
        return $result['success'];
    }

    /**
     * Eliminar usuario (soft delete)
     */
    public function delete($id) {
        $sql = "UPDATE usuarios SET activo = 0, fecha_actualizacion = NOW() WHERE id = :id";
        $result = $this->db->execute($sql, [':id' => $id]);
        return $result['success'];
    }

    /**
     * Obtener todos los usuarios
     */
    public function getAll($page = 1, $limit = DEFAULT_PAGE_SIZE) {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT id, nombre, email, rol, telefono, activo, fecha_creacion 
                FROM usuarios WHERE activo = 1 
                ORDER BY fecha_creacion DESC 
                LIMIT :limit OFFSET :offset";

        return $this->db->query($sql, [
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Contar total de usuarios
     */
    public function countAll() {
        $sql = "SELECT COUNT(*) as total FROM usuarios WHERE activo = 1";
        $result = $this->db->queryOne($sql);
        return $result['total'] ?? 0;
    }

    /**
     * Verificar si email existe
     */
    public function emailExists($email, $excludeId = null) {
        $sql = "SELECT COUNT(*) as total FROM usuarios WHERE email = :email AND activo = 1";
        $params = [':email' => $email];

        if ($excludeId) {
            $sql .= " AND id != :excludeId";
            $params[':excludeId'] = $excludeId;
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'] > 0;
    }

    /**
     * Obtener usuarios por rol
     */
    public function getByRole($role, $page = 1, $limit = DEFAULT_PAGE_SIZE) {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT id, nombre, email, rol, telefono, activo, fecha_creacion 
                FROM usuarios WHERE rol = :role AND activo = 1 
                ORDER BY fecha_creacion DESC 
                LIMIT :limit OFFSET :offset";

        return $this->db->query($sql, [
            ':role' => $role,
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }
}

?>
