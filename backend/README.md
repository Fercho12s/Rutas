# 🚌 Rutas Seguras - Backend PHP

Backend profesional y seguro para la aplicación de transporte "Rutas Seguras".

## 🚀 Quick Start

### 1. Requisitos
- PHP >= 7.4
- MySQL >= 5.7
- Servidor web (Apache/Nginx)

### 2. Instalación (5 minutos)

```bash
# 1. Copiar carpeta backend a tu servidor

# 2. Crear base de datos
mysql -u root -p < db_schema.sql

# 3. Editar configuración
# Abre: config/config.php
# Cambiar líneas 8-12: credenciales MySQL
# Cambiar líneas 19-20: URLs

# 4. Crear carpetas logs y uploads
mkdir logs uploads
chmod 755 logs uploads

# 5. ¡Listo! Accede a:
# http://tu-servidor/backend/api/auth/login (POST)
```

### 3. Prueba rápida

```bash
# Registro
curl -X POST http://localhost/backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@email.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@email.com",
    "password": "SecurePass123"
  }'

# Buscar rutas
curl -X GET "http://localhost/backend/api/routes/search?origin=Centro&destination=Norte"
```

## 📁 Estructura

```
backend/
├── api/              # Endpoints REST
├── config/           # Configuración
├── controllers/      # Lógica de negocio
├── models/           # BD
├── middleware/       # Autenticación
├── utils/            # Helpers
└── db_schema.sql     # Base de datos
```

## 📚 Documentación Completa

👉 Ver: `DOCUMENTACION_COMPLETA.md`

Contiene:
- Arquitectura detallada
- Todos los endpoints
- Ejemplos React (fetch + axios)
- Deployment en 3 opciones
- Troubleshooting
- Seguridad explicada

## 🔌 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener perfil |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/routes/search` | Buscar rutas |
| POST | `/api/routes/create` | Crear ruta (admin) |
| GET | `/api/routes/suggestions/origins` | Sugerencias origen |
| GET | `/api/routes/suggestions/destinations` | Sugerencias destino |

## 🔒 Seguridad

✅ JWT con expiración  
✅ Contraseñas hasheadas (BCRYPT)  
✅ Validación de entrada  
✅ Prepared statements (SQL Injection protegido)  
✅ CORS configurado  
✅ Middleware de autenticación  

## 🧪 Datos de Prueba

```
Email: admin@rutasseguras.com
Password: Admin123456

Email: cliente@rutasseguras.com
Password: Cliente123456

Email: conductor@rutasseguras.com
Password: Conductor123456
```

## 📱 Integración React

```javascript
// Uso simple con fetch
const response = await fetch('http://tu-backend/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

Ver ejemplos completos en: `DOCUMENTACION_COMPLETA.md`

## 🚀 Deployment

**Opción 1 (Recomendado):** Hosting compartido (Hostinger, Bluehost)  
**Opción 2:** VPS + Apache (DigitalOcean, Linode)  
**Opción 3:** Docker (Avanzado)  

Instrucciones detalladas en `DOCUMENTACION_COMPLETA.md`

## ❓ Problemas Comunes

**CORS Error:** Revisar FRONTEND_URL en config.php  
**Token inválido:** Ejecutar logout para limpiar localStorage  
**BD no conecta:** Verificar credenciales en config.php  

Más en: `DOCUMENTACION_COMPLETA.md` sección Troubleshooting

## 📧 Soporte

Contacto: info@rutasseguras.com

---

**Desarrollado con PHP + MySQL + ❤️**

