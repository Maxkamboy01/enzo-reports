import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';

const fastify = Fastify({ logger: true });

// CORS
await fastify.register(cors, {
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});

// JWT
await fastify.register(jwt, { secret: config.jwtSecret });

// Auth decorator
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.code(401).send({ message: 'Avtorizatsiya talab qilinadi' });
  }
});

// Routes
await fastify.register(authRoutes);
await fastify.register(reportRoutes);

// Health check
fastify.get('/api/health', () => ({ status: 'ok', time: new Date().toISOString() }));

// Start
try {
  await fastify.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`\n🏭 ENZO Reports API running on http://localhost:${config.port}\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
