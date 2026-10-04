import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb+srv://AI-Political-Poster-Maker:Uo7QaseGnbl0wbR4@sadasaad.pszei0q.mongodb.net/rise_together_poster_maker?retryWrites=true&w=majority&appName=SadaSaad';

// Global cached client for Next.js hot-reloading
declare global {
  var _mongoClientPromise: MongoClient | undefined;
}

let client: MongoClient;
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(mongoUri);
  }
  client = global._mongoClientPromise;
} else {
  client = new MongoClient(mongoUri);
}

const db = client.db('rise_together_poster_maker');

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || 'rise_together_political_poster_maker_super_secure_jwt_secret_2026_bd',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ai-political-poster-maker-frontend-xi.vercel.app',
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      prompt: 'select_account',
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },
});
