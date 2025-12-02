# Guía de Inicio Rápido

## 🚀 Comenzar en 5 minutos

### 1. Instalar Dependencias

#### Backend
```powershell
cd backend
npm install
```

#### Frontend
```powershell
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

#### Backend
```powershell
cd backend
Copy-Item .env.example .env
# Editar .env con tus configuraciones
```

#### Frontend
```powershell
cd frontend
Copy-Item .env.example .env
# La configuración por defecto funciona para desarrollo local
```

### 3. Iniciar con Docker (Recomendado)

```powershell
# Desde la raíz del proyecto
docker-compose up --build
```

Acceder a:
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:3000
- 🗄️ MongoDB: localhost:27017

### 4. O Iniciar Manualmente

#### Terminal 1 - MongoDB
```powershell
# Si tienes MongoDB instalado localmente
mongod --dbpath C:\data\db
```

#### Terminal 2 - Backend
```powershell
cd backend
npm run dev
```

#### Terminal 3 - Frontend
```powershell
cd frontend
npm run dev
```

## 📝 Comandos Útiles

### Backend
```powershell
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Ejecutar tests
npm run lint         # Verificar código
npm run format       # Formatear código
```

### Frontend
```powershell
npm run dev          # Desarrollo con hot-reload
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Verificar código
npm run format       # Formatear código
```

### Docker
```powershell
docker-compose up -d              # Iniciar en segundo plano
docker-compose down               # Detener contenedores
docker-compose logs -f            # Ver logs en tiempo real
docker-compose logs -f backend    # Ver logs del backend
docker-compose restart            # Reiniciar servicios
```

## 🧪 Ejecutar Tests

```powershell
# Backend
cd backend
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:coverage       # Con cobertura
```

## 🐛 Troubleshooting

### Error: Puerto en uso
```powershell
# Windows - Matar proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Windows - Matar proceso en puerto 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### Error: MongoDB no conecta
```powershell
# Verificar que MongoDB está corriendo
docker ps | Select-String mongodb

# Ver logs de MongoDB
docker-compose logs mongodb
```

### Error: Dependencias no encontradas
```powershell
# Limpiar e instalar de nuevo
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

## 📚 Próximos Pasos

1. ✅ Explorar la estructura del proyecto
2. ✅ Leer la documentación en `ARCHITECTURE.md`
3. ✅ Revisar las entidades del dominio en `backend/src/domain/entities/`
4. ✅ Explorar los casos de uso en `backend/src/application/use-cases/`
5. ✅ Revisar los componentes del frontend en `frontend/src/presentation/`

## 🤝 Contribuir

1. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -m 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📞 Soporte

Si tienes problemas:
- 📧 Email: bjsangoluisa@espe.edu.ec, bwchuquitarco@espe.edu.ec
- 📖 Documentación: Ver `README.md` y `ARCHITECTURE.md`
- 🐛 Issues: Crear issue en el repositorio

---

¡Feliz desarrollo! 🚀
