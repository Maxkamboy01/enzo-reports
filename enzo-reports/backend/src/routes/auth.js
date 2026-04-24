import { config } from '../config.js';

export default async function authRoutes(fastify) {
  fastify.post('/api/auth/login', async (req, reply) => {
    const { username, password } = req.body || {};
    const user = config.users.find(u => u.username === username && u.password === password);
    if (!user) return reply.code(401).send({ message: 'Логин ёки парол хато' });

    const token = fastify.jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      { expiresIn: '12h' }
    );

    return { id: user.id, username: user.username, name: user.name, role: user.role, token };
  });

  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, async (req) => {
    return req.user;
  });
}
