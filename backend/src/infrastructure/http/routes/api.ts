import { Router } from 'express';
import { CollectionPointController } from '../controllers/CollectionPointController';
import { RouteOptimizationController } from '../controllers/RouteOptimizationController';
import { WasteReportController } from '../controllers/WasteReportController';
import authRoutes from './auth';

const router = Router();

// Inicializar controllers
const collectionPointController = new CollectionPointController();
const routeOptimizationController = new RouteOptimizationController();
const wasteReportController = new WasteReportController();

/**
 * ============================================
 * RUTAS DE AUTENTICACIÓN
 * ============================================
 */
router.use('/auth', authRoutes);

/**
 * ============================================
 * RUTAS DE PUNTOS DE ACOPIO
 * ============================================
 */

/**
 * @swagger
 * /api/collection-points:
 *   get:
 *     summary: Obtener todos los puntos de acopio
 *     tags: [Collection Points]
 *     responses:
 *       200:
 *         description: Lista de puntos de acopio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CollectionPoint'
 *                 count:
 *                   type: number
 *                   example: 22
 */
router.get(
  '/collection-points',
  (req, res) => collectionPointController.getAll(req, res)
);

/**
 * @swagger
 * /api/collection-points/stats/summary:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Collection Points]
 *     responses:
 *       200:
 *         description: Estadísticas de todos los puntos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 22
 *                     available:
 *                       type: number
 *                       example: 20
 *                     full:
 *                       type: number
 *                       example: 2
 *                     totalCapacity:
 *                       type: number
 *                       example: 40000
 *                     totalLoad:
 *                       type: number
 *                       example: 15770
 *                     averageFillPercentage:
 *                       type: number
 *                       example: 39
 */
router.get(
  '/collection-points/stats/summary',
  (req, res) => collectionPointController.getStats(req, res)
);

/**
 * @swagger
 * /api/collection-points/nearby:
 *   get:
 *     summary: Buscar puntos de acopio cercanos
 *     tags: [Collection Points]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           example: -0.9346
 *         description: Latitud de la ubicación
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           example: -78.6156
 *         description: Longitud de la ubicación
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           example: 5
 *         description: Radio de búsqueda en kilómetros (default 10km)
 *     responses:
 *       200:
 *         description: Puntos de acopio cercanos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CollectionPoint'
 *                 count:
 *                   type: number
 *                 searchRadius:
 *                   type: number
 *                 userLocation:
 *                   $ref: '#/components/schemas/Coordinates'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/collection-points/nearby',
  (req, res) => collectionPointController.getNearby(req, res)
);

/**
 * @swagger
 * /api/collection-points/{id}:
 *   get:
 *     summary: Obtener un punto de acopio por ID
 *     tags: [Collection Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: CP-001-MATRIZ
 *         description: ID del punto de acopio
 *     responses:
 *       200:
 *         description: Punto de acopio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CollectionPoint'
 *       404:
 *         description: Punto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/collection-points/:id',
  (req, res) => collectionPointController.getById(req, res)
);

/**
 * ============================================
 * RUTAS DE OPTIMIZACIÓN
 * ============================================
 */

/**
 * @swagger
 * /api/routes/optimize:
 *   post:
 *     summary: Optimizar ruta de recolección específica
 *     tags: [Route Optimization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startLocation
 *               - collectionPointIds
 *             properties:
 *               startLocation:
 *                 $ref: '#/components/schemas/Coordinates'
 *               collectionPointIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CP-001-MATRIZ", "CP-004-VLEON", "CP-005-ELSALTO"]
 *               returnToStart:
 *                 type: boolean
 *                 default: true
 *                 description: Si debe regresar al punto de inicio
 *     responses:
 *       200:
 *         description: Ruta optimizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OptimizedRoute'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/routes/optimize',
  (req, res) => routeOptimizationController.optimizeRoute(req, res)
);

/**
 * @swagger
 * /api/routes/optimize-nearby:
 *   post:
 *     summary: Optimizar ruta con puntos cercanos a una ubicación
 *     tags: [Route Optimization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startLocation
 *             properties:
 *               startLocation:
 *                 $ref: '#/components/schemas/Coordinates'
 *               radius:
 *                 type: number
 *                 default: 10
 *                 example: 5
 *                 description: Radio de búsqueda en km
 *               maxPoints:
 *                 type: number
 *                 default: 10
 *                 example: 5
 *                 description: Cantidad máxima de puntos a incluir
 *               returnToStart:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Ruta optimizada con puntos cercanos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/OptimizedRoute'
 *                     - type: object
 *                       properties:
 *                         pointsProcessed:
 *                           type: number
 *                         pointsAvailable:
 *                           type: number
 *                         searchRadius:
 *                           type: number
 */
router.post(
  '/routes/optimize-nearby',
  (req, res) => routeOptimizationController.optimizeNearbyRoute(req, res)
);

/**
 * @swagger
 * /api/routes/estimate:
 *   get:
 *     summary: Calcular estimaciones para una distancia
 *     tags: [Route Optimization]
 *     parameters:
 *       - in: query
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *           example: 10.5
 *         description: Distancia en kilómetros
 *     responses:
 *       200:
 *         description: Estimaciones calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     distance:
 *                       type: number
 *                       example: 10.5
 *                     estimatedDuration:
 *                       type: number
 *                       description: Minutos
 *                       example: 21
 *                     estimatedFuelConsumption:
 *                       type: number
 *                       description: Litros
 *                       example: 1.58
 *                     estimatedCost:
 *                       type: number
 *                       description: USD
 *                       example: 3.95
 *                     averageSpeed:
 *                       type: number
 *                       example: 30
 */
router.get(
  '/routes/estimate',
  (req, res) => routeOptimizationController.getEstimates(req, res)
);

/**
 * ============================================
 * RUTAS DE REPORTES DE RESIDUOS
 * ============================================
 */

/**
 * @swagger
 * /api/waste-reports:
 *   post:
 *     summary: Crear un nuevo reporte de residuos
 *     tags: [Waste Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - description
 *               - coordinates
 *               - address
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               type:
 *                 type: string
 *                 enum: [OVERFLOW, ILLEGAL_DUMP, DAMAGED_CONTAINER, MISSED_COLLECTION]
 *                 example: "OVERFLOW"
 *               description:
 *                 type: string
 *                 example: "Contenedor completamente lleno y desbordando"
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: -0.9346
 *                   longitude:
 *                     type: number
 *                     example: -78.6156
 *               address:
 *                 type: string
 *                 example: "Av. Eloy Alfaro y Quito"
 *               photoUrl:
 *                 type: string
 *                 example: "https://storage.com/photo123.jpg"
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/waste-reports',
  (req, res) => wasteReportController.create(req, res)
);

/**
 * @swagger
 * /api/waste-reports:
 *   get:
 *     summary: Obtener todos los reportes
 *     tags: [Waste Reports]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */
router.get(
  '/waste-reports',
  (req, res) => wasteReportController.getAll(req, res)
);

/**
 * @swagger
 * /api/waste-reports/stats:
 *   get:
 *     summary: Obtener estadísticas de reportes
 *     tags: [Waste Reports]
 *     responses:
 *       200:
 *         description: Estadísticas de reportes
 */
router.get(
  '/waste-reports/stats',
  (req, res) => wasteReportController.getStats(req, res)
);

/**
 * @swagger
 * /api/waste-reports/nearby:
 *   get:
 *     summary: Buscar reportes cercanos
 *     tags: [Waste Reports]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Reportes cercanos encontrados
 */
router.get(
  '/waste-reports/nearby',
  (req, res) => wasteReportController.getNearby(req, res)
);

/**
 * @swagger
 * /api/waste-reports/user/{userId}:
 *   get:
 *     summary: Obtener reportes de un usuario
 *     tags: [Waste Reports]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reportes del usuario
 */
router.get(
  '/waste-reports/user/:userId',
  (req, res) => wasteReportController.getByUser(req, res)
);

/**
 * @swagger
 * /api/waste-reports/{id}:
 *   get:
 *     summary: Obtener un reporte por ID
 *     tags: [Waste Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte encontrado
 *       404:
 *         description: Reporte no encontrado
 */
router.get(
  '/waste-reports/:id',
  (req, res) => wasteReportController.getById(req, res)
);

export default router;
