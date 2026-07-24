import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env.js';

// El schema.prisma no define `url` en el datasource (patrón de driver adapters de Prisma 7),
// así que PrismaClient necesita el adaptador explícito. Mismo patrón que seed.js.
const pool = new pg.Pool({
  connectionString: env.directUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;