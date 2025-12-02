import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoUserRepository } from '../../repositories/MongoUserRepository';
import { User } from '../../../domain/entities/User';
import { randomUUID } from 'crypto';

const router = Router();
const userRepository = new MongoUserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'latacunga-waste-secret-2025';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Email ya existe
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password y nombre son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Verificar si el email ya existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Crear usuario
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = User.create({
      id: { value: userId },
      email: email.toLowerCase(),
      name,
      role: 'citizen', // Por defecto los nuevos usuarios son ciudadanos
    });

    await userRepository.save(user, hashedPassword);

    // Generar token
    const token = jwt.sign(
      { 
        userId: user.id.value, 
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id.value,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: 'Usuario registrado exitosamente',
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos',
      });
    }

    // Buscar usuario con contraseña
    const result = await userRepository.findByEmailWithPassword(email);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const { user, password: hashedPassword } = result;

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = jwt.sign(
      { 
        userId: user.id.value, 
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id.value,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: 'Login exitoso',
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userRepository.findById({ value: decoded.userId });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      return res.json({
        success: true,
        data: {
          id: user.id.value,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
    });
  }
});

export default router;
