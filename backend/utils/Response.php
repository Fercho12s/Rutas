<?php
/**
 * CLASE RESPONSE - MANEJO ESTANDARIZADO DE RESPUESTAS
 * ===================================================
 * 
 * Proporciona métodos estáticos para enviar respuestas consistentes
 * en formato JSON con códigos HTTP apropiados.
 */

class Response {
    /**
     * Respuesta de éxito
     */
    public static function success($data = null, $message = 'Operación exitosa', $statusCode = 200) {
        http_response_code($statusCode);
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Respuesta de error
     */
    public static function error($message = 'Error en la operación', $statusCode = 400, $errors = null) {
        http_response_code($statusCode);
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return json_encode($response);
    }

    /**
     * Error de autenticación
     */
    public static function unauthorized($message = 'No autorizado') {
        return self::error($message, 401);
    }

    /**
     * Error de permisos
     */
    public static function forbidden($message = 'Acceso denegado') {
        return self::error($message, 403);
    }

    /**
     * Recurso no encontrado
     */
    public static function notFound($message = 'Recurso no encontrado') {
        return self::error($message, 404);
    }

    /**
     * Error de validación
     */
    public static function validationError($errors) {
        return self::error('Errores de validación', 422, $errors);
    }

    /**
     * Error del servidor
     */
    public static function serverError($message = 'Error interno del servidor') {
        return self::error($message, 500);
    }

    /**
     * Enviar respuesta (output directo)
     */
    public static function send($data) {
        echo $data;
        exit();
    }
}

?>
