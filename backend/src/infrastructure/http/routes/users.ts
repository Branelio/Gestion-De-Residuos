/**
 * Rutas de gestión de usuarios
 */
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { MongoUserRepository } from '../../repositories/MongoUserRepository';
import { UserModel } from '../../persistence/UserModel';

const router = Router();
const userRepository = new MongoUserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024';

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
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
 *         description: Datos inválidos
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, contraseña y nombre son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Formato de email inválido' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario con rol 'citizen' por defecto
    const newUser = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'citizen',
      points: 0,
      reportsCount: 0,
    });

    // Eliminar la contraseña de la respuesta
    const userResponse = {
      id: newUser.id.value,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      points: newUser.points || 0,
      reportsCount: newUser.reportsCount || 0,
    };

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: userResponse,
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
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
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
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
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points || 0,
          reportsCount: user.reportsCount || 0,
          createdAt: user.createdAt,
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

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       401:
 *         description: No autorizado
 */
router.put('/me', async (req: Request, res: Response) => {
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

      // Actualizar campos permitidos
      const { name, phone, address } = req.body;
      
      if (name) user.updateName(name);
      if (phone !== undefined) user.updatePhone(phone);
      if (address !== undefined) user.updateAddress(address);

      await userRepository.update(user);

      return res.json({
        success: true,
        data: {
          id: user.id.value,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points || 0,
          reportsCount: user.reportsCount || 0,
        },
        message: 'Perfil actualizado exitosamente',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
    });
  }
});

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Cambiar contraseña del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: No autorizado
 */
router.put('/me/password', async (req: Request, res: Response) => {
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

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar la contraseña actual y la nueva',
        });
      }

      // Obtener el usuario con su contraseña hasheada desde la base de datos
      const userWithPassword = await userRepository.findByEmailWithPassword(user.email);
      
      if (!userWithPassword) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta',
        });
      }

      // Validar nueva contraseña
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres',
        });
      }

      // Hash de la nueva contraseña y actualizar en la base de datos
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await UserModel.findByIdAndUpdate(user.id.value, {
        password: hashedPassword,
        updatedAt: new Date(),
      });

      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
    });
  }
});

export default router;
