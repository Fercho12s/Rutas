# 📘 GUÍA COMPLETA - RUTAS SEGURAS BACKEND (PHP)

## 📋 ÍNDICE DE CONTENIDOS

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Base de Datos](#base-de-datos)
5. [Endpoints API](#endpoints-api)
6. [Ejemplos de Integración React](#ejemplos-de-integración-react)
7. [Seguridad Implementada](#seguridad-implementada)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARQUITECTURA GENERAL

### Concepto

"Rutas Seguras Backend" es una API REST desarrollada en PHP con MySQL que proporciona:

- ✅ **Autenticación segura** con JWT (JSON Web Tokens)
- ✅ **Gestión de usuarios** (registro, login, perfil)
- ✅ **Búsqueda y gestión de rutas**
- ✅ **Base de datos relacional** normalizada
- ✅ **CORS habilitado** para conectarse desde Netlify
- ✅ **Validación de datos** en entrada
- ✅ **Manejo de errores** robusto

### Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO (React)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
         1. POST /api/auth/register → email + password
         2. Validación en Backend (PHP)
         3. Hash contraseña con BCRYPT
         4. Guardar en BD MySQL
         5. Generar JWT Token
         6. Devolver token + datos usuario
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LocalStorage (Frontend)                          │
│     { token: "eyJhbG...", user: {id, name, role} }          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
     7. Próximas requests con Header:
        Authorization: Bearer eyJhbG...
                              │
                              ▼
         Backend verifica JWT, extrae userData
         Procesan la request si es válida
                              │
                              ▼
        Devuelven respuesta JSON

```

---

## 📁 ESTRUCTURA DE CARPETAS

```
backend/
├── api/                           # Endpoints REST
│   ├── auth/
│   │   ├── register.php           # POST - Registro
│   │   ├── login.php              # POST - Login
│   │   ├── logout.php             # POST - Logout
│   │   └── me.php                 # GET - Perfil actual
│   └── routes/
│       ├── search.php             # GET - Buscar rutas
│       ├── create.php             # POST - Crear ruta
│       ├── suggestions-origins.php    # GET - Sugerencias origen
│       └── suggestions-destinations.php  # GET - Sugerencias destino
│
├── config/
│   ├── config.php                 # ⚙️ Configuración principal
│   └── Database.php               # 🔌 Conexión BD (Singleton)
│
├── controllers/
│   ├── AuthController.php         # Lógica autenticación
│   └── RouteController.php        # Lógica rutas
│
├── models/
│   ├── User.php                   # Operaciones usuarios
│   └── Route.php                  # Operaciones rutas
│
├── middleware/
│   ├── AuthMiddleware.php         # Verificar JWT
│   └── RequestMiddleware.php      # Procesar requests
│
├── utils/
│   ├── Response.php               # Respuestas JSON
│   ├── Validator.php              # Validación datos
│   └── JWTHandler.php             # Generar/verificar JWT
│
├── logs/                          # 📝 Archivo de errores
│   └── error.log
│
├── uploads/                       # 📸 Archivos subidos
│
└── db_schema.sql                  # 🗄️ Script BD MySQL
```

---

## ⚙️ INSTALACIÓN Y CONFIGURACIÓN

### PASO 1: Requisitos Previos

Necesitas tener instalado:
- **PHP >= 7.4** (recomendado 8.0+)
- **MySQL >= 5.7**
- **Composer** (opcional, para futuras dependencias)

### PASO 2: Configuración de Base de Datos

1. Abre tu cliente MySQL (phpMyAdmin, MySQL Workbench, etc.)

2. Crea una nueva BD ejecutando el script `db_schema.sql`:
   ```bash
   mysql -u root -p < db_schema.sql
   ```
   O cópialo en phpMyAdmin y ejecútalo

3. Edita `config/config.php` con tus credenciales:

```php
// Líneas 8-12 en config/config.php
define('DB_HOST', 'localhost');    // Cambiar si es remoto
define('DB_PORT', 3306);
define('DB_NAME', 'rutas_seguras');
define('DB_USER', 'root');         // Tu usuario MySQL
define('DB_PASS', '');             // Tu contraseña MySQL
```

### PASO 3: Configurar URLs

Edita `config/config.php` líneas 19-20:

```php
// Cambiar según donde despliegues (localhost, servidor, etc)
define('API_BASE_URL', 'http://localhost/rutasseguras/backend');

// URL de tu frontend (Netlify)
define('FRONTEND_URL', 'https://agent-6983b0ed00331d--delightful-biscotti-2e62e6.netlify.app');
```

### PASO 4: Crear Carpetas Necesarias

```bash
mkdir logs
mkdir uploads
chmod 755 logs uploads
```

### PASO 5: Probar Conexión

Crea un archivo `test.php` en la carpeta raíz del backend:

```php
<?php
require_once 'config/config.php';
require_once 'config/Database.php';

try {
    $db = Database::getInstance();
    $test = $db->queryOne("SELECT COUNT(*) as count FROM usuarios");
    echo "✅ Conexión exitosa. Total usuarios: " . $test['count'];
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

Accede a: `http://localhost/rutasseguras/backend/test.php`

---

## 🗄️ BASE DE DATOS

### Tablas Principales

#### 1. **usuarios**
Almacena información de usuarios registrados
```sql
id              INT (Primary Key)
nombre          VARCHAR(100)
email           VARCHAR(100) - Unique
contrasena      VARCHAR(255) - Hasheada
rol             ENUM('cliente', 'conductor', 'admin')
telefono        VARCHAR(20)
activo          TINYINT(1)
fecha_creacion  TIMESTAMP
```

#### 2. **rutas**
Almacena las rutas disponibles
```sql
id                      INT (Primary Key)
titulo                  VARCHAR(255)
origen                  VARCHAR(255)
destino                 VARCHAR(255)
distancia_km            INT
duracion_estimada       VARCHAR(50)
estado                  ENUM('activo', 'en_curso', ...)
usuario_id              INT (FK - usuarios)
activa                  TINYINT(1)
fecha_creacion          TIMESTAMP
```

#### 3. **historial_busquedas**
Registra las búsquedas realizadas por usuarios
```sql
id              INT (Primary Key)
usuario_id      INT (FK - usuarios)
origen          VARCHAR(255)
destino         VARCHAR(255)
ruta_id         INT (FK - rutas)
fecha_busqueda  TIMESTAMP
```

#### 4. **reservas**
Gestiona las reservas/boletos de usuarios
```sql
id              INT (Primary Key)
usuario_id      INT (FK - usuarios)
ruta_id         INT (FK - rutas)
numero_boleto   VARCHAR(50) - Unique
asiento         INT
precio          DECIMAL(10,2)
estado          ENUM(pendiente, confirmada, ...)
fecha_viaje     DATETIME
```

#### 5. **unidades**
Gestiona vehículos de la flota
```sql
id              INT (Primary Key)
placa           VARCHAR(20) - Unique
modelo          VARCHAR(100)
marca           VARCHAR(100)
capacidad       INT
ano             INT
estado          ENUM(disponible, en_viaje, ...)
conductor_id    INT (FK - usuarios)
```

### Relaciones

```
┌──────────────┐
│   usuarios   │ (1)
└──────┬───────┘
       │ 1:N
       │
    ┌──┴───────────────┬────────────────┬────────────────┐
    │                  │                │                │
    ▼                  ▼                ▼                ▼
┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────┐
│   rutas    │  │  reservas   │  │   unidades   │  │historial │
│   (1:N)    │  │   (1:N)     │  │   (1:N)      │  │(1:N)     │
└────────────┘  └─────────────┘  └──────────────┘  └──────────┘
```

---

## 🔌 ENDPOINTS API

### 1️⃣ AUTENTICACIÓN

#### Registrar Usuario
```
POST /api/auth/register

Headers:
Content-Type: application/json

Body:
{
  "name": "Juan García",
  "email": "juan@email.com",
  "password": "SecurePass123",  // Min 8 chars, mayús, minús, número
  "phone": "+57 3001234567",    // Opcional
  "role": "cliente"              // Opcional, default: cliente
}

Response (201 Created):
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 5,
      "name": "Juan García",
      "email": "juan@email.com",
      "role": "cliente",
      "phone": "+57 3001234567",
      "createdAt": "2026-02-04 10:30:45"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Iniciar Sesión
```
POST /api/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "juan@email.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "success": true,
  "message": "Sesión iniciada exitosamente",
  "data": {
    "user": {
      "id": 5,
      "name": "Juan García",
      "email": "juan@email.com",
      "role": "cliente",
      "phone": "+57 3001234567",
      "createdAt": "2026-02-04 10:30:45"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Cierre de Sesión
```
POST /api/auth/logout

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Response (200 OK):
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "data": null,
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Obtener Perfil
```
GET /api/auth/me

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": 5,
    "name": "Juan García",
    "email": "juan@email.com",
    "role": "cliente",
    "phone": "+57 3001234567",
    "active": true,
    "createdAt": "2026-02-04 10:30:45",
    "updatedAt": "2026-02-04 10:30:45"
  },
  "timestamp": "2026-02-04 10:30:45"
}
```

---

### 2️⃣ RUTAS

#### Buscar Rutas
```
GET /api/routes/search?origin=Terminal%20Centro&destination=Terminal%20Norte&page=1

Query Parameters:
- origin: string (requerido) - Origen de búsqueda
- destination: string (requerido) - Destino de búsqueda
- page: integer (opcional, default: 1)

Response (200 OK):
{
  "success": true,
  "message": "Búsqueda realizada exitosamente",
  "data": {
    "routes": [
      {
        "id": 1,
        "titulo": "Ruta Centro - Norte",
        "origen": "Terminal Centro",
        "destino": "Terminal Norte",
        "distancia_km": 25,
        "duracion_estimada": "45 min",
        "estado": "activo",
        "fecha_creacion": "2026-02-01 08:00:00",
        "usuario_id": 1
      },
      {
        "id": 2,
        "titulo": "Ruta Centro - Este",
        "origen": "Terminal Centro",
        "destino": "Terminal Este",
        "distancia_km": 20,
        "duracion_estimada": "35 min",
        "estado": "activo",
        "fecha_creacion": "2026-02-01 08:15:00",
        "usuario_id": 1
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    },
    "query": {
      "origin": "Terminal Centro",
      "destination": "Terminal Norte"
    }
  },
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Crear Ruta (Admin)
```
POST /api/routes/create

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body:
{
  "title": "Ruta Centro - Norte",
  "origin": "Terminal Centro",
  "destination": "Terminal Norte",
  "distanceKm": 25,
  "duration": "45 min"
}

Response (201 Created):
{
  "success": true,
  "message": "Ruta creada exitosamente",
  "data": {
    "id": 1,
    "titulo": "Ruta Centro - Norte",
    "origen": "Terminal Centro",
    "destino": "Terminal Norte",
    "distancia_km": 25,
    "duracion_estimada": "45 min",
    "estado": "activo",
    "fecha_creacion": "2026-02-04 10:30:45",
    "usuario_id": 1
  },
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Obtener Sugerencias de Origen
```
GET /api/routes/suggestions/origins

Response (200 OK):
{
  "success": true,
  "message": "Orígenes obtenidos exitosamente",
  "data": [
    { "origen": "Terminal Centro" },
    { "origen": "Terminal Norte" },
    { "origen": "Terminal Sur" },
    { "origen": "Terminal Este" },
    { "origen": "Terminal Oeste" }
  ],
  "timestamp": "2026-02-04 10:30:45"
}
```

#### Obtener Sugerencias de Destino
```
GET /api/routes/suggestions/destinations

Response (200 OK):
{
  "success": true,
  "message": "Destinos obtenidos exitosamente",
  "data": [
    { "destino": "Terminal Centro" },
    { "destino": "Terminal Norte" },
    { "destino": "Terminal Sur" },
    { "destino": "Terminal Este" },
    { "destino": "Terminal Oeste" }
  ],
  "timestamp": "2026-02-04 10:30:45"
}
```

---

## ⚛️ EJEMPLOS DE INTEGRACIÓN REACT

### OPCIÓN 1: Usar `fetch` (Nativa)

#### Helper para llamadas API
```javascript
// src/lib/api.ts o src/utils/api.js

const API_BASE_URL = 'http://localhost/rutasseguras/backend'; // Cambiar según tu servidor

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
}

// Funciones específicas
export const auth = {
  register: (name, email, password, phone, role = 'cliente') =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role }),
    }),

  login: (email, password) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/api/auth/logout', { method: 'POST' }),

  getProfile: () =>
    apiCall('/api/auth/me', { method: 'GET' }),

  updateProfile: (name, phone) =>
    apiCall('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name, phone }),
    }),

  changePassword: (oldPassword, newPassword) =>
    apiCall('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

export const routes = {
  search: (origin, destination, page = 1) =>
    apiCall(`/api/routes/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&page=${page}`),

  suggestOrigins: () =>
    apiCall('/api/routes/suggestions/origins'),

  suggestDestinations: () =>
    apiCall('/api/routes/suggestions/destinations'),

  create: (title, origin, destination, distanceKm, duration) =>
    apiCall('/api/routes/create', {
      method: 'POST',
      body: JSON.stringify({ title, origin, destination, distanceKm, duration }),
    }),
};
```

#### Uso en componentes React

**Ejemplo 1: Login**
```jsx
// src/pages/login.tsx

import { useState } from 'react';
import { auth } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await auth.login(email, password);

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: '¡Bienvenido!',
        description: `Hola, ${response.data.user.name}`,
      });

      // Redirigir al dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

**Ejemplo 2: Búsqueda de Rutas**
```jsx
// src/pages/dashboard/routes.tsx

import { useState } from 'react';
import { routes } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function RouteSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const { toast } = useToast();

  // Cargar sugerencias al montar
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [originsData, destinationsData] = await Promise.all([
          routes.suggestOrigins(),
          routes.suggestDestinations(),
        ]);
        setOrigins(originsData.data);
        setDestinations(destinationsData.data);
      } catch (error) {
        console.error('Error cargando sugerencias:', error);
      }
    };

    loadSuggestions();
  }, []);

  // Buscar rutas
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      toast({
        title: 'Error',
        description: 'Completa origen y destino',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await routes.search(origin, destination);
      setResults(response.data.routes);

      if (response.data.routes.length === 0) {
        toast({
          title: 'Sin resultados',
          description: 'No encontramos rutas disponibles',
        });
      } else {
        toast({
          title: 'Éxito',
          description: `Se encontraron ${response.data.routes.length} rutas`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          required
        >
          <option value="">Selecciona origen</option>
          {origins.map((orig) => (
            <option key={orig.origen} value={orig.origen}>
              {orig.origen}
            </option>
          ))}
        </select>

        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        >
          <option value="">Selecciona destino</option>
          {destinations.map((dest) => (
            <option key={dest.destino} value={dest.destino}>
              {dest.destino}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar Rutas'}
        </button>
      </form>

      {results.length > 0 && (
        <div>
          {results.map((route) => (
            <div key={route.id}>
              <h3>{route.titulo}</h3>
              <p>Origen: {route.origen}</p>
              <p>Destino: {route.destino}</p>
              <p>Distancia: {route.distancia_km} km</p>
              <p>Duración: {route.duracion_estimada}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### OPCIÓN 2: Usar `axios` (Más fácil)

#### Instalación
```bash
npm install axios
```

#### Configuración
```javascript
// src/lib/axiosInstance.ts

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost/rutasseguras/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
```

#### Uso con axios
```javascript
// src/lib/api.ts

import axiosInstance from './axiosInstance';

export const auth = {
  register: (name, email, password, phone, role = 'cliente') =>
    axiosInstance.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
      role,
    }),

  login: (email, password) =>
    axiosInstance.post('/api/auth/login', { email, password }),

  logout: () =>
    axiosInstance.post('/api/auth/logout'),

  getProfile: () =>
    axiosInstance.get('/api/auth/me'),
};

export const routes = {
  search: (origin, destination, page = 1) =>
    axiosInstance.get('/api/routes/search', {
      params: { origin, destination, page },
    }),

  suggestOrigins: () =>
    axiosInstance.get('/api/routes/suggestions/origins'),

  suggestDestinations: () =>
    axiosInstance.get('/api/routes/suggestions/destinations'),

  create: (title, origin, destination, distanceKm, duration) =>
    axiosInstance.post('/api/routes/create', {
      title,
      origin,
      destination,
      distanceKm,
      duration,
    }),
};
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### 1. Hash de Contraseñas
```php
// BCRYPT con costo 12 (más seguro que lo predeterminado)
password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])

// Tiempo de procesamiento: ~0.5-1 segundo (dificulta ataques de fuerza bruta)
```

### 2. JWT (JSON Web Tokens)
```php
// Token con expiración de 24 horas
// Generación: JWTHandler::create(['id' => $userId, ...])
// Verificación en cada request protegido
// No se almacena en servidor (stateless)
```

### 3. CORS
```php
// Solo acepta requests de tu dominio Netlify
Access-Control-Allow-Origin: https://agent-6983b0ed00331d--delightful-biscotti-2e62e6.netlify.app
```

### 4. Validación de Entrada
```php
// Validator::validateEmail()          - RFC 5322
// Validator::validatePassword()       - Min 8 chars, mayús, minús, número
// Validator::validatePhone()          - Patrón internacional
// Validator::sanitize()               - htmlspecialchars + trim
```

### 5. Prepared Statements (PDO)
```php
// ✅ SEGURO - Protegido contra SQL Injection
$stmt->execute([':email' => $email])

// ❌ INSEGURO - NO HACER
$query = "WHERE email = '$email'"
```

### 6. Encriptación en Tránsito
```
Recomendación: Usar HTTPS en producción
Header: Strict-Transport-Security
```

---

## 🚀 DEPLOYMENT

### Opción 1: Hosting Compartido (Recomendado para Empezar)

**Proveedores recomendados:**
- **Hostinger** - Desde $2.99/mes, incluye PHP + MySQL
- **Bluehost** - Desde $1.95/mes (promo), WordPress + MySQL
- **SiteGround** - Desde $2.99/mes, excelente soporte
- **000webhost** - Gratis con limitaciones

**Pasos:**
1. Registrarse en el hosting
2. Crear BD MySQL desde panel de control
3. Ejecutar `db_schema.sql` en phpMyAdmin
4. Subir carpeta `backend/` vía FTP/SFTP
5. Editar `config/config.php` con nuevas credenciales
6. Acceder a `https://tudominio.com/backend/api/auth/login`

---

### Opción 2: VPS con Servidor Web Propio

**Requisitos:**
- VPS Linux (Linode, DigitalOcean, AWS, etc.) - $5-10/mes
- SSH access
- Apache o Nginx
- PHP 8.0+
- MySQL 8.0+

**Instalación en Ubuntu 20.04:**

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar PHP + extensiones
sudo apt install -y php8.0 php8.0-mysql php8.0-curl php8.0-json php8.0-mbstring php8.0-xml

# 3. Instalar MySQL
sudo apt install -y mysql-server

# 4. Instalar Apache
sudo apt install -y apache2 libapache2-mod-php8.0

# 5. Habilitar módulos necesarios
sudo a2enmod rewrite
sudo a2enmod headers

# 6. Crear directorio para la aplicación
sudo mkdir -p /var/www/rutasseguras
sudo chown -R $USER:$USER /var/www/rutasseguras

# 7. Subir archivos
# (Usar git clone, scp, o panel FTP)

# 8. Configurar permisos
chmod -R 755 /var/www/rutasseguras/backend
chmod -R 775 /var/www/rutasseguras/backend/logs
chmod -R 775 /var/www/rutasseguras/backend/uploads

# 9. Crear BD MySQL
mysql -u root -p -e "
  CREATE DATABASE rutas_seguras;
  CREATE USER 'rutasseguras'@'localhost' IDENTIFIED BY 'contrasena_segura';
  GRANT ALL PRIVILEGES ON rutas_seguras.* TO 'rutasseguras'@'localhost';
  FLUSH PRIVILEGES;
"

# 10. Importar esquema
mysql -u rutasseguras -p rutas_seguras < /var/www/rutasseguras/backend/db_schema.sql

# 11. Configurar Apache
# Editar: /etc/apache2/sites-available/rutasseguras.conf
# (Ver sección siguiente)

# 12. Habilitar sitio y reiniciar
sudo a2ensite rutasseguras.conf
sudo systemctl restart apache2
```

**Configuración Apache (rutasseguras.conf):**

```apache
<VirtualHost *:80>
    ServerName tudominio.com
    ServerAdmin admin@tudominio.com
    DocumentRoot /var/www/rutasseguras

    <Directory /var/www/rutasseguras/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/rutasseguras_error.log
    CustomLog ${APACHE_LOG_DIR}/rutasseguras_access.log combined

    # Redirigir HTTP a HTTPS (después de SSL)
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

# HTTPS con Let's Encrypt (SSL Gratis)
# https://certbot.eff.org/
```

---

### Opción 3: Docker (Avanzado)

```dockerfile
# Dockerfile
FROM php:8.0-apache

# Instalar extensiones PHP
RUN docker-php-ext-install pdo pdo_mysql

# Copiar código
COPY backend /var/www/html

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASS: root_password
      DB_NAME: rutas_seguras

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: rutas_seguras
    ports:
      - "3306:3306"
    volumes:
      - ./backend/db_schema.sql:/docker-entrypoint-initdb.d/schema.sql
```

---

## ❓ TROUBLESHOOTING

### Problema: "CORS Error" en Frontend

**Causa:** Configuración de CORS incorrecta

**Solución:**
```php
// config/config.php línea 23
define('FRONTEND_URL', 'https://agent-6983b0ed00331d--delightful-biscotti-2e62e6.netlify.app');
// Asegúrate que sea la URL EXACTA de tu frontend
```

---

### Problema: "Token Invalid or Expired"

**Causa:** JWT expirado o secreto cambiado

**Solución:**
```php
// Aumentar expiración en config.php línea 31
define('JWT_EXPIRATION', 86400 * 7); // 7 días en lugar de 1

// O cambiar secreto en línea 28 (NOTA: invalida todos los tokens existentes)
define('JWT_SECRET', 'nueva_clave_secreta_super_segura');
```

---

### Problema: "Connection Refused" a BD

**Causa:** Credenciales incorrectas o BD no iniciada

**Solución:**
```bash
# Verificar BD está corriendo
mysql -u root -p -e "SELECT 1"

# Verificar credenciales
mysql -u tusuario -p -e "USE rutas_seguras; SHOW TABLES;"

# Revisar config.php
grep "DB_" config/config.php
```

---

### Problema: "Headers already sent"

**Causa:** Output antes de headers en PHP

**Solución:**
- No incluir espacios en blanco después de `?>`
- No usar `echo` o `print` antes de headers
- Poner `<?php` al inicio del archivo

---

### Problema: "Password Hash Error"

**Causa:** PASSWORD_BCRYPT no soportado en PHP viejo

**Solución:** Actualizar a PHP 7.4+

```bash
# En Ubuntu
sudo apt install -y php8.0 php8.0-common
```

---

## 📚 RECURSOS ADICIONALES

- 📖 [Documentación PHP Official](https://www.php.net/docs.php)
- 🔐 [JWT Debugger](https://jwt.io/)
- 🗄️ [MySQL Docs](https://dev.mysql.com/doc/)
- 🌐 [CORS en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- ⚛️ [React Hooks](https://react.dev/reference/react)

---

## ✅ CHECKLIST PARA DEPLOYMENT

- [ ] BD creada con `db_schema.sql`
- [ ] `config/config.php` actualizado con credenciales
- [ ] URLs (API_BASE_URL, FRONTEND_URL) configuradas
- [ ] CORS habilitado para tu dominio Netlify
- [ ] JWT_SECRET cambiado a valor seguro
- [ ] Carpetas `logs/` y `uploads/` creadas y con permisos 775
- [ ] HTTPS configurado (SSL/TLS)
- [ ] Error logging activado
- [ ] Firewall configurado
- [ ] Backups automáticos de BD

---

## 🎯 SIGUIENTES PASOS

1. **Integración de Maps**: Usar Google Maps API para geocoding de direcciones
2. **Pagos**: Integrar Stripe o PayPal para reservas
3. **Notificaciones**: SMS/Email con Twilio o SendGrid
4. **Analytics**: Seguimiento de búsquedas y reservas
5. **Mobile**: Aplicación nativa con React Native
6. **Admin Panel**: Dashboard profesional con estadísticas

---

**¡Tu backend está listo para producción! 🚀**

