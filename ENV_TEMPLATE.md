# Environment Variables Template
# Copy this file to .env.local and fill in your values

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/webpush?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# VAPID Keys (Generate using: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# App URL (for script generation)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
