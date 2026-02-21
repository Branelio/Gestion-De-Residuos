# 📖 Historias de Usuario - Sistema de Gestión de Residuos

**Proyecto**: Sistema de Gestión Inteligente de Residuos Sólidos para Latacunga  
**Fecha**: Febrero 2026  
**Versión**: 1.0

---

## 👥 Actores del Sistema

### 🟢 Actor Principal
- **Ciudadano**: Usuario general de la aplicación móvil

### 🔵 Actores Secundarios
- **Administrador Municipal**: Personal de EPAGAL que gestiona el sistema
- **Recolector**: Personal que realiza las rutas de recolección
- **Sistema IA**: Sistema automatizado de verificación de reportes

---

## 📱 ÉPICAS Y HISTORIAS DE USUARIO

### ÉPICA 1: Autenticación y Perfil de Usuario

#### 🎯 HU-01: Registro de Usuario
**Como** ciudadano de Latacunga  
**Quiero** registrarme en la aplicación con mi información personal  
**Para** poder acceder a todas las funcionalidades del sistema

**Criterios de Aceptación:**
- ✅ El usuario debe proporcionar: nombre, correo, contraseña, teléfono
- ✅ El correo debe ser único en el sistema
- ✅ La contraseña debe tener mínimo 8 caracteres
- ✅ Al registrarse, el usuario recibe 0 puntos iniciales
- ✅ El sistema envía confirmación de registro

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 5  
**Relacionado con:** LoginScreen.tsx, AuthService

---

#### 🎯 HU-02: Inicio de Sesión
**Como** usuario registrado  
**Quiero** iniciar sesión con mi correo y contraseña  
**Para** acceder a mi perfil y funcionalidades personalizadas

**Criterios de Aceptación:**
- ✅ El usuario puede iniciar sesión con correo y contraseña
- ✅ El sistema valida las credenciales contra la base de datos
- ✅ Si las credenciales son correctas, se genera un token JWT
- ✅ Si son incorrectas, muestra mensaje de error claro
- ✅ El token se almacena localmente para sesiones futuras

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 3  
**Relacionado con:** LoginScreen.tsx, JWT Service

---

#### 🎯 HU-03: Visualizar Perfil
**Como** usuario autenticado  
**Quiero** ver mi información de perfil  
**Para** conocer mis datos personales, puntos acumulados y nivel actual

**Criterios de Aceptación:**
- ✅ Muestra nombre, correo, teléfono del usuario
- ✅ Muestra puntos totales acumulados
- ✅ Muestra nivel actual (Novato, Bronce, Plata, Oro, Platino, Diamante)
- ✅ Muestra barra de progreso hacia el siguiente nivel
- ✅ Muestra cantidad de reportes realizados

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 3  
**Relacionado con:** ProfileScreen.tsx, UserService

---

#### 🎯 HU-04: Editar Perfil
**Como** usuario autenticado  
**Quiero** editar mi información personal  
**Para** mantener mis datos actualizados

**Criterios de Aceptación:**
- ✅ El usuario puede editar: nombre, teléfono, foto de perfil
- ✅ No puede cambiar el correo (es único)
- ✅ Los cambios se guardan en la base de datos
- ✅ Muestra confirmación al guardar exitosamente
- ✅ Valida que los campos no estén vacíos

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 5  
**Relacionado con:** EditProfileScreen.tsx, UserService

---

### ÉPICA 2: Gestión de Reportes de Residuos

#### 🎯 HU-05: Crear Reporte de Residuo
**Como** ciudadano  
**Quiero** reportar un problema de residuos (contenedor desbordado, basura ilegal, etc.)  
**Para** notificar a las autoridades y contribuir a la limpieza de la ciudad

**Criterios de Aceptación:**
- ✅ El usuario debe seleccionar tipo de reporte:
  - Contenedor desbordado (OVERFLOW)
  - Basural ilegal (ILLEGAL_DUMP)
  - Contenedor dañado (DAMAGED_CONTAINER)
  - Recolección no realizada (MISSED_COLLECTION)
- ✅ Debe proporcionar descripción del problema
- ✅ Debe tomar o seleccionar una fotografía
- ✅ El sistema captura automáticamente la ubicación GPS actual
- ✅ El sistema envía el reporte al backend
- ✅ El reporte queda en estado PENDING inicialmente
- ✅ Muestra modal de éxito con confirmación

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 8  
**Relacionado con:** ReportScreen.tsx, WasteReportService, CreateWasteReportUseCase

---

#### 🎯 HU-06: Ver Mis Reportes
**Como** usuario  
**Quiero** ver el historial de todos mis reportes enviados  
**Para** hacer seguimiento del estado de cada uno

**Criterios de Aceptación:**
- ✅ Muestra lista de todos los reportes del usuario
- ✅ Por cada reporte muestra:
  - Tipo de reporte con icono
  - Descripción
  - Fecha y hora de creación
  - Estado actual (Pendiente, En Progreso, Resuelto, Rechazado)
  - Puntos ganados (si fue verificado)
- ✅ Permite filtrar por estado
- ✅ Ordena por fecha (más recientes primero)
- ✅ Al tocar un reporte, muestra detalles completos

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 5  
**Relacionado con:** MyReportsScreen.tsx, WasteReportService

---

#### 🎯 HU-07: Verificación Automática por IA
**Como** sistema  
**Quiero** verificar automáticamente la validez de los reportes con fotografías  
**Para** otorgar puntos solo a reportes legítimos y evitar spam

**Criterios de Aceptación:**
- ✅ Al recibir un reporte, el sistema analiza la fotografía
- ✅ Si la IA confirma que es válido, marca reporte como verificado
- ✅ Otorga puntos al usuario según tipo de reporte:
  - OVERFLOW: 10 puntos
  - ILLEGAL_DUMP: 25 puntos
  - DAMAGED_CONTAINER: 15 puntos
  - MISSED_COLLECTION: 20 puntos
- ✅ Si no es válido o es spam, no otorga puntos
- ✅ Notifica al usuario del resultado de la verificación

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 13  
**Relacionado con:** WasteReportService, IA Service

---

### ÉPICA 3: Localización y Navegación

#### 🎯 HU-08: Visualizar Mapa de Puntos de Acopio
**Como** ciudadano  
**Quiero** ver un mapa con todos los puntos de acopio cercanos  
**Para** saber dónde depositar mis residuos correctamente

**Criterios de Aceptación:**
- ✅ Muestra mapa centrado en la ubicación actual del usuario
- ✅ Muestra marcadores de todos los puntos de acopio visibles
- ✅ Los marcadores tienen colores según estado:
  - Verde: Disponible (< 90% capacidad)
  - Naranja: Casi lleno (90-99%)
  - Rojo: Lleno (≥ 100%)
  - Gris: En mantenimiento
- ✅ Al tocar un marcador, muestra información del punto:
  - Nombre
  - Tipo (contenedor, centro de acopio, relleno)
  - Capacidad actual
  - Dirección
- ✅ Botón para centrar en ubicación actual

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 8  
**Relacionado con:** MapScreen.tsx, CustomMap.tsx, CollectionPointService

---

#### 🎯 HU-09: Buscar Punto de Acopio Más Cercano
**Como** ciudadano con residuos para depositar  
**Quiero** encontrar el punto de acopio disponible más cercano a mi ubicación  
**Para** reducir el tiempo y distancia de desplazamiento

**Criterios de Aceptación:**
- ✅ El sistema obtiene la ubicación actual del usuario
- ✅ Calcula distancia a todos los puntos disponibles
- ✅ Ordena por distancia (más cercano primero)
- ✅ Muestra lista con:
  - Nombre del punto
  - Distancia en metros/kilómetros
  - Tiempo estimado caminando
  - Estado de capacidad
- ✅ Permite filtrar por tipo de punto
- ✅ Al seleccionar un punto, muestra ruta en el mapa

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 8  
**Relacionado con:** PointsListScreen.tsx, NearbyPointsList.tsx, FindNearestCollectionPointUseCase

---

#### 🎯 HU-10: Obtener Indicaciones de Navegación
**Como** ciudadano  
**Quiero** obtener indicaciones paso a paso para llegar a un punto de acopio  
**Para** encontrarlo fácilmente sin perderme

**Criterios de Aceptación:**
- ✅ Al seleccionar un punto, muestra ruta en el mapa
- ✅ Calcula ruta óptima usando API OSRM
- ✅ Muestra línea de ruta en color visible
- ✅ Indica distancia total y tiempo estimado
- ✅ Botón para abrir navegación en Google Maps o similar
- ✅ Actualiza ruta si el usuario se mueve

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 8  
**Relacionado con:** MapScreen.tsx, OSRM Service

---

### ÉPICA 4: Gamificación y Logros

#### 🎯 HU-11: Acumular Puntos por Acciones
**Como** usuario activo  
**Quiero** ganar puntos por realizar acciones positivas  
**Para** subir de nivel y desbloquear recompensas

**Criterios de Aceptación:**
- ✅ El usuario gana puntos por:
  - Crear reporte verificado: 10-25 puntos según tipo
  - Completar nivel educativo: 50 puntos
  - Login diario consecutivo: 5 puntos
  - Compartir en redes: 10 puntos
- ✅ Los puntos se suman al total del usuario
- ✅ Al acumular suficientes puntos, sube de nivel
- ✅ Muestra notificación al ganar puntos
- ✅ Los puntos se reflejan inmediatamente en el perfil

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 8  
**Relacionado con:** GamificationService, User Entity

---

#### 🎯 HU-12: Sistema de Niveles y Rangos
**Como** usuario  
**Quiero** progresar a través de diferentes niveles según mis puntos  
**Para** sentir logro y motivación por mi participación

**Criterios de Aceptación:**
- ✅ Niveles disponibles:
  - Novato: 0-99 puntos
  - Bronce: 100-299 puntos
  - Plata: 300-599 puntos
  - Oro: 600-999 puntos
  - Platino: 1000-1999 puntos
  - Diamante: 2000+ puntos
- ✅ Muestra barra de progreso visual hacia siguiente nivel
- ✅ Al subir de nivel, muestra animación de celebración
- ✅ Cada nivel desbloquea badge digital
- ✅ Se puede ver nivel en perfil y rankings

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 5  
**Relacionado con:** GamificationScreen.tsx, User Entity

---

#### 🎯 HU-13: Ver Rankings y Leaderboards
**Como** usuario competitivo  
**Quiero** ver un ranking de usuarios con más puntos  
**Para** compararme con otros y motivarme a participar más

**Criterios de Aceptación:**
- ✅ Muestra top 10 usuarios con más puntos
- ✅ Por cada usuario muestra:
  - Posición en ranking (#1, #2, etc.)
  - Nombre de usuario
  - Puntos totales
  - Nivel actual
  - Avatar (si tiene)
- ✅ Resalta la posición del usuario actual
- ✅ Muestra íconos especiales para top 3:
  - 🥇 Oro para 1er lugar
  - 🥈 Plata para 2do lugar
  - 🥉 Bronce para 3er lugar
- ✅ Se actualiza en tiempo real

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 5  
**Relacionado con:** GamificationScreen.tsx, UserService

---

#### 🎯 HU-14: Desbloquear Logros y Badges
**Como** usuario  
**Quiero** desbloquear logros por completar hitos  
**Para** coleccionarlos y mostrar mi compromiso ambiental

**Criterios de Aceptación:**
- ✅ Logros disponibles:
  - "Primer Reporte": Crear primer reporte
  - "Eco-Guerrero": 10 reportes verificados
  - "Guardián Verde": 50 reportes verificados
  - "Educado": Completar todos los niveles educativos
  - "Fiel": 7 días de login consecutivo
  - "Leyenda": Llegar a nivel Diamante
- ✅ Muestra progreso hacia cada logro
- ✅ Al desbloquear, muestra notificación y animación
- ✅ Los badges se muestran en el perfil
- ✅ Son visibles para otros usuarios

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 8  
**Relacionado con:** GamificationScreen.tsx, Achievement System

---

### ÉPICA 5: Educación Ambiental

#### 🎯 HU-15: Acceder a Contenido Educativo
**Como** ciudadano  
**Quiero** aprender sobre clasificación de residuos y reciclaje  
**Para** mejorar mis prácticas ambientales

**Criterios de Aceptación:**
- ✅ Muestra módulos educativos organizados por nivel:
  - Básico: Clasificación de residuos
  - Intermedio: Reducir, Reusar, Reciclar
  - Avanzado: Economía circular y compostaje
- ✅ Cada módulo incluye:
  - Texto explicativo con imágenes
  - Videos instructivos (opcional)
  - Quiz de evaluación
- ✅ Marca módulos completados con ✅
- ✅ Desbloquea módulos progresivamente
- ✅ Al completar módulo, otorga 50 puntos

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 8  
**Relacionado con:** EducationScreen.tsx, EducationService

---

#### 🎯 HU-16: Tomar Quiz Educativo
**Como** usuario  
**Quiero** responder preguntas sobre el contenido aprendido  
**Para** demostrar mi conocimiento y ganar puntos

**Criterios de Aceptación:**
- ✅ Al finalizar un módulo, presenta quiz con 5 preguntas
- ✅ Preguntas de opción múltiple (4 opciones)
- ✅ Indica respuesta correcta/incorrecta inmediatamente
- ✅ Para aprobar requiere mínimo 80% (4/5 correctas)
- ✅ Si aprueba:
  - Marca módulo como completado
  - Otorga 50 puntos
  - Desbloquea siguiente módulo
- ✅ Si no aprueba, puede reintentar después de 24h

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 5  
**Relacionado con:** EducationScreen.tsx, Quiz Component

---

### ÉPICA 6: Estadísticas y Actividad

#### 🎯 HU-17: Ver Estadísticas Personales
**Como** usuario  
**Quiero** ver estadísticas de mi impacto ambiental  
**Para** entender mi contribución a la ciudad

**Criterios de Aceptación:**
- ✅ Muestra métricas visuales con gráficos:
  - Total de reportes creados
  - Reportes por tipo (gráfico de torta)
  - Reportes por estado
  - Tendencia de reportes por mes (gráfico de líneas)
  - Puntos ganados en el tiempo
- ✅ Calcula impacto estimado:
  - Kilogramos de residuos gestionados
  - Árboles salvados (estimación)
  - CO₂ evitado (estimación)
- ✅ Permite seleccionar período: semana, mes, año, todo
- ✅ Muestra comparación con período anterior

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 8  
**Relacionado con:** StatsScreen.tsx, AnalyticsService

---

#### 🎯 HU-18: Ver Feed de Actividad Reciente
**Como** usuario  
**Quiero** ver un feed con la actividad reciente de la comunidad  
**Para** mantenerme informado de lo que sucede en el sistema

**Criterios de Aceptación:**
- ✅ Muestra timeline de eventos recientes:
  - Reportes resueltos
  - Usuarios que subieron de nivel
  - Nuevos logros desbloqueados
  - Puntos de acopio actualizados
- ✅ Cada evento muestra:
  - Icono representativo
  - Descripción del evento
  - Usuario involucrado
  - Tiempo transcurrido ("hace 2 horas")
- ✅ Se actualiza en tiempo real (o al hacer pull-to-refresh)
- ✅ Permite dar "me gusta" a eventos
- ✅ Ordena por más reciente primero

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 5  
**Relacionado con:** ActivityScreen.tsx, ActivityService

---

### ÉPICA 7: Administración Municipal (Admin)

#### 🎯 HU-19: Gestionar Puntos de Acopio
**Como** administrador de EPAGAL  
**Quiero** crear, editar y eliminar puntos de acopio  
**Para** mantener actualizada la información del sistema

**Criterios de Aceptación:**
- ✅ El admin puede crear nuevo punto con:
  - Nombre, tipo, coordenadas GPS
  - Capacidad total en kg
  - Dirección, horarios
  - Estado inicial
- ✅ Puede editar puntos existentes
- ✅ Puede cambiar estado (disponible, mantenimiento, fuera de servicio)
- ✅ Puede actualizar nivel de carga actual
- ✅ Puede eliminar puntos (con confirmación)
- ✅ Los cambios se reflejan inmediatamente en app móvil

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 8  
**Relacionado con:** Admin Dashboard, CollectionPointController

---

#### 🎯 HU-20: Revisar y Gestionar Reportes
**Como** administrador  
**Quiero** revisar todos los reportes enviados por ciudadanos  
**Para** validarlos, asignar personal y marcar como resueltos

**Criterios de Aceptación:**
- ✅ Ve lista completa de reportes en dashboard
- ✅ Puede filtrar por:
  - Estado (pendiente, en progreso, resuelto)
  - Tipo de reporte
  - Fecha
  - Zona geográfica
- ✅ Por cada reporte ve:
  - Información completa del usuario
  - Fotografía adjunta
  - Ubicación en mapa
  - Descripción
- ✅ Puede cambiar estado del reporte:
  - PENDING → IN_PROGRESS (asignar a recolector)
  - IN_PROGRESS → RESOLVED (marcar resuelto)
  - PENDING/IN_PROGRESS → REJECTED (rechazar si es inválido)
- ✅ Al resolver, notifica al usuario

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 13  
**Relacionado con:** Admin Dashboard, WasteReportController

---

#### 🎯 HU-21: Ver Dashboard de Métricas
**Como** administrador  
**Quiero** ver métricas y KPIs del sistema  
**Para** tomar decisiones informadas sobre la gestión de residuos

**Criterios de Aceptación:**
- ✅ Muestra dashboard con:
  - Total de usuarios registrados
  - Total de reportes (por estado)
  - Puntos de acopio críticos (> 90% llenos)
  - Reportes por zona de la ciudad (mapa de calor)
  - Tendencias temporales (gráficos)
  - Usuarios más activos
  - Tiempo promedio de resolución de reportes
- ✅ Permite exportar datos a Excel/PDF
- ✅ Actualización en tiempo real
- ✅ Filtros por período de tiempo

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 13  
**Relacionado con:** Admin Dashboard, Analytics

---

### ÉPICA 8: Optimización de Rutas

#### 🎯 HU-22: Calcular Ruta Óptima de Recolección
**Como** sistema  
**Quiero** calcular la ruta más eficiente para recolectar residuos  
**Para** minimizar distancia, tiempo y emisiones de CO₂

**Criterios de Aceptación:**
- ✅ Identifica puntos de acopio que necesitan vaciarse (> 80% llenos)
- ✅ Aplica algoritmo de optimización (TSP - Traveling Salesman Problem)
- ✅ Considera restricciones:
  - Horarios de recolección
  - Capacidad del vehículo
  - Tipo de residuo
  - Tráfico en tiempo real
- ✅ Genera ruta con waypoints ordenados
- ✅ Calcula métricas:
  - Distancia total en km
  - Tiempo estimado
  - Ahorro vs ruta tradicional (%)
  - CO₂ evitado
- ✅ Permite guardar ruta

**Prioridad:** 🔴 CRÍTICA  
**Puntos de Historia:** 13  
**Relacionado con:** OptimizeCollectionRouteUseCase, OSRM Service

---

#### 🎯 HU-23: Ver Rutas Optimizadas
**Como** recolector o administrador  
**Quiero** ver las rutas de recolección planificadas  
**Para** ejecutarlas eficientemente

**Criterios de Aceptación:**
- ✅ Muestra lista de rutas guardadas
- ✅ Por cada ruta muestra:
  - Fecha de creación
  - Cantidad de puntos a visitar
  - Distancia total
  - Tiempo estimado
  - Estado (pendiente, en progreso, completada)
- ✅ Al seleccionar una ruta, muestra:
  - Mapa con todos los puntos
  - Línea de ruta conectando puntos en orden
  - Lista ordenada de waypoints
- ✅ Botón para iniciar navegación
- ✅ Permite marcar puntos como visitados

**Prioridad:** 🟡 ALTA  
**Puntos de Historia:** 8  
**Relacionado con:** MyRoutesScreen.tsx, RouteService

---

### ÉPICA 9: Notificaciones y Feedback

#### 🎯 HU-24: Recibir Notificaciones Push
**Como** usuario  
**Quiero** recibir notificaciones sobre eventos relevantes  
**Para** mantenerme informado sin abrir la app constantemente

**Criterios de Aceptación:**
- ✅ El usuario recibe notificaciones por:
  - Reporte verificado y puntos otorgados
  - Cambio de estado de reporte (en progreso, resuelto)
  - Subida de nivel
  - Nuevo logro desbloqueado
  - Punto de acopio cercano lleno
  - Recordatorio de actividad (si lleva 7 días sin reportar)
- ✅ Notificaciones tienen título, mensaje y acción
- ✅ Al tocar notificación, abre pantalla relevante
- ✅ El usuario puede desactivar notificaciones en configuración

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 8  
**Relacionado con:** Push Notification Service, Expo Notifications

---

#### 🎯 HU-25: Enviar Feedback al Sistema
**Como** usuario  
**Quiero** enviar comentarios, sugerencias o reportar bugs  
**Para** ayudar a mejorar la aplicación

**Criterios de Aceptación:**
- ✅ Formulario de feedback con campos:
  - Tipo (sugerencia, bug, queja, felicitación)
  - Descripción detallada
  - Captura de pantalla opcional
  - Calificación de 1-5 estrellas
- ✅ Valida que descripción tenga mínimo 20 caracteres
- ✅ Envía feedback al backend
- ✅ Muestra confirmación de envío
- ✅ Admin puede ver todos los feedbacks en dashboard
- ✅ El usuario recibe respuesta vía notificación

**Prioridad:** 🟢 MEDIA  
**Puntos de Historia:** 5  
**Relacionado con:** SubmitUserFeedbackUseCase, Feedback Form

---

## 📊 Resumen de Prioridades

### 🔴 Críticas (13 historias - 70 puntos)
HU-01, HU-02, HU-05, HU-08, HU-20, HU-22

### 🟡 Altas (10 historias - 61 puntos)
HU-03, HU-04, HU-06, HU-09, HU-11, HU-12, HU-15, HU-19, HU-23

### 🟢 Medias (12 historias - 95 puntos)
HU-07, HU-10, HU-13, HU-14, HU-16, HU-17, HU-18, HU-21, HU-24, HU-25

**Total: 35 historias | 226 puntos de historia**

---

## 🎯 Roadmap de Sprints Recomendado

### Sprint 1 (2 semanas) - Fundación
Autenticación + Perfil + Infraestructura  
**HU-01, HU-02, HU-03**

### Sprint 2 (2 semanas) - Reportes Core
Crear y ver reportes + Mapa básico  
**HU-05, HU-06, HU-08**

### Sprint 3 (2 semanas) - Navegación
Búsqueda de puntos + Navegación  
**HU-09, HU-10, HU-23**

### Sprint 4 (2 semanas) - Gamificación
Puntos, niveles, rankings  
**HU-11, HU-12, HU-13, HU-14**

### Sprint 5 (2 semanas) - Educación
Módulos educativos + Quiz  
**HU-15, HU-16**

### Sprint 6 (2 semanas) - Analytics
Estadísticas + Actividad  
**HU-17, HU-18**

### Sprint 7 (2 semanas) - Admin
Dashboard administrativo  
**HU-19, HU-20, HU-21**

### Sprint 8 (2 semanas) - Optimización
Rutas óptimas + IA  
**HU-07, HU-22**

### Sprint 9 (1 semana) - Notificaciones
Push notifications + Feedback  
**HU-24, HU-25**

### Sprint 10 (1 semana) - Pulido
Editar perfil + mejoras UX  
**HU-04**

---

## 📝 Plantilla de Historia de Usuario

```markdown
#### 🎯 HU-XX: [Título Descriptivo]
**Como** [tipo de usuario]  
**Quiero** [acción/funcionalidad]  
**Para** [beneficio/valor]

**Criterios de Aceptación:**
- ✅ [Criterio 1]
- ✅ [Criterio 2]
- ✅ [Criterio 3]

**Prioridad:** 🔴 CRÍTICA | 🟡 ALTA | 🟢 MEDIA  
**Puntos de Historia:** [1-13]  
**Relacionado con:** [Archivos/Componentes del código]
```

---

## 📚 Referencias
- **Código fuente**: `/frontend/mobile/src/screens/`
- **Casos de uso**: `/backend/src/application/use-cases/`
- **Entidades**: `/backend/src/domain/entities/`
- **Arquitectura**: `ARCHITECTURE.md`

---

**Elaborado por**: Equipo de Desarrollo  
**Fecha última actualización**: Febrero 2026
