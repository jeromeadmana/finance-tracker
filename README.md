# AI-Powered Personal Finance Tracker

A modern, full-stack personal finance tracking application with AI-powered features including natural language transaction entry, smart categorization, financial advice chatbot, and super admin configuration panel.

## Features

### Core Features
- 💰 **Transaction Management** - Track income and expenses with detailed categorization
- 📊 **Dashboard & Analytics** - Visual insights into spending patterns and trends
- 💳 **Budget Management** - Set and track budgets across categories
- 🎯 **Financial Goals** - Set and monitor financial goals
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### AI-Powered Features
- 🤖 **Natural Language Transaction Entry** - "Spent $45 on groceries at Whole Foods yesterday"
- 🏷️ **Smart Auto-Categorization** - AI automatically categorizes transactions
- 💬 **Financial Advice Chatbot** - Get personalized financial advice based on your data
- 📈 **Spending Analysis** - AI-powered insights and recommendations
- 💡 **Budget Recommendations** - AI suggests optimal budget allocations

### Super Admin Panel
- ⚙️ **Global AI Configuration** - Set AI behavior and instructions for all users
- 📝 **Custom Financial Rules** - Define organization-wide financial policies
- 🏷️ **Category Management** - Create and manage custom categories
- 🤖 **Auto-Categorization Rules** - Define patterns for automatic categorization
- 📋 **Budget Templates** - Create reusable budget templates
- 👥 **User Management** - Manage user roles and permissions

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database (Aiven hosted)
- **JWT** - Authentication
- **OpenAI API** - AI features
- **Bcrypt** - Password hashing

## Project Structure

```
finance-tracker/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Aiven or local)
- OpenAI API key

### Environment Setup

#### Backend (.env)
Create `/backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Database (Aiven PostgreSQL)
DATABASE_URL=your-postgresql-connection-string
DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o

# CORS
FRONTEND_URL=http://localhost:5173

# Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your-admin-password
```

#### Frontend (.env)
Create `/frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

1. Create a PostgreSQL database on Aiven (or use local PostgreSQL)

2. Run the schema file to create tables:
```bash
psql <your-connection-string> < backend/src/config/schema.sql
```

Or manually execute the SQL in `backend/src/config/schema.sql`

### Installation

#### Backend
```bash
cd backend
npm install
npm run dev
```

Server will start on http://localhost:5000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/natural-language` - Create from natural language
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### AI Features
- `POST /api/ai/chat` - Financial advice chatbot
- `POST /api/ai/budget-recommendations` - Get budget recommendations
- `GET /api/ai/spending-analysis` - Analyze spending patterns

### Super Admin (Requires super_admin role)
- `GET /api/admin/ai-instructions` - Get AI instructions
- `POST /api/admin/ai-instructions` - Create AI instruction
- `PUT /api/admin/ai-instructions/:id` - Update AI instruction
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin setting
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role

## Usage Examples

### Natural Language Transaction Entry
```javascript
// Instead of filling out a form, just type:
"Spent $45 on groceries at Whole Foods yesterday"

// The AI will parse it to:
{
  amount: 45,
  description: "Groceries",
  merchant: "Whole Foods",
  date: "2024-01-15",
  type: "expense",
  category: "Food & Dining" // Auto-categorized
}
```

### AI Financial Advice
```javascript
// Ask the AI chatbot:
"How much should I save for an emergency fund?"

// Get personalized advice based on your actual spending data
```

### Super Admin Configuration
```javascript
// Set global AI instructions:
"Always encourage saving 20% of income"
"Be conservative with investment advice"
"Recommend emergency fund = 6 months expenses"

// All users will receive AI advice following these guidelines
```

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (user, admin, super_admin)
- SQL injection prevention
- CORS protection
- Helmet.js security headers

## Database Schema

Key tables:
- `users` - User accounts and authentication
- `transactions` - Financial transactions
- `categories` - Transaction categories
- `budgets` - User budgets
- `financial_goals` - User financial goals
- `ai_instructions` - Super admin AI configuration
- `admin_settings` - System-wide settings
- `category_rules` - Auto-categorization rules
- `ai_chat_history` - Chat history with AI

## Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure PostgreSQL database is accessible
3. Run `npm start` to start the production server

### Frontend Deployment
1. Update `VITE_API_URL` to production API URL
2. Build: `npm run build`
3. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

## Future Enhancements
- Receipt image upload and OCR
- Multi-currency support
- Recurring transaction automation
- Bank account integration (Plaid)
- Mobile app (React Native)
- Email notifications
- Export to CSV/PDF
- Data visualization improvements

## Contributing
This is a portfolio project. Feel free to fork and customize for your needs.

## License
MIT License

## Contact
Created for portfolio purposes
