# ⚡ DEPLOYMENT RÁPIDO - 30 MINUTOS

## OPCIÓN 1: Hostinger (Recomendado para principiantes)

### Paso 1: Registro y compra del plan
1. Ir a **hostinger.com**
2. Comprar plan "Hosting Compartido" (~$2.99/mes)
3. Completar registro

### Paso 2: Crear base de datos
1. Ir a **Panel de Control → Bases de datos MySQL**
2. Crear nueva BD:
   - Nombre: `rutasseguras`
   - Usuario: `tu_usuario`
   - Contraseña: `tu_contraseña_segura`

### Paso 3: Importar script SQL
1. Ir a **phpMyAdmin** (desde panel)
2. Seleccionar BD `rutasseguras`
3. Ir a **Importar**
4. Subir archivo `db_schema.sql`
5. Dar click en **Ejecutar**

### Paso 4: Configurar PHP
1. Contactar soporte o verificar PHP version >= 7.4
2. Habilitar extensión `php_pdo_mysql` si es necesario

### Paso 5: Subir archivos
1. Abrir **Administrador de Archivos** o FTP
2. Navegar a carpeta `public_html`
3. Crear carpeta `rutasseguras`
4. Subir contenido de carpeta `backend`

### Paso 6: Editar configuración
1. Editar `backend/config/config.php`:
```php
// Línea 8-12: Tus credenciales MySQL
define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
define('DB_NAME', 'rutasseguras');

// Línea 19: Tu dominio
define('API_BASE_URL', 'https://tudominio.com/rutasseguras/backend');

// Línea 21: URL de tu frontend Netlify
define('FRONTEND_URL', 'https://agent-6983b0ed00331d--delightful-biscotti-2e62e6.netlify.app');
```

### Paso 7: Crear carpetas necesarias
Usando administrador de archivos:
```
backend/logs/          (crear)
backend/uploads/       (crear)
```

### Paso 8: ¡Listo!
Probar acceso: `https://tudominio.com/rutasseguras/backend/api/auth/login`

---

## OPCIÓN 2: DigitalOcean VPS (Avanzado, $5/mes)

### Paso 1: Crear Droplet
1. Ir a **DigitalOcean.com**
2. Crear nuevo Droplet
3. Elegir:
   - OS: **Ubuntu 20.04**
   - Tamaño: **$5/mes** (recomendado)
4. Crear

### Paso 2: Conectar por SSH
```bash
ssh root@tu_ip_del_vps

# Cambiar contraseña root
passwd
```

### Paso 3: Instalar stack LAMP
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Apache
apt install -y apache2

# Instalar PHP 8.0 + extensiones
apt install -y php8.0 php8.0-mysql php8.0-curl php8.0-json \
              php8.0-mbstring php8.0-xml php8.0-zip libapache2-mod-php8.0

# Instalar MySQL
apt install -y mysql-server

# Instalar Certbot (SSL gratis)
apt install -y certbot python3-certbot-apache
```

### Paso 4: Configurar MySQL
```bash
# Ejecutar asistente de seguridad
mysql_secure_installation

# Entrar a MySQL
mysql -u root -p

# Ejecutar en MySQL:
CREATE DATABASE rutas_seguras;
CREATE USER 'rutasseguras'@'localhost' IDENTIFIED BY 'tu_contrasena_segura';
GRANT ALL PRIVILEGES ON rutas_seguras.* TO 'rutasseguras'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar esquema
mysql -u rutasseguras -p rutas_seguras < /ruta/a/db_schema.sql
```

### Paso 5: Configurar Apache
```bash
# Habilitar módulos
a2enmod rewrite
a2enmod headers

# Crear archivo de configuración del sitio
nano /etc/apache2/sites-available/rutasseguras.conf
```

Copiar esto en el archivo:
```apache
<VirtualHost *:80>
    ServerName tudominio.com
    ServerAdmin admin@tudominio.com
    DocumentRoot /var/www/rutasseguras/backend

    <Directory /var/www/rutasseguras/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/rutasseguras_error.log
    CustomLog ${APACHE_LOG_DIR}/rutasseguras_access.log combined
</VirtualHost>
```

```bash
# Habilitar sitio
a2ensite rutasseguras.conf

# Desabilitar sitio por defecto
a2dissite 000-default.conf

# Verificar configuración
apache2ctl configtest

# Reiniciar Apache
systemctl restart apache2
```

### Paso 6: Subir archivos backend
```bash
# Crear directorio
mkdir -p /var/www/rutasseguras

# Subir archivos (desde tu computadora):
# Usar SCP o SFTP para copiar la carpeta backend

# O clonar desde Git (si tienes repositorio):
# cd /var/www/rutasseguras
# git clone tu-repositorio.git

# Dar permisos
chown -R www-data:www-data /var/www/rutasseguras
chmod -R 755 /var/www/rutasseguras/backend
chmod -R 775 /var/www/rutasseguras/backend/logs
chmod -R 775 /var/www/rutasseguras/backend/uploads
```

### Paso 7: Configurar DNS
1. En tu registrador de dominios (GoDaddy, Namecheap, etc.)
2. Cambiar registros DNS:
   - A record: apuntar a IP de DigitalOcean

### Paso 8: Configurar SSL (HTTPS)
```bash
# Usar Certbot
certbot --apache -d tudominio.com

# Seleccionar:
# 1) Crear nuevo certificado
# 2) Redirect HTTP to HTTPS
```

### Paso 9: Editar configuración PHP
```bash
nano /var/www/rutasseguras/backend/config/config.php

# Cambiar:
# - DB_USER, DB_PASS, DB_NAME
# - API_BASE_URL a https://tudominio.com/backend
# - FRONTEND_URL a tu URL Netlify
```

### Paso 10: ¡Listo!
Probar: `https://tudominio.com/api/auth/login`

---

## OPCIÓN 3: Heroku (Fácil, pero requiere tarjeta)

### Paso 1: Instalación heroku-cli
```bash
# Windows: Descargar desde https://devcenter.heroku.com/articles/heroku-cli
# O con npm:
npm install -g heroku
```

### Paso 2: Login a Heroku
```bash
heroku login
```

### Paso 3: Crear aplicación
```bash
# Clonar o navegar a carpeta del proyecto
cd backend

# Crear app en Heroku
heroku create tu-app-name

# Ver URL asignada
heroku open
```

### Paso 4: Agregar BD MySQL
```bash
# Heroku no incluye MySQL gratis, usar JawsDB
heroku addons:create jawsdb:kitefin

# Obtener credenciales
heroku config:get JAWSDB_URL
```

### Paso 5: Importar BD
```bash
# Obtener HOST, USER, PASSWORD, DB desde paso anterior
mysql -h host -u user -p -e "source db_schema.sql" database
```

### Paso 6: Configurar variables de entorno
```bash
heroku config:set DB_HOST=host
heroku config:set DB_USER=user
heroku config:set DB_PASS=password
heroku config:set DB_NAME=database
heroku config:set JWT_SECRET=tu_clave_secreta
heroku config:set FRONTEND_URL=https://tu-frontend.netlify.app
```

### Paso 7: Crear Procfile
Archivo `Procfile` en raíz del proyecto:
```
web: vendor/bin/heroku-php-apache2 backend/
```

### Paso 8: Deploy
```bash
git push heroku main
```

---

## CAMBIOS NECESARIOS EN REACT

Después de desplegar backend, cambiar URL en tu proyecto React:

### Opción A: Variable de entorno
```bash
# .env (en raíz del proyecto React)
VITE_API_URL=https://tudominio.com/backend
REACT_APP_API_URL=https://tudominio.com/backend
```

### Opción B: Cambiar en api.ts
```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.VITE_API_URL || 'https://tudominio.com/backend';
```

### Opción C: Cambiar directamente
```typescript
// src/lib/api.ts
const API_BASE_URL = 'https://tudominio.com/backend'; // Tu URL de producción
```

---

## 🔍 VERIFICAR DEPLOYMENT

### Test de endpoints
```bash
# Registrar
curl -X POST https://tudominio.com/backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test12345"}'

# Login
curl -X POST https://tudominio.com/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test12345"}'

# Buscar rutas (sin autenticación)
curl "https://tudominio.com/backend/api/routes/search?origin=Centro&destination=Norte"
```

### Verificar CORS
```bash
curl -H "Origin: https://tu-frontend.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://tudominio.com/backend/api/auth/login -v
```

---

## 📋 CHECKLIST FINAL

- [ ] BD creada e importado db_schema.sql
- [ ] config.php actualizado con credenciales
- [ ] API_BASE_URL y FRONTEND_URL configurados
- [ ] Carpetas logs/ y uploads/ creadas
- [ ] Permisos correctos en carpetas (755, 775)
- [ ] PHP 7.4+ y extensiones PDO habilitadas
- [ ] HTTPS configurado (importante!)
- [ ] CORS funcionando
- [ ] React apunta a URL correcta del backend
- [ ] Pruebas de endpoints exitosas

---

## 🆘 TROUBLESHOOTING

**Error 500 al hacer POST:**
- Verificar que Apache módulo rewrite esté habilitado
- Ver logs de error en `logs/error.log`

**CORS Error:**
- Verificar FRONTEND_URL en config.php
- Asegurar HTTPS en ambos lados (HTTP + HTTPS = error CORS)

**BD no conecta:**
- Verificar credenciales en config.php
- Estar en servidor correcto si es remoto

**Token expirado:**
- Cambiar JWT_EXPIRATION en config.php
- Tener sincronizados relojes entre servidor

---

**¡Tu aplicación está en producción! 🚀**
