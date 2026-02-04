<?php
/**
 * CLASE VALIDATOR - VALIDACIÓN DE DATOS DE ENTRADA
 * ==================================================
 * 
 * Proporciona métodos para validar datos de formularios y API.
 */

class Validator {
    private static $errors = [];

    /**
     * Validar email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validar URL
     */
    public static function validateURL($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Validar que no esté vacío
     */
    public static function validateRequired($value, $fieldName) {
        if (empty(trim($value))) {
            self::$errors[$fieldName] = "$fieldName es requerido";
            return false;
        }
        return true;
    }

    /**
     * Validar longitud mínima
     */
    public static function validateMinLength($value, $length, $fieldName) {
        if (strlen(trim($value)) < $length) {
            self::$errors[$fieldName] = "$fieldName debe tener al menos $length caracteres";
            return false;
        }
        return true;
    }

    /**
     * Validar longitud máxima
     */
    public static function validateMaxLength($value, $length, $fieldName) {
        if (strlen(trim($value)) > $length) {
            self::$errors[$fieldName] = "$fieldName no puede exceder $length caracteres";
            return false;
        }
        return true;
    }

    /**
     * Validar número
     */
    public static function validateNumeric($value, $fieldName) {
        if (!is_numeric($value)) {
            self::$errors[$fieldName] = "$fieldName debe ser un número";
            return false;
        }
        return true;
    }

    /**
     * Validar teléfono
     */
    public static function validatePhone($phone) {
        // Patrón para teléfono internacional básico
        return preg_match('/^[\d\s\-\+\(\)]{7,}$/', $phone) === 1;
    }

    /**
     * Validar contraseña (mínimo 8 caracteres, una mayúscula, una minúscula, un número)
     */
    public static function validatePassword($password) {
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password) === 1;
    }

    /**
     * Limpiar dato (trim + htmlspecialchars)
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Escapar para SQL (DEPRECATED - usar prepared statements)
     * Se mantiene solo para compatibilidad
     */
    public static function escapeSql($data) {
        error_log('WARNING: escapeSql() is deprecated. Use prepared statements instead.');
        return addslashes($data);
    }

    /**
     * Obtener errores de validación
     */
    public static function getErrors() {
        return self::$errors;
    }

    /**
     * Limpiar errores
     */
    public static function clearErrors() {
        self::$errors = [];
    }

    /**
     * Comprobar si hay errores
     */
    public static function hasErrors() {
        return !empty(self::$errors);
    }

    /**
     * Validación completa de usuario (registro)
     */
    public static function validateUserRegistration($data) {
        self::clearErrors();

        self::validateRequired($data['name'] ?? '', 'name');
        self::validateRequired($data['email'] ?? '', 'email');
        self::validateRequired($data['password'] ?? '', 'password');

        if (!self::validateEmail($data['email'] ?? '')) {
            self::$errors['email'] = 'Email inválido';
        }

        if (!self::validatePassword($data['password'] ?? '')) {
            self::$errors['password'] = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
        }

        self::validateMinLength($data['name'] ?? '', 2, 'name');
        self::validateMaxLength($data['name'] ?? '', 100, 'name');

        if (isset($data['phone']) && !empty($data['phone'])) {
            if (!self::validatePhone($data['phone'])) {
                self::$errors['phone'] = 'Teléfono inválido';
            }
        }

        return !self::hasErrors();
    }

    /**
     * Validación completa de búsqueda de rutas
     */
    public static function validateRouteSearch($data) {
        self::clearErrors();

        self::validateRequired($data['origin'] ?? '', 'origin');
        self::validateRequired($data['destination'] ?? '', 'destination');

        self::validateMinLength($data['origin'] ?? '', 2, 'origin');
        self::validateMinLength($data['destination'] ?? '', 2, 'destination');

        self::validateMaxLength($data['origin'] ?? '', 255, 'origin');
        self::validateMaxLength($data['destination'] ?? '', 255, 'destination');

        return !self::hasErrors();
    }
}

?>
