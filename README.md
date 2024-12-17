# Auth Next.js

A modern authentication system built with Next.js 14, featuring server actions, secure authentication, and a beautiful UI.

## Features

- 🔐 Secure Authentication (Login/Register)
- 👤 User Profile Management
- 🔑 Password Change Functionality
- 📸 Profile Picture Upload
- 🛡️ Protected Routes
- 🎨 Modern UI with Tailwind CSS
- ✨ Server Actions for Form Handling
- 🔍 Type Safety with TypeScript & Zod
- 🗄️ SQLite Database with Prisma

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Custom with HTTP-only Cookies
- **Image Processing**: Sharp

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd auth-next
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes (login/register)
│   └── profile/           # Profile management routes
├── lib/                   # Shared utilities
│   ├── actions/           # Server actions
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
└── components/            # React components
```

## Features in Detail

### Authentication

- Secure password hashing with bcrypt
- HTTP-only cookie session management
- Protected routes with middleware
- Form validation with Zod

### Profile Management

- Update profile information
- Change password
- Upload and manage profile picture
- Image optimization with Sharp

### Security Features

- Password hashing
- HTTP-only cookies
- Input validation
- File upload restrictions
- Protected API routes
- Type safety with TypeScript and Zod

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
