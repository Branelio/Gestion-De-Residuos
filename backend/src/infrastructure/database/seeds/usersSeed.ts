/**
 * Seed data para usuarios del sistema
 * Incluye diferentes roles: ciudadanos, operadores y administradores
 */

import bcrypt from 'bcryptjs';

// Hash de contraseñas (todas usan: "Latacunga2025!")
const defaultPasswordHash = bcrypt.hashSync('Latacunga2025!', 10);

export const usersData = [
  // ADMINISTRADORES
  {
    _id: '674c1a1b2c3d4e5f6a7b8c9d',
    email: 'admin@latacunga.gob.ec',
    name: 'María González',
    password: defaultPasswordHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-12-01T08:00:00Z'),
    updatedAt: new Date('2024-12-01T08:00:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8c9e',
    email: 'admin.sistemas@latacunga.gob.ec',
    name: 'Carlos Mendoza',
    password: defaultPasswordHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-12-01T08:00:00Z'),
    updatedAt: new Date('2024-12-01T08:00:00Z'),
  },

  // OPERADORES (Personal de recolección)
  {
    _id: '674c1a1b2c3d4e5f6a7b8c9f',
    email: 'operador1@latacunga.gob.ec',
    name: 'Juan Sánchez',
    password: defaultPasswordHash,
    role: 'operator',
    isActive: true,
    createdAt: new Date('2024-11-15T08:00:00Z'),
    updatedAt: new Date('2024-11-15T08:00:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca0',
    email: 'operador2@latacunga.gob.ec',
    name: 'Pedro Ramírez',
    password: defaultPasswordHash,
    role: 'operator',
    isActive: true,
    createdAt: new Date('2024-11-15T08:00:00Z'),
    updatedAt: new Date('2024-11-15T08:00:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca1',
    email: 'operador3@latacunga.gob.ec',
    name: 'Luis Torres',
    password: defaultPasswordHash,
    role: 'operator',
    isActive: true,
    createdAt: new Date('2024-11-15T08:00:00Z'),
    updatedAt: new Date('2024-11-15T08:00:00Z'),
  },

  // CIUDADANOS
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca2',
    email: 'ciudadano1@gmail.com',
    name: 'Ana López',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-20T10:30:00Z'),
    updatedAt: new Date('2024-11-20T10:30:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca3',
    email: 'ciudadano2@gmail.com',
    name: 'Roberto Flores',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-21T14:20:00Z'),
    updatedAt: new Date('2024-11-21T14:20:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca4',
    email: 'ciudadano3@hotmail.com',
    name: 'Laura Martínez',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-22T09:15:00Z'),
    updatedAt: new Date('2024-11-22T09:15:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca5',
    email: 'ciudadano4@gmail.com',
    name: 'Diego Herrera',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-23T16:45:00Z'),
    updatedAt: new Date('2024-11-23T16:45:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca6',
    email: 'ciudadano5@yahoo.com',
    name: 'Patricia Vega',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-24T11:00:00Z'),
    updatedAt: new Date('2024-11-24T11:00:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca7',
    email: 'ciudadano6@gmail.com',
    name: 'Fernando Castro',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-25T13:30:00Z'),
    updatedAt: new Date('2024-11-25T13:30:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca8',
    email: 'ciudadano7@outlook.com',
    name: 'Mónica Ruiz',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-26T08:20:00Z'),
    updatedAt: new Date('2024-11-26T08:20:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8ca9',
    email: 'ciudadano8@gmail.com',
    name: 'Javier Morales',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-27T15:10:00Z'),
    updatedAt: new Date('2024-11-27T15:10:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8caa',
    email: 'ciudadano9@hotmail.com',
    name: 'Silvia Paredes',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-28T10:45:00Z'),
    updatedAt: new Date('2024-11-28T10:45:00Z'),
  },
  {
    _id: '674c1a1b2c3d4e5f6a7b8cab',
    email: 'ciudadano10@gmail.com',
    name: 'Andrés Jiménez',
    password: defaultPasswordHash,
    role: 'citizen',
    isActive: true,
    createdAt: new Date('2024-11-29T12:00:00Z'),
    updatedAt: new Date('2024-11-29T12:00:00Z'),
  },
];

export const usersStats = {
  total: usersData.length,
  admins: usersData.filter(u => u.role === 'admin').length,
  operators: usersData.filter(u => u.role === 'operator').length,
  citizens: usersData.filter(u => u.role === 'citizen').length,
  active: usersData.filter(u => u.isActive).length,
};
