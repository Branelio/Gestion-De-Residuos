# 📚 Documentación del Sistema - Gestión de Residuos

Este directorio contiene toda la documentación técnica y especificaciones del Sistema de Gestión Inteligente de Residuos Sólidos para Latacunga.

---

## 📋 Índice de Documentos

### 🎯 Historias de Usuario y Requisitos

| Documento | Descripción | Uso Principal |
|-----------|-------------|---------------|
| **[USER_STORIES.md](USER_STORIES.md)** | 📖 Historias de usuario completas con criterios de aceptación | Desarrollo, Testing, Product Owner |
| **[USER_STORIES_CHECKLIST.md](USER_STORIES_CHECKLIST.md)** | ✅ Checklist de progreso y seguimiento | Scrum Master, Daily Standups |
| **[use-cases-diagram.puml](use-cases-diagram.puml)** | 🎨 Diagrama UML de casos de uso | Presentaciones, Documentación técnica |
| **[user-stories-map.puml](user-stories-map.puml)** | 🗺️ Mapa visual de épicas y actores | Planificación de sprints |

### 🏗️ Arquitectura y Diseño

| Documento | Descripción | Uso Principal |
|-----------|-------------|---------------|
| **[architecture-components.puml](architecture-components.puml)** | 🧩 Diagrama de componentes del sistema | Arquitectura, Desarrollo |
| **[architecture-deployment.puml](architecture-deployment.puml)** | 🚀 Diagrama de despliegue | DevOps, Infraestructura |
| **[architecture-layers.puml](architecture-layers.puml)** | 📚 Capas de la arquitectura hexagonal | Desarrollo, Code Review |
| **[architecture-logical.puml](architecture-logical.puml)** | 🧠 Arquitectura lógica del sistema | Diseño, Planificación |
| **[architecture-sequence.puml](architecture-sequence.puml)** | 🔄 Diagramas de secuencia | Desarrollo, Debugging |

---

## 📖 Resumen de Historias de Usuario

### 🎯 Por Prioridad
- 🔴 **CRÍTICAS**: 6 historias (70 puntos) - 31%
- 🟡 **ALTAS**: 10 historias (61 puntos) - 27%
- 🟢 **MEDIAS**: 9 historias (95 puntos) - 42%

**Total: 25 historias | 226 puntos**

### 📦 Por Épica

1. **ÉPICA 1: Autenticación y Perfil** (4 historias - 16 pts)
   - Registro, Login, Perfil, Editar Perfil

2. **ÉPICA 2: Gestión de Reportes** (3 historias - 26 pts)
   - Crear reporte, Ver reportes, Verificación IA

3. **ÉPICA 3: Localización y Navegación** (3 historias - 24 pts)
   - Mapa, Buscar cercano, Navegación

4. **ÉPICA 4: Gamificación y Logros** (4 historias - 26 pts)
   - Puntos, Niveles, Rankings, Logros

5. **ÉPICA 5: Educación Ambiental** (2 historias - 13 pts)
   - Contenido educativo, Quiz

6. **ÉPICA 6: Estadísticas y Actividad** (2 historias - 13 pts)
   - Stats personales, Activity feed

7. **ÉPICA 7: Administración Municipal** (3 historias - 34 pts)
   - Gestionar puntos, Gestionar reportes, Dashboard

8. **ÉPICA 8: Optimización de Rutas** (2 historias - 21 pts)
   - Calcular ruta óptima, Ver rutas

9. **ÉPICA 9: Notificaciones y Feedback** (2 historias - 13 pts)
   - Push notifications, Feedback

---

## 👥 Actores del Sistema

### 🟢 Actor Principal
- **👤 Ciudadano**: Usuario de la app móvil (20 historias)
  - Reporta problemas de residuos
  - Busca puntos de acopio
  - Participa en gamificación
  - Aprende sobre reciclaje

### 🔵 Actores Secundarios
- **👨‍💼 Administrador Municipal**: Personal de EPAGAL (3 historias)
  - Gestiona puntos de acopio
  - Supervisa reportes
  - Analiza métricas

- **🚛 Recolector**: Personal de recolección (1 historia)
  - Ejecuta rutas optimizadas

- **🤖 Sistema IA**: Verificación automatizada (1 historia)
  - Verifica fotografías de reportes

---

## 🏃 Roadmap de Sprints

| Sprint | Semanas | Épicas | Puntos | Objetivo |
|--------|---------|--------|--------|----------|
| Sprint 1 | 2 | Épica 1 | 11 | Autenticación básica |
| Sprint 2 | 2 | Épicas 2-3 | 21 | Reportes + Mapa |
| Sprint 3 | 2 | Épica 3 + 8 | 24 | Navegación + Rutas |
| Sprint 4 | 2 | Épica 4 | 26 | Gamificación |
| Sprint 5 | 2 | Épica 5 | 13 | Educación |
| Sprint 6 | 2 | Épica 6 | 13 | Estadísticas |
| Sprint 7 | 2 | Épica 7 | 34 | Admin Dashboard |
| Sprint 8 | 2 | Épicas 2 + 8 | 26 | IA + Optimización |
| Sprint 9 | 1 | Épica 9 | 13 | Notificaciones |
| Sprint 10 | 1 | Épica 1 | 5 | Pulido final |

**Duración estimada**: 19 semanas (~5 meses)

---

## 🎨 Cómo Ver los Diagramas PlantUML

### Opción 1: VS Code (Recomendado)
1. Instalar extensión: **PlantUML** by jebbs
2. Abrir archivo `.puml`
3. Presionar `Alt+D` para preview

### Opción 2: Online
1. Visitar: https://www.plantuml.com/plantuml/
2. Copiar contenido del archivo `.puml`
3. Pegar y generar diagrama

### Opción 3: Generar Imágenes
```bash
# Instalar PlantUML
npm install -g node-plantuml

# Generar PNG
puml generate architecture-components.puml -o output.png
```

---

## 📝 Plantillas y Formatos

### Plantilla de Historia de Usuario
```markdown
#### 🎯 HU-XX: [Título]
**Como** [actor]  
**Quiero** [acción]  
**Para** [beneficio]

**Criterios de Aceptación:**
- ✅ Criterio 1
- ✅ Criterio 2

**Prioridad:** 🔴/🟡/🟢  
**Puntos:** [1-13]  
**Relacionado con:** [archivos]
```

### Criterios de Definición de Terminado (DoD)
- ✅ Código implementado y funcional
- ✅ Tests unitarios (>80% cobertura)
- ✅ Code review aprobado
- ✅ Documentación actualizada
- ✅ Integrado sin conflictos
- ✅ Probado en dispositivo real
- ✅ Aprobado por PO/Cliente

---

## 🔗 Referencias Cruzadas

### Documentación General
- [RESUMEN_EJECUTIVO_PROYECTO.md](../RESUMEN_EJECUTIVO_PROYECTO.md) - Estado general del proyecto tesis
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Documentación técnica completa
- [QUICKSTART.md](../QUICKSTART.md) - Guía de inicio rápido

### Código Fuente
- **Backend**: [../backend/src/](../backend/src/)
  - Use Cases: [../backend/src/application/use-cases/](../backend/src/application/use-cases/)
  - Entities: [../backend/src/domain/entities/](../backend/src/domain/entities/)
  - Controllers: [../backend/src/infrastructure/http/controllers/](../backend/src/infrastructure/http/controllers/)

- **Frontend Mobile**: [../frontend/mobile/src/](../frontend/mobile/src/)
  - Screens: [../frontend/mobile/src/screens/](../frontend/mobile/src/screens/)
  - Services: [../frontend/mobile/src/services/](../frontend/mobile/src/services/)
  - Components: [../frontend/mobile/src/components/](../frontend/mobile/src/components/)

---

## 📊 Herramientas Recomendadas

### Para Gestión de Proyecto
- **Jira** / **Trello** - Tracking de historias de usuario
- **Miro** / **FigJam** - Story mapping colaborativo
- **Confluence** - Wiki del proyecto

### Para Desarrollo
- **VS Code** - Editor principal
- **PlantUML** - Diagramas UML
- **Draw.io** - Diagramas adicionales
- **Postman** - Testing de API

### Para Testing
- **Jest** - Tests unitarios backend
- **React Native Testing Library** - Tests frontend
- **Detox** - Tests E2E mobile

---

## 📞 Contacto y Contribuciones

### Autores del Proyecto
- **Sangolquiza Branel** - Developer
- **Chuquitarco** - Developer

### Institución
**Universidad de las Fuerzas Armadas ESPE**  
Proyecto de Tesis - 2026

### Cómo Contribuir
1. Revisa las historias de usuario pendientes
2. Asigna una historia en el sprint actual
3. Implementa siguiendo los criterios de aceptación
4. Crea pull request con referencia a HU-XX
5. Solicita code review
6. Actualiza el checklist al completar

---

## 📈 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-02-19 | 1.0 | Creación inicial de documentación de historias de usuario |
| 2026-02-19 | 1.0 | Diagramas PlantUML de casos de uso |
| 2026-02-19 | 1.0 | Checklist de seguimiento |

---

## 🎯 Próximos Pasos

1. ✅ Revisar y aprobar historias de usuario con stakeholders
2. ⬜ Priorizar backlog con Product Owner
3. ⬜ Planificar Sprint 1 en detalle
4. ⬜ Crear tickets en Jira/Trello
5. ⬜ Comenzar desarrollo del Sprint 1

---

**📌 Última actualización**: 19 de Febrero, 2026  
**🔄 Estado**: Documentación completa - Lista para desarrollo
