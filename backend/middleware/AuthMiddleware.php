<?php
/**
 * MIDDLEWARE AUTHENTICATION - PROTECCIÓN DE RUTAS
 * ================================================
 * 
 * Verifica que el usuario esté autenticado antes de acceder a rutas protegidas.
 * Utiliza JWT para validación stateless.
 */

class AuthMiddleware {
    /**
     * Verificar autenticación
     */
    public static function verify() {
        $token = JWTHandler::getTokenFromHeader();

        if (!$token) {
            Response::send(Response::unauthorized('Token no proporcionado'));
        }

        $userData = JWTHandler::verify($token);

        if (!$userData) {
            Response::send(Response::unauthorized('Token inválido o expirado'));
        }

        return $userData;
    }

    /**
     * Verificar que sea admin
     */
    public static function verifyAdmin() {
        $userData = self::verify();

        if ($userData['role'] !== 'admin') {
            Response::send(Response::forbidden('Se requieren permisos de administrador'));
        }

        return $userData;
    }

    /**
     * Verificar que sea conductor
     */
    public static function verifyDriver() {
        $userData = self::verify();

        if ($userData['role'] !== 'conductor' && $userData['role'] !== 'admin') {
            Response::send(Response::forbidden('Se requieren permisos de conductor'));
        }

        return $userData;
    }

    /**
     * Verificar que sea el propietario del recurso o admin
     */
    public static function verifyOwnerOrAdmin($resourceUserId) {
        $userData = self::verify();

        if ($userData['id'] !== $resourceUserId && $userData['role'] !== 'admin') {
            Response::send(Response::forbidden('No tienes permiso para acceder a este recurso'));
        }

        return $userData;
    }
}

?>
