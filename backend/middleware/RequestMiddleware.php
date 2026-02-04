<?php
/**
 * MIDDLEWARE REQUEST - PROCESAMIENTO DE REQUESTS
 * ===============================================
 * 
 * Procesa y valida las requests antes de que lleguen a los controladores.
 */

class RequestMiddleware {
    /**
     * Obtener datos JSON del request body
     */
    public static function getJsonBody() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Response::send(Response::error('JSON inválido en el body', 400));
        }

        return $data ?? [];
    }

    /**
     * Obtener parámetro GET
     */
    public static function getParam($name, $default = null, $sanitize = true) {
        $value = $_GET[$name] ?? $default;
        return $sanitize ? Validator::sanitize($value) : $value;
    }

    /**
     * Obtener método HTTP
     */
    public static function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Verificar método HTTP
     */
    public static function isMethod($method) {
        return self::getMethod() === strtoupper($method);
    }

    /**
     * Obtener ruta de la request
     */
    public static function getPath() {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $basePath = '/rutasseguras/backend/api'; // Cambiar según tu configuración
        
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }

        return '/' . ltrim($path, '/');
    }

    /**
     * Obtener query parameters
     */
    public static function getQuery($name = null, $default = null) {
        if ($name === null) {
            return $_GET;
        }
        return $_GET[$name] ?? $default;
    }
}

?>
