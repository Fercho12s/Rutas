╔══════════════════════════════════════════════════════════════════════════════╗
║                    RUTAS SEGURAS - QUICK START CHECKLIST                      ║
║                     Guía rápida de instalación (10 minutos)                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

REQUISITOS PREVIOS
═══════════════════════════════════════════════════════════════════════════════

✅ TIENES QUE TENER INSTALADO:
  □ PHP 8.0 o superior
  □ MySQL 5.7 o superior
  □ Servidor web (Apache recomendado)
  □ Editor de código (VS Code, PhpStorm, etc)

¿CÓMO VERIFICAR?

  Windows (Command Prompt):
    php -v
    mysql --version

  Mac/Linux (Terminal):
    php -v
    mysql --version

Si no tienes:
  - XAMPP (Windows/Mac): https://www.apachefriends.org
  - MAMP (Mac): https://www.mamp.info
  - Laravel Valet (Mac): valet.laravel.com
  - WSL2 + Ubuntu (Windows): https://docs.microsoft.com/es-es/windows/wsl


PASO 1: DESCARGAR ARCHIVOS BACKEND
═══════════════════════════════════════════════════════════════════════════════

□ Carpeta: backend/
  ├── api/
  │   ├── auth/
  │   │   ├── register.php
  │   │   ├── login.php
  │   │   ├── logout.php
  │   │   └── me.php
  │   └── routes/
  │       ├── search.php
  │       ├── create.php
  │       ├── suggestions-origins.php
  │       └── suggestions-destinations.php
  │
  ├── config/
  │   ├── config.php                  ◄─── EDITAR AQUÍ
  │   └── Database.php
  │
  ├── controllers/
  │   ├── AuthController.php
  │   └── RouteController.php
  │
  ├── middleware/
  │   ├── AuthMiddleware.php
  │   └── RequestMiddleware.php
  │
  ├── models/
  │   ├── User.php
  │   └── Route.php
  │
  ├── utils/
  │   ├── Response.php
  │   ├── Validator.php
  │   └── JWTHandler.php
  │
  ├── logs/                           ◄─── CREAR CARPETA
  ├── uploads/                        ◄─── CREAR CARPETA
  ├── .htaccess
  ├── db_schema.sql
  │
  └── DOCUMENTACION/
      ├── README.md
      ├── DOCUMENTACION_COMPLETA.md
      ├── DEPLOYMENT_GUIA_RAPIDA.md
      ├── REACT_API_CONFIG.ts
      ├── EJEMPLOS_REACT.tsx
      ├── CHECKLIST.md
      ├── MAPA_MENTAL.txt
      ├── DIAGRAMA_FLUJOS.txt
      └── ARCHIVO_LEGIBLE.txt

Descarga todas estas carpetas a tu PC.


PASO 2: CREAR CARPETAS QUE FALTAN
═══════════════════════════════════════════════════════════════════════════════

En tu carpeta backend/, crea (si no existen):

□ Carpeta: logs/
   - Esta carpeta debe estar VACÍA
   - El backend escribirá logs de error aquí

□ Carpeta: uploads/
   - Esta carpeta debe estar VACÍA
   - Los usuarios subirán archivos aquí

En Windows (Command Prompt):
  cd C:\tu\ruta\backend
  mkdir logs
  mkdir uploads

En Mac/Linux (Terminal):
  cd ~/tu/ruta/backend
  mkdir logs
  mkdir uploads


PASO 3: EDITAR ARCHIVO DE CONFIGURACIÓN
═══════════════════════════════════════════════════════════════════════════════

□ Abre: backend/config/config.php

Busca y EDITA estas líneas (CRÍTICO):

SECCIÓN 1: Base de Datos
─────────────────────────
define('DB_HOST', 'localhost');      ← Si tu MySQL está local, déjalo igual
define('DB_PORT', 3306);              ← Puerto por defecto MySQL
define('DB_NAME', 'rutas_seguras');  ← Nombre BD (lo crearemos en Paso 5)
define('DB_USER', 'root');            ← Usuario MySQL (en XAMPP/MAMP es 'root')
define('DB_PASS', '');                ← Contraseña (en XAMPP/MAMP suele estar vacía)

Ejemplo con XAMPP:
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'rutas_seguras');
    define('DB_USER', 'root');
    define('DB_PASS', '');

Ejemplo con MAMP:
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'rutas_seguras');
    define('DB_USER', 'root');
    define('DB_PASS', 'root');

Ejemplo con servidor remoto:
    define('DB_HOST', '192.168.1.100');
    define('DB_PORT', 3306);
    define('DB_NAME', 'rutas_seguras');
    define('DB_USER', 'usuario_remoto');
    define('DB_PASS', 'tu_contraseña_remota');


SECCIÓN 2: URLs
───────────────
define('API_BASE_URL', 'http://localhost:8000');

Cambia a:
  - Local: 'http://localhost:8000'
  - Local con carpeta: 'http://localhost:8000/backend'
  - Producción: 'https://tu-backend.com'

define('FRONTEND_URL', 'http://localhost:3000');

Cambia a:
  - Local: 'http://localhost:3000'
  - Producción: 'https://nombreapp.netlify.app'


SECCIÓN 3: JWT (CRÍTICO para producción)
─────────────────────────────────────────
define('JWT_SECRET', 'tu_secreto_super_seguro_aqui_cambiar_en_produccion');

En desarrollo (OK):
    define('JWT_SECRET', 'dev-secret-key-xyz');

En producción (DEBE CAMBIAR):
    Genera una cadena aleatoria:
    Windows: php -r "echo bin2hex(random_bytes(32));"
    Mac/Linux: php -r "echo bin2hex(random_bytes(32));"

    Resultado ejemplo:
    define('JWT_SECRET', '7e2b3a1c9d5f4e8b6a2c0d9e1f3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f');


Guarda el archivo (Ctrl+S)


PASO 4: CREAR LA BASE DE DATOS
═══════════════════════════════════════════════════════════════════════════════

Opción A: XAMPP (Windows)
────────────────────────
1. Abre: http://localhost/phpmyadmin
2. Haz clic en "SQL" (arriba)
3. Abre archivo: backend/db_schema.sql
4. Copia TODO el contenido
5. Pega en phpmyadmin
6. Haz clic en botón "Continuar"
7. Verifica que aparezca "✓ Consulta correcta"

Opción B: Terminal (Mac/Linux/Windows)
──────────────────────────────────────
1. Abre terminal/Command Prompt
2. Ve a carpeta backend:
   cd C:\tu\ruta\backend
3. Ejecuta:
   mysql -u root -p < db_schema.sql
4. Te pedirá contraseña (presiona Enter si está vacía)
5. Verifica que no haya errores

Opción C: MySQL Workbench (Visual)
──────────────────────────────────
1. Abre MySQL Workbench
2. Conecta a tu servidor
3. File → Open SQL Script → db_schema.sql
4. Haz clic en rayo (Execute)


PASO 5: PONER EL BACKEND EN SERVIDOR LOCAL
═══════════════════════════════════════════════════════════════════════════════

OPCIÓN A: XAMPP (Windows)
─────────────────────────
1. Abre: C:\xampp\htdocs\ (o donde tengas XAMPP instalado)
2. Copia tu carpeta "backend" aquí
   Resultado: C:\xampp\htdocs\backend\
3. Inicia Apache desde panel de control XAMPP
4. URL de acceso: http://localhost/backend/api/routes/search


OPCIÓN B: MAMP (Mac)
─────────────────────
1. Abre: /Applications/MAMP/htdocs/
2. Copia tu carpeta "backend" aquí
   Resultado: /Applications/MAMP/htdocs/backend/
3. Inicia Apache desde MAMP
4. URL de acceso: http://localhost:8888/backend/api/routes/search


OPCIÓN C: Laravel Valet (Mac)
──────────────────────────────
1. Copia tu carpeta "backend" a tu sitio de desarrollo
   Ejemplo: ~/Sites/backend
2. En terminal:
   cd ~/Sites/backend
   valet link
3. URL: http://backend.test/api/routes/search


OPCIÓN D: Apache nativo (Linux)
────────────────────────────────
1. Copia carpeta backend a /var/www/html/
   Resultado: /var/www/html/backend/
2. Configura permisos:
   sudo chown -R www-data:www-data /var/www/html/backend
   sudo chmod -R 755 /var/www/html/backend
3. Reinicia Apache:
   sudo systemctl restart apache2
4. URL: http://localhost/backend/api/routes/search


PASO 6: PROBAR QUE EL BACKEND FUNCIONA
═══════════════════════════════════════════════════════════════════════════════

□ Prueba 1: Búsqueda de rutas (PUBLIC)
──────────────────────────────────────

Abre navegador y ve a:
  http://localhost/backend/api/routes/search?origin=Centro&destination=Norte

Deberías ver JSON como este:
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
        ...
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
}

✅ Si ves JSON → Backend funciona correctamente


□ Prueba 2: Registro de usuario (POST)
──────────────────────────────────────

Abre Postman o instala extensión "REST Client" en VS Code

Copia esto en un archivo test.http:

```
POST http://localhost/backend/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan de Prueba",
  "email": "juan.prueba@test.com",
  "contraseña": "TestPass123!",
  "telefono": "+57 3001234567"
}
```

Haz clic en "Send" (VS Code) o "Send Request" (REST Client)

Deberías recibir HTTP 201 con:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan de Prueba",
      "email": "juan.prueba@test.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

✅ Si ves token → Autenticación funciona


□ Prueba 3: Login (POST)
────────────────────────

```
POST http://localhost/backend/api/auth/login
Content-Type: application/json

{
  "email": "juan.prueba@test.com",
  "contraseña": "TestPass123!"
}
```

Deberías recibir token igual que antes

✅ Si login funciona → Sistema de autenticación OK


□ Prueba 4: Obtener perfil (GET con JWT)
────────────────────────────────────────

```
GET http://localhost/backend/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```

⚠️ IMPORTANTE: Reemplaza "eyJhbGciOi..." con el token que recibiste en login

Deberías recibir tus datos de usuario

✅ Si funciona → JWT funciona correctamente


PASO 7: INTEGRAR CON REACT FRONTEND
═══════════════════════════════════════════════════════════════════════════════

□ Copia el archivo: backend/DOCUMENTACION/REACT_API_CONFIG.ts
   al proyecto React en: src/lib/api.ts

□ En config/config.php del backend, verifica:
   define('API_BASE_URL', 'http://localhost/backend');

□ En REACT_API_CONFIG.ts, verifica:
   const API_BASE_URL = 'http://localhost/backend';

□ Abre componentes React de login/registro
   Reemplaza fetch() con llamadas a api.ts

Ejemplo:

ANTES (fetch):
──────────────
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({email, password})
});

DESPUÉS (con API client):
─────────────────────────
import { api } from '@/lib/api';

const response = await api.auth.login(email, password);

□ Prueba: Inicia React frontend y verifica login/registro


PASO 8: VERIFICAR ERRORES (SI ALGO FALLA)
═══════════════════════════════════════════════════════════════════════════════

Logs:
─────
Revisa carpeta backend/logs/ por archivos de error
Abre el archivo más reciente

Errores comunes:
────────────────

Error: "Database connection failed"
└─ Solución: Verifica DB_HOST, DB_USER, DB_PASS en config.php

Error: "Table 'rutas_seguras.usuarios' doesn't exist"
└─ Solución: No ejecutaste db_schema.sql → Ve a PASO 4

Error: "CORS policy: Cross origin requests..."
└─ Solución: En config.php, actualiza FRONTEND_URL con tu URL React

Error: "Token expirado" (HTTP 401)
└─ Solución: Normal después de 24 horas → Login nuevamente

Error: "Forbidden" (HTTP 403)
└─ Solución: Tu usuario no es admin → Usa prueba como cliente


PASO 9: DEPLOYMENT A PRODUCCIÓN
═══════════════════════════════════════════════════════════════════════════════

Cuando todo funcione en local, lee:
  backend/DOCUMENTACION/DEPLOYMENT_GUIA_RAPIDA.md

Contiene 3 opciones:
  1. Hostinger (~15 min, $2.99/mes)
  2. DigitalOcean (~45 min, $5/mes)
  3. Heroku (~30 min, free o $7/mes)

IMPORTANTE antes de ir a producción:
  □ Cambiar JWT_SECRET
  □ Cambiar DB_PASS a contraseña fuerte
  □ Cambiar FRONTEND_URL a tu dominio Netlify
  □ Cambiar API_BASE_URL a tu backend.com
  □ Habilitar HTTPS (SSL)
  □ Cambiar error_reporting a 0


PASO 10: VERIFICAR CHECKLIST DE SEGURIDAD
═══════════════════════════════════════════════════════════════════════════════

Antes de ir a producción, verifica:

□ CONTRASEÑAS:
   ├─ JWT_SECRET no es string de prueba
   ├─ DB_PASS es fuerte
   └─ Admin password fue hasheado con BCRYPT

□ BASES DE DATOS:
   ├─ SQL Injection protegida (prepared statements)
   ├─ CORS solo permite tu frontend
   └─ Error handling no expone internals

□ ARCHIVOS:
   ├─ .htaccess bloquea acceso a config/
   ├─ Carpeta logs/ tiene permisos 755
   └─ Carpeta uploads/ no ejecuta PHP

□ HEADERS:
   ├─ Access-Control-Allow-Origin correcto
   ├─ No exponemos X-Powered-By: PHP
   └─ Cache-Control apropiado

Lee DOCUMENTACION/CHECKLIST.md para lista completa


═══════════════════════════════════════════════════════════════════════════════
RESUMEN RÁPIDO (1 minuto)
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Descargar archivos backend/
2. ✅ Crear carpetas logs/ y uploads/
3. ✅ Editar config/config.php (DB + URLs)
4. ✅ Ejecutar db_schema.sql en MySQL
5. ✅ Poner backend en servidor (XAMPP/MAMP/Apache)
6. ✅ Probar: http://localhost/backend/api/routes/search
7. ✅ Probar registro en Postman/REST Client
8. ✅ Probar login
9. ✅ Integrar en React
10. ✅ Deploy a producción

¡LISTO! Tu backend está operativo 🎉


═══════════════════════════════════════════════════════════════════════════════
OBTENER AYUDA
═══════════════════════════════════════════════════════════════════════════════

Si tienes dudas o errores:

1. Lee: DOCUMENTACION/DOCUMENTACION_COMPLETA.md
   - Explica cada componente en detalle

2. Revisa: DOCUMENTACION/README.md
   - Quick start y endpoints

3. Ve a: backend/logs/
   - Busca archivos de error recientes

4. Contacta a un programador PHP senior
   - Comparte el archivo de error del logs/

5. Verifica la consola del navegador (F12)
   - Busca errores de CORS o networking


═══════════════════════════════════════════════════════════════════════════════
FIN DEL QUICK START
═══════════════════════════════════════════════════════════════════════════════

Próximo paso: Lee backend/DOCUMENTACION/DOCUMENTACION_COMPLETA.md
