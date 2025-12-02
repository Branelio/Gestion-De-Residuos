# 🗄️ Guía de Instalación de MongoDB para Windows

## Opción 1: MongoDB Atlas (Cloud - Recomendado para desarrollo)

### Ventajas:
- ✅ No requiere instalación local
- ✅ Gratis hasta 512MB
- ✅ Accesible desde cualquier lugar
- ✅ Configuración rápida (5 minutos)

### Pasos:

1. **Crear cuenta en MongoDB Atlas**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Regístrate con tu email

2. **Crear un Cluster Gratuito**
   - Selecciona "M0 Sandbox" (FREE)
   - Región: AWS / us-east-1 (o la más cercana)
   - Nombre del cluster: "Latacunga-Cluster"

3. **Configurar Acceso**
   - Database Access → Add New Database User
     - Username: `latacunga_admin`
     - Password: `Tu contraseña segura`
   - Network Access → Add IP Address
     - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
     - Para desarrollo está bien

4. **Obtener Connection String**
   - Click en "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia el connection string:
     ```
     mongodb+srv://latacunga_admin:<password>@latacunga-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

5. **Actualizar .env**
   ```env
   MONGODB_URI=mongodb+srv://latacunga_admin:TU_PASSWORD@latacunga-cluster.xxxxx.mongodb.net/latacunga_waste_management?retryWrites=true&w=majority
   ```

---

## Opción 2: MongoDB Community Server (Local)

### Ventajas:
- ✅ Sin límites de almacenamiento
- ✅ Funciona offline
- ✅ Máximo rendimiento local

### Pasos:

1. **Descargar MongoDB**
   - Ve a: https://www.mongodb.com/try/download/community
   - Versión: 7.0.14 (Latest)
   - Platform: Windows x64
   - Package: MSI

2. **Instalar MongoDB**
   - Ejecuta el instalador `.msi`
   - Selecciona "Complete" installation
   - ✅ Marca "Install MongoDB as a Service"
   - ✅ Marca "Install MongoDB Compass" (GUI opcional pero útil)
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`

3. **Verificar Instalación**
   ```powershell
   # En PowerShell
   mongod --version
   # Debería mostrar: db version v7.0.14
   ```

4. **Iniciar MongoDB Service** (Si no se inició automáticamente)
   ```powershell
   # Como Administrador
   net start MongoDB
   ```

5. **Verificar que está corriendo**
   ```powershell
   # Conectar con mongo shell
   mongosh
   # Debería conectarte a mongodb://localhost:27017
   ```

6. **Tu .env ya está configurado para local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/latacunga_waste_management
   ```

---

## 📦 Ejecutar el Seed de Datos

Una vez que MongoDB esté funcionando (Atlas o Local):

### 1. Verificar que el backend esté detenido
```powershell
# Si está corriendo con npm run dev, presiona Ctrl+C
```

### 2. Ejecutar el seed
```powershell
cd C:\Users\Branel\Documents\Proyectos\Prototipo2\backend
npm run seed:collection-points
```

### 3. Ver la salida esperada
```
✅ Conectado a MongoDB
🌱 Iniciando seed de puntos de acopio...
✅ 22 puntos de acopio insertados correctamente

📊 ESTADÍSTICAS DE SEED:
   Total de puntos: 22
   Capacidad total: 35,300 kg
   Carga actual: 15,420 kg
   Promedio de llenado: 44%

📍 DISTRIBUCIÓN POR ZONA:
   URBANA: 7 puntos
   PERIURBANA: 2 puntos
   RURAL: 5 puntos
   INDUSTRIAL: 1 puntos
   COMERCIAL: 2 puntos
   INSTITUCIONAL: 3 puntos
   RECREATIVA: 2 puntos

🗺️  Índices creados: _id_, location_2dsphere

🔍 VERIFICACIÓN DE DATOS:
   Total documentos: 22
   Puntos urbanos: 7
   Puntos rurales: 5

📍 5 PUNTOS MÁS CERCANOS AL CENTRO (Parque Vicente León):
   1. Contenedor Parque Vicente León - Parque Vicente León (frente a la Catedral)
   2. Centro de Acopio Municipal - La Matriz - Av. Eloy Alfaro y Quito, Latacunga Centro
   ...

✅ Puntos disponibles: 22
🔴 Puntos llenos: 0

✨ Proceso completado exitosamente
👋 Conexión cerrada
```

---

## 🔧 Comandos Útiles

### Limpiar y volver a sembrar
```powershell
npm run seed:collection-points -- --clear
```

### Ver la base de datos con MongoDB Compass
1. Abre MongoDB Compass
2. Conecta a: `mongodb://localhost:27017` (local) o tu connection string de Atlas
3. Selecciona la base de datos: `latacunga_waste_management`
4. Abre la colección: `collection_points`
5. Verás los 22 puntos de acopio con mapa incluido 🗺️

### Verificar conexión desde PowerShell
```powershell
# Para MongoDB local
mongosh
use latacunga_waste_management
db.collection_points.countDocuments()
# Debería devolver: 22
```

---

## ❓ Troubleshooting

### Error: "MongooseServerSelectionError"
- **MongoDB Atlas**: Verifica que la IP esté permitida en Network Access
- **MongoDB Local**: Verifica que el servicio esté corriendo: `net start MongoDB`

### Error: "Authentication failed"
- Verifica que el usuario y password en `.env` sean correctos
- En Atlas, reemplaza `<password>` con tu password real (sin <>)

### Puerto 27017 en uso
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :27017
# Detener el servicio MongoDB
net stop MongoDB
# Iniciar de nuevo
net start MongoDB
```

---

## 🎯 Recomendación

Para este proyecto, te recomiendo **MongoDB Atlas** porque:
1. ✅ Es más rápido de configurar (5 min vs 20 min)
2. ✅ No ocupas espacio en tu disco local
3. ✅ Puedes acceder desde tu móvil en la misma red
4. ✅ Es gratis para el tamaño de este proyecto
5. ✅ No tienes que preocuparte por el servicio de Windows

---

## 📚 Recursos

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Community: https://www.mongodb.com/try/download/community
- MongoDB Compass: https://www.mongodb.com/try/download/compass
- Documentación: https://docs.mongodb.com/

---

**¿Listo para continuar?** 
Elige MongoDB Atlas (5 minutos) o instala MongoDB Community Server (20 minutos), y luego ejecuta:

```powershell
npm run seed:collection-points
```
