-- =====================================================
-- BASE DE DATOS: RUTAS SEGURAS
-- =====================================================
-- Script para crear la base de datos y todas las tablas
-- Ejecutar este script en tu servidor MySQL


-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS rutas_seguras;
USE rutas_seguras;

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'conductor', 'admin') NOT NULL DEFAULT 'cliente',
    telefono VARCHAR(20),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    distancia_km INT NOT NULL,
    duracion_estimada VARCHAR(50),
    estado ENUM('activo', 'en_curso', 'finalizado', 'inactivo') NOT NULL DEFAULT 'activo',
    usuario_id INT,
    activa TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_origen (origen),
    INDEX idx_destino (destino),
    INDEX idx_estado (estado),
    INDEX idx_activa (activa),
    INDEX idx_usuario_id (usuario_id),
    FULLTEXT INDEX ft_origen_destino (origen, destino)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de búsquedas de usuarios (historial)
CREATE TABLE IF NOT EXISTS historial_busquedas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    ruta_id INT,
    fecha_busqueda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_busqueda (fecha_busqueda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de reservas/boletos
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    ruta_id INT NOT NULL,
    numero_boleto VARCHAR(50) UNIQUE NOT NULL,
    asiento INT,
    precio DECIMAL(10, 2),
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
    fecha_viaje DATETIME,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ruta_id (ruta_id),
    INDEX idx_estado (estado),
    INDEX idx_numero_boleto (numero_boleto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de unidades/vehículos
CREATE TABLE IF NOT EXISTS unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL,
    ano INT NOT NULL,
    estado ENUM('disponible', 'en_viaje', 'mantenimiento', 'fuera_servicio') NOT NULL DEFAULT 'disponible',
    conductor_id INT,
    activa TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conductor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_placa (placa),
    INDEX idx_estado (estado),
    INDEX idx_conductor_id (conductor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla de tokens revocados (para logout)
CREATE TABLE IF NOT EXISTS tokens_revocados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    fecha_revocacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_fecha_revocacion (fecha_revocacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id INT,
    detalles TEXT,
    ip_address VARCHAR(45),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTAR DATOS DE PRUEBA
-- =====================================================

-- Insertar usuario admin de prueba
-- Email: admin@rutasseguras.com
-- Contraseña: Admin123456 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, contrasena, rol, telefono, activo) VALUES
('Administrador', 'admin@rutasseguras.com', '$2y$12$mIVVPPMRQqN2QSN0.3aO5.hUr08tBMdg6S4x2KVtWxEUqHqfvp3zy', 'admin', '+57 3001234567', 1);

-- Insertar usuario cliente de prueba
-- Email: cliente@rutasseguras.com
-- Contraseña: Cliente123456 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, contrasena, rol, telefono, activo) VALUES
('Juan García', 'cliente@rutasseguras.com', '$2y$12$mIVVPPMRQqN2QSN0.3aO5.hUr08tBMdg6S4x2KVtWxEUqHqfvp3zy', 'cliente', '+57 3009876543', 1);

-- Insertar usuario conductor de prueba
-- Email: conductor@rutasseguras.com
-- Contraseña: Conductor123456 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, contrasena, rol, telefono, activo) VALUES
('Carlos Rodríguez', 'conductor@rutasseguras.com', '$2y$12$mIVVPPMRQqN2QSN0.3aO5.hUr08tBMdg6S4x2KVtWxEUqHqfvp3zy', 'conductor', '+57 3005678901', 1);

-- Insertar rutas de prueba
INSERT INTO rutas (titulo, origen, destino, distancia_km, duracion_estimada, estado, usuario_id) VALUES
('Ruta Centro - Norte', 'Terminal Centro', 'Terminal Norte', 25, '45 min', 'activo', 1),
('Ruta Centro - Sur', 'Terminal Centro', 'Terminal Sur', 35, '60 min', 'activo', 1),
('Ruta Centro - Este', 'Terminal Centro', 'Terminal Este', 20, '35 min', 'activo', 1),
('Ruta Centro - Oeste', 'Terminal Centro', 'Terminal Oeste', 30, '50 min', 'activo', 1),
('Ruta Norte - Sur', 'Terminal Norte', 'Terminal Sur', 50, '90 min', 'activo', 1);

-- Insertar unidades de prueba
INSERT INTO unidades (placa, modelo, marca, capacidad, ano, estado, conductor_id) VALUES
('ABC123', 'Sprinter 311', 'Mercedes-Benz', 30, 2023, 'disponible', 3),
('DEF456', 'Hiace', 'Toyota', 20, 2022, 'disponible', NULL),
('GHI789', 'Jumpy', 'Citroën', 25, 2021, 'disponible', NULL);

-- =====================================================
-- CREAR ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
ALTER TABLE rutas ADD INDEX idx_origen_destino_estado (origen, destino, estado);
ALTER TABLE usuarios ADD INDEX idx_email_rol (email, rol);

-- Índices para agregaciones
ALTER TABLE reservas ADD INDEX idx_usuario_estado (usuario_id, estado);
ALTER TABLE historial_busquedas ADD INDEX idx_usuario_fecha (usuario_id, fecha_busqueda);

-- =====================================================
-- CREAR VISTAS ÚTILES
-- =====================================================

-- Vista: Rutas activas con información del conductor
CREATE OR REPLACE VIEW v_rutas_activas_conductores AS
SELECT 
    r.id,
    r.titulo,
    r.origen,
    r.destino,
    r.distancia_km,
    r.duracion_estimada,
    u.nombre as conductor,
    u.email as email_conductor,
    u.telefono as telefono_conductor
FROM rutas r
LEFT JOIN unidades un ON r.id = (SELECT id FROM unidades WHERE estado = 'en_viaje' LIMIT 1)
LEFT JOIN usuarios u ON un.conductor_id = u.id
WHERE r.activa = 1 AND r.estado = 'activo';

-- Vista: Estadísticas de usuarios
CREATE OR REPLACE VIEW v_estadisticas_usuarios AS
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN rol = 'cliente' THEN 1 ELSE 0 END) as total_clientes,
    SUM(CASE WHEN rol = 'conductor' THEN 1 ELSE 0 END) as total_conductores,
    SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as total_admins,
    COUNT(DISTINCT DATE(fecha_creacion)) as dias_activos
FROM usuarios
WHERE activo = 1;

-- Vista: Reservas pendientes por ruta
CREATE OR REPLACE VIEW v_reservas_pendientes AS
SELECT 
    r.id as ruta_id,
    r.titulo,
    r.origen,
    r.destino,
    COUNT(*) as reservas_pendientes,
    SUM(precio) as ingresos_potenciales
FROM reservas res
JOIN rutas r ON res.ruta_id = r.id
WHERE res.estado = 'pendiente'
GROUP BY r.id, r.titulo, r.origen, r.destino;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Cambiar esta contraseña después de crear el usuario admin:
-- Hash para contraseña "Admin123456": $2y$12$mIVVPPMRQqN2QSN0.3aO5.hUr08tBMdg6S4x2KVtWxEUqHqfvp3zy
--
-- Para generar tu propio hash en PHP:
-- echo password_hash("tu_contraseña", PASSWORD_BCRYPT, ['cost' => 12]);
