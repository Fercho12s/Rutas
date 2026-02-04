<?php
/**
 * CLASE JWTHANDLER - MANEJO DE JWT (JSON WEB TOKENS)
 * ===================================================
 * 
 * Genera y valida JWT para autenticación sin estado (stateless).
 * Utiliza HS256 como algoritmo de firma.
 */

class JWTHandler {
    /**
     * Crear un JWT
     */
    public static function create($data, $expiresIn = JWT_EXPIRATION) {
        $now = time();
        $payload = [
            'iss' => API_BASE_URL,
            'iat' => $now,
            'exp' => $now + $expiresIn,
            'data' => $data
        ];

        $header = self::base64UrlEncode(json_encode(['alg' => JWT_ALGORITHM, 'typ' => 'JWT']));
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(self::sign($header . '.' . $payload));

        return $header . '.' . $payload . '.' . $signature;
    }

    /**
     * Verificar y decodificar JWT
     */
    public static function verify($token) {
        try {
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                return null;
            }

            $header = $parts[0];
            $payload = $parts[1];
            $signature = $parts[2];

            // Verificar firma
            $expectedSignature = self::base64UrlEncode(self::sign($header . '.' . $payload));
            if ($signature !== $expectedSignature) {
                return null;
            }

            // Decodificar payload
            $decoded = json_decode(self::base64UrlDecode($payload), true);

            // Verificar expiración
            if ($decoded['exp'] < time()) {
                return null;
            }

            return $decoded['data'];
        } catch (Exception $e) {
            error_log('JWT Verification Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Firmar datos con HMAC SHA256
     */
    private static function sign($data) {
        return hash_hmac('sha256', $data, JWT_SECRET, true);
    }

    /**
     * Codificación base64url
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodificación base64url
     */
    private static function base64UrlDecode($data) {
        $padding = 4 - (strlen($data) % 4);
        if ($padding !== 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Obtener token del header Authorization
     */
    public static function getTokenFromHeader() {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            return null;
        }

        $parts = explode(' ', $headers['Authorization']);
        
        if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
            return null;
        }

        return $parts[1];
    }
}

?>
