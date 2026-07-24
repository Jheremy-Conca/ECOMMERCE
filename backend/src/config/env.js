import dotenv from "dotenv";
dotenv.config();

const requiredVars = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "JWT_SECRET",
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Falta la variable de entorno: ${varName}`);
  }
}

export const env = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET,
  // DATABASE_URL: pooled (para queries normales) | DIRECT_URL: conexión directa (para migraciones)
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Origen del frontend Nuxt, para configurar CORS. Ajustar en .env cuando cambie el puerto/dominio.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
