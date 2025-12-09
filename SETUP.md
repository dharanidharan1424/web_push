# Web Push Notification SaaS - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database for the project.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/webpush?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# VAPID Keys (Generate using the command below)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Generate VAPID Keys

VAPID keys are required for web push notifications. Generate them using:

```bash
npx web-push generate-vapid-keys
```

Copy the output and paste the keys into your `.env.local` file.

### 5. Run Database Migrations

```bash
npx prisma generate
npx prisma db push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### 1. Create an Account

- Navigate to `http://localhost:3000/signup`
- Create a new account with your email and password

### 2. Add a Website

- Go to Dashboard → Websites
- Click "Add Website"
- Enter your website name and URL
- Copy the generated script tag

### 3. Install Script on Your Website

Paste the script tag in the `<head>` section of your website:

```html
<script src="http://localhost:3000/push-client.js" data-website-id="YOUR_WEBSITE_ID" data-api-url="http://localhost:3000"></script>
```

**Important:** Web Push API requires HTTPS in production. For local testing:
- Use `localhost` (allowed without HTTPS)
- Or use a tunneling service like ngrok for HTTPS
- Or deploy to a platform like Vercel

### 4. Test Notification Subscription

- Open your website in a browser
- After 2 seconds, you should see a permission prompt
- Click "Allow" to subscribe to notifications
- Check your dashboard to see the new subscriber

### 5. Send a Notification

- Go to Dashboard → Send Notification
- Select your website
- Fill in the title, message, and optional URL
- Click "Send Notification"
- The notification should appear on all subscribed browsers

## Features

- **User Authentication**: Secure login and registration
- **Multi-Website Support**: Manage multiple websites from one account
- **Subscriber Management**: View all subscribers for each website
- **Notification Composer**: Create rich notifications with title, message, URL, and icon
- **Segmentation**: Create segments and send targeted notifications
- **Analytics**: Track subscriber count and notification delivery

## Deployment

### Environment Variables for Production

Update your `.env.local` or production environment with:

1. **DATABASE_URL**: Your production PostgreSQL connection string
2. **NEXTAUTH_SECRET**: Generate a secure random string
3. **NEXTAUTH_URL**: Your production domain (e.g., `https://yourdomain.com`)
4. **NEXT_PUBLIC_APP_URL**: Your production domain
5. **VAPID keys**: Keep the same keys or generate new ones

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Notes

- Ensure your production site uses HTTPS (required for Web Push API)
- Update the `data-api-url` in your script tags to your production URL
- Test notifications thoroughly before going live

## Troubleshooting

### Notifications not appearing

1. Check browser console for errors
2. Verify VAPID keys are correctly set
3. Ensure the website is on HTTPS (or localhost)
4. Check if notifications are blocked in browser settings

### Script not loading

1. Verify the script URL is correct
2. Check Next.js is serving static files from `/public`
3. Ensure CORS is not blocking the request

### Database connection issues

1. Verify DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Check database credentials and permissions

## Browser Support

- Chrome/Edge (Chromium): Full support
- Firefox: Full support
- Safari: macOS 16.4+, iOS 16.4+
- Opera: Full support

## License

MIT
