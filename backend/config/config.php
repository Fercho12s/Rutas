<?php
/**
 * CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN
 * =========================================
 * 
 * Este archivo contiene todas las configuraciones básicas de la aplicación.
 * Incluye credenciales de base de datos, configuración de CORS, URL base, etc.
 */

// Configuración de base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'rutas_seguras');
define('DB_USER', 'root');
define('DB_PASS', ''); // Cambiar según tu configuración
define('DB_CHARSET', 'utf8mb4');

// Configuración de aplicación
define('APP_NAME', 'Rutas Seguras');
define('APP_VERSION', '1.0.0');
define('APP_ENVIRONMENT', 'development'); // development, staging, production

// URL base de la API
define('API_BASE_URL', 'http://localhost/rutasseguras/backend'); // Cambiar según tu servidor

// URL del frontend (para CORS)
define('FRONTEND_URL', 'https://agent-6983b0ed00331d--delightful-biscotti-2e62e6.netlify.app');

// Configuración de sesiones
define('SESSION_TIMEOUT', 3600); // 1 hora en segundos
define('SESSION_NAME', 'RUTAS_SEGURAS_SESSION');

// Configuración de seguridad
define('JWT_SECRET', 'tu_clave_secreta_super_segura_cambiar_en_produccion_2026'); // CAMBIAR EN PRODUCCIÓN
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 horas en segundos

// Configuración de contraseñas
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_OPTIONS', ['cost' => 12]); // Mayor costo = más seguro pero más lento

// Configuración de errores
define('DISPLAY_ERRORS', APP_ENVIRONMENT === 'development');
define('LOG_ERRORS', true);
define('ERROR_LOG_FILE', __DIR__ . '/../logs/error.log');

// Configuración de archivos
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 5242880); // 5MB en bytes

// Configuración de paginación
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Zonas horarias
date_default_timezone_set('America/Bogota'); // Cambiar según tu zona horaria

// Habilitar CORS
header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Establecer charset por defecto
header('Content-Type: application/json; charset=utf-8');

?>
