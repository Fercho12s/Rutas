<?php
/**
 * CLASE DATABASE - GESTIÓN DE CONEXIÓN A BASE DE DATOS
 * =====================================================
 * 
 * Esta clase maneja la conexión a la base de datos usando PDO.
 * Proporciona métodos para ejecutar queries y manejo de errores.
 * Patrón: Singleton para garantizar una única conexión.
 */

class Database {
    private static $instance = null;
    private $connection;
    private $lastError;

    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ':' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log('Database Connection Error: ' . $e->getMessage());
            throw new Exception('Error de conexión a base de datos');
        }
    }

    /**
     * Obtener instancia única de la conexión (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Obtener la conexión PDO
     */
    public function getConnection() {
        return $this->connection;
    }

    /**
     * Ejecutar un query SELECT
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log('Database Query Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Ejecutar un query SELECT que devuelve UN registro
     */
    public function queryOne($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log('Database Query Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Ejecutar INSERT, UPDATE, DELETE
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->execute($params);
            return [
                'success' => $result,
                'lastId' => $this->connection->lastInsertId(),
                'rowCount' => $stmt->rowCount()
            ];
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log('Database Execute Error: ' . $e->getMessage());
            return [
                'success' => false,
                'lastId' => null,
                'rowCount' => 0,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Iniciar una transacción
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Confirmar una transacción
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Revertir una transacción
     */
    public function rollBack() {
        return $this->connection->rollBack();
    }

    /**
     * Obtener último error
     */
    public function getLastError() {
        return $this->lastError;
    }

    /**
     * Prevenir clonación del singleton
     */
    private function __clone() {}

    /**
     * Prevenir serialización del singleton
     */
    public function __sleep() {
        throw new Exception('No se puede serializar una conexión de base de datos');
    }
}

?>
