# MDRRMC Risk Management System

A comprehensive web-based Municipal Disaster Risk Reduction and Management Council (MDRRMC) Risk Management System for Socorro Municipality. This system tracks disaster-related data across barangays, manages evacuees, relief distribution, and generates reports for municipal oversight.

## Features

### Core Functionality

1. **Disaster Event Management**
   - Create and manage disaster events (typhoons, storms, floods, earthquakes, fires, etc.)
   - Track event details, severity, dates, affected areas, and status
   - Alert levels (Signal 1-5 for typhoons, or custom severity levels)

2. **Evacuee Management**
   - Register evacuees with detailed information
   - Track evacuee status (evacuated, returned home, relocated, missing)
   - Family grouping and household tracking
   - Special needs tracking (elderly, PWD, pregnant, children, medical conditions)
   - Evacuation center management

3. **Relief Goods Distribution**
   - Inventory management for relief goods
   - Distribution records per barangay
   - Stock levels and alerts
   - Approval workflow for distribution requests

4. **Barangay Staff Portal**
   - Dashboard with key metrics
   - Quick entry forms for evacuees and relief distribution
   - Submit daily situation reports (SITREP)
   - View/edit barangay-specific data only

5. **Municipal Administrator Portal**
   - Overview dashboard across all barangays
   - Real-time monitoring of active disasters, evacuees, and relief distribution
   - Approve relief distribution requests
   - Generate consolidated reports
   - Manage system settings and user accounts

6. **Reporting and Analytics**
   - Daily SITREP per barangay
   - Consolidated municipal reports
   - Evacuee statistics by barangay and evacuation center
   - Relief distribution reports
   - Exportable reports (PDF, Excel)

## Technology Stack

- **Framework**: Next.js 14+ with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control
- **UI**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and server components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd risk-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A random secret string for NextAuth
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)

**For Vercel Deployment:**
Make sure to add these environment variables in your Vercel project settings:
- `DATABASE_URL`: Your production PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., https://your-app.vercel.app)

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Option A: Use migrations (recommended for production)
npx prisma migrate dev

# Option B: Push schema directly (for development only)
npx prisma db push
```

5. Seed initial data:
```bash
npx prisma db seed
# or
npm run db:seed
```

**For Vercel Deployment:**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions. After deploying, call:
```
POST https://your-app.vercel.app/api/setup?token=YOUR_SETUP_SECRET
```
This will run migrations and seed the database automatically.

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

- **Barangay Staff**: Can view/edit data for assigned barangay only
- **Municipal Admin**: Full system access, can approve requests and manage users
- **MDRRMC Officer**: Can create/manage disaster events and approve relief requests
- **Mayor/Department Head**: View-only access to all data

## Project Structure

```
risk-management-system/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin portal pages
│   ├── barangay/          # Barangay staff portal pages
│   ├── api/               # API routes
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/               # Prisma schema
│   └── schema.prisma     # Database schema
└── types/                # TypeScript type definitions
```

## Database Schema

The system uses the following main entities:
- `User`: System users with role-based access
- `Barangay`: Barangay information
- `DisasterEvent`: Disaster events and their details
- `Evacuee`: Evacuee information and status
- `Family`: Family grouping for evacuees
- `EvacuationCenter`: Evacuation center details
- `ReliefGood`: Relief goods inventory
- `ReliefDistribution`: Distribution records
- `SITREP`: Situation reports

## API Routes

- `/api/auth/*`: Authentication endpoints
- `/api/disasters`: Disaster event management
- `/api/evacuees`: Evacuee management
- `/api/relief-distribution`: Relief distribution management
- `/api/sitrep`: SITREP management
- `/api/barangays`: Barangay information
- `/api/users`: User management (admin only)

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Security Considerations

- Passwords are hashed using bcryptjs
- Role-based access control enforced at API and UI levels
- Session management via NextAuth.js
- Input validation on all forms
- SQL injection protection via Prisma ORM

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Specify your license here]

## Support

For issues and questions, please contact the development team.
