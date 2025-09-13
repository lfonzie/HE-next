# HE Next

A modern, full-stack Next.js application built with TypeScript, Tailwind CSS, and cutting-edge web technologies.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Responsive Design** that works on all devices
- **API Routes** for backend functionality
- **Modern UI Components** with Lucide React icons
- **Performance Optimized** with Next.js features

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HE-next
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp env.example .env.local
```

4. Update the environment variables in `.env.local` with your values.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
HE-next/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── hello/         # Hello API endpoint
│   │   └── users/         # Users API endpoint
│   ├── about/             # About page
│   ├── api-demo/          # API demo page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── CTA.tsx           # Call-to-action component
│   ├── Features.tsx      # Features section
│   ├── Hero.tsx          # Hero section
│   ├── Navigation.tsx    # Navigation component
│   └── Stats.tsx         # Statistics section
├── lib/                   # Utility functions
│   └── utils.ts          # Common utilities
├── types/                 # TypeScript type definitions
│   └── index.ts          # Type definitions
├── next.config.js        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📡 API Endpoints

### Hello API
- `GET /api/hello?name=Developer` - Returns a greeting message
- `POST /api/hello` - Accepts JSON data and returns confirmation

### Users API
- `GET /api/users?role=admin` - Returns list of users (with optional role filter)
- `POST /api/users` - Creates a new user

## 🎨 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`. The primary color is currently set to blue, but you can change it to any color you prefer.

### Components
All components are located in the `components/` directory and can be easily modified or extended.

### Styling
Global styles are in `app/globals.css`, and component-specific styles use Tailwind CSS classes.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (if using a database)
DATABASE_URL="postgresql://username:password@localhost:5432/he_next_db"

# Authentication (if using NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# External APIs
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue
4. Contact the maintainers

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
