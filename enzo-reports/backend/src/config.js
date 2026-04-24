import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || 'enzo_dev_secret_2024',

  databases: {
    cement: {
      url: process.env.SAP_CEMENT_URL || 'https://localhost:50000/b1s/v1',
      company: process.env.SAP_CEMENT_COMPANY || 'ENZO_CEMENT',
      user: process.env.SAP_CEMENT_USER || 'manager',
      pass: process.env.SAP_CEMENT_PASS || '',
    },
    shifer: {
      url: process.env.SAP_SHIFER_URL || 'https://localhost:50000/b1s/v1',
      company: process.env.SAP_SHIFER_COMPANY || 'ENZO_SHIFER',
      user: process.env.SAP_SHIFER_USER || 'manager',
      pass: process.env.SAP_SHIFER_PASS || '',
    },
    jbi: {
      url: process.env.SAP_JBI_URL || 'https://localhost:50000/b1s/v1',
      company: process.env.SAP_JBI_COMPANY || 'ENZO_JBI',
      user: process.env.SAP_JBI_USER || 'manager',
      pass: process.env.SAP_JBI_PASS || '',
    },
  },

  // Local users for dev/demo — replace with DB in production
  users: [
    { id: 1, username: 'admin', password: 'admin123', name: 'Администратор', role: 'admin' },
    { id: 2, username: 'manager', password: 'manager123', name: 'Менеджер', role: 'manager' },
  ],
};
