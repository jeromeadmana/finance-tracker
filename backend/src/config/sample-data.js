/**
 * Sample Demo Data for Finance Tracker
 * Pre-populates demo user account with realistic transactions
 */

/**
 * Get a random date within the last N days
 */
function getRandomDate(daysAgo) {
  const today = new Date();
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Sample transactions for demo user
 * Covers last 3 months with realistic data
 */
const sampleTransactions = [
  // ========== INCOME TRANSACTIONS (5 total) ==========

  // Current month salary
  {
    description: 'Monthly Salary - Acme Corporation',
    merchant: 'Acme Corp',
    amount: 5200.00,
    type: 'income',
    category: 'Salary',
    date: getRandomDate(5),
    ai_categorized: false,
    notes: 'Regular monthly paycheck'
  },

  // Last month salary
  {
    description: 'Monthly Salary - Acme Corporation',
    merchant: 'Acme Corp',
    amount: 5200.00,
    type: 'income',
    category: 'Salary',
    date: getRandomDate(35),
    ai_categorized: false,
    notes: 'Regular monthly paycheck'
  },

  // Freelance work
  {
    description: 'Freelance Web Development Project',
    merchant: 'Tech Startup Inc',
    amount: 1500.00,
    type: 'income',
    category: 'Freelance',
    date: getRandomDate(15),
    ai_categorized: true,
    notes: 'Website redesign project'
  },

  // Side gig
  {
    description: 'Consulting Services',
    merchant: 'Small Business LLC',
    amount: 800.00,
    type: 'income',
    category: 'Freelance',
    date: getRandomDate(42),
    ai_categorized: true,
    notes: 'Business consulting'
  },

  // Investment income
  {
    description: 'Dividend Payment',
    merchant: 'Investment Portfolio',
    amount: 125.50,
    type: 'income',
    category: 'Investment',
    date: getRandomDate(28),
    ai_categorized: false,
    notes: 'Quarterly dividend'
  },

  // ========== EXPENSE TRANSACTIONS (35 total) ==========

  // === FOOD & DINING (9 transactions) ===
  {
    description: 'Weekly Groceries',
    merchant: 'Whole Foods Market',
    amount: 127.43,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(2),
    ai_categorized: true
  },
  {
    description: 'Coffee and Breakfast',
    merchant: 'Starbucks',
    amount: 12.50,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(3),
    ai_categorized: true
  },
  {
    description: 'Lunch Meeting',
    merchant: 'Chipotle Mexican Grill',
    amount: 24.75,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(7),
    ai_categorized: true
  },
  {
    description: 'Dinner with Friends',
    merchant: 'Olive Garden',
    amount: 68.90,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(10),
    ai_categorized: true
  },
  {
    description: 'Weekly Groceries',
    merchant: 'Trader Joes',
    amount: 94.32,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(9),
    ai_categorized: true
  },
  {
    description: 'Pizza Night',
    merchant: 'Dominos Pizza',
    amount: 32.00,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(14),
    ai_categorized: true
  },
  {
    description: 'Coffee',
    merchant: 'Starbucks',
    amount: 6.25,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(21),
    ai_categorized: true
  },
  {
    description: 'Grocery Shopping',
    merchant: 'Safeway',
    amount: 112.67,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(30),
    ai_categorized: true
  },
  {
    description: 'Restaurant Dinner',
    merchant: 'Local Bistro',
    amount: 85.40,
    type: 'expense',
    category: 'Food & Dining',
    date: getRandomDate(45),
    ai_categorized: false
  },

  // === TRANSPORTATION (6 transactions) ===
  {
    description: 'Gas Fill-up',
    merchant: 'Shell Gas Station',
    amount: 52.30,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(4),
    ai_categorized: true
  },
  {
    description: 'Ride Share to Airport',
    merchant: 'Uber',
    amount: 45.00,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(12),
    ai_categorized: true
  },
  {
    description: 'Monthly Metro Pass',
    merchant: 'Public Transit Authority',
    amount: 85.00,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(6),
    ai_categorized: false
  },
  {
    description: 'Car Wash and Detailing',
    merchant: 'Quick Clean Car Wash',
    amount: 35.00,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(18),
    ai_categorized: true
  },
  {
    description: 'Gas Fill-up',
    merchant: 'Chevron',
    amount: 48.75,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(25),
    ai_categorized: true
  },
  {
    description: 'Oil Change and Service',
    merchant: 'Jiffy Lube',
    amount: 79.99,
    type: 'expense',
    category: 'Transportation',
    date: getRandomDate(40),
    ai_categorized: false
  },

  // === SHOPPING (6 transactions) ===
  {
    description: 'Online Purchase - Electronics',
    merchant: 'Amazon',
    amount: 149.99,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(8),
    ai_categorized: true
  },
  {
    description: 'Home Supplies',
    merchant: 'Target',
    amount: 67.43,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(11),
    ai_categorized: true
  },
  {
    description: 'Clothing Purchase',
    merchant: 'H&M',
    amount: 89.50,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(20),
    ai_categorized: true
  },
  {
    description: 'Household Items',
    merchant: 'Walmart',
    amount: 54.32,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(27),
    ai_categorized: true
  },
  {
    description: 'Books and Supplies',
    merchant: 'Barnes & Noble',
    amount: 42.15,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(33),
    ai_categorized: false
  },
  {
    description: 'Online Shopping',
    merchant: 'Amazon',
    amount: 78.90,
    type: 'expense',
    category: 'Shopping',
    date: getRandomDate(50),
    ai_categorized: true
  },

  // === ENTERTAINMENT (4 transactions) ===
  {
    description: 'Netflix Subscription',
    merchant: 'Netflix',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment',
    date: getRandomDate(5),
    ai_categorized: true
  },
  {
    description: 'Spotify Premium',
    merchant: 'Spotify',
    amount: 10.99,
    type: 'expense',
    category: 'Entertainment',
    date: getRandomDate(8),
    ai_categorized: true
  },
  {
    description: 'Movie Tickets',
    merchant: 'AMC Theaters',
    amount: 34.00,
    type: 'expense',
    category: 'Entertainment',
    date: getRandomDate(22),
    ai_categorized: true
  },
  {
    description: 'Concert Tickets',
    merchant: 'Ticketmaster',
    amount: 125.00,
    type: 'expense',
    category: 'Entertainment',
    date: getRandomDate(48),
    ai_categorized: false
  },

  // === UTILITIES (3 transactions) ===
  {
    description: 'Electric Bill - January',
    merchant: 'City Power & Electric',
    amount: 142.67,
    type: 'expense',
    category: 'Utilities',
    date: getRandomDate(10),
    ai_categorized: false
  },
  {
    description: 'Internet Service',
    merchant: 'Comcast Xfinity',
    amount: 79.99,
    type: 'expense',
    category: 'Utilities',
    date: getRandomDate(15),
    ai_categorized: false
  },
  {
    description: 'Mobile Phone Bill',
    merchant: 'Verizon Wireless',
    amount: 85.00,
    type: 'expense',
    category: 'Utilities',
    date: getRandomDate(12),
    ai_categorized: false
  },

  // === HOUSING (2 transactions) ===
  {
    description: 'Monthly Rent Payment',
    merchant: 'Apartment Management',
    amount: 1850.00,
    type: 'expense',
    category: 'Housing',
    date: getRandomDate(1),
    ai_categorized: false
  },
  {
    description: 'Monthly Rent Payment',
    merchant: 'Apartment Management',
    amount: 1850.00,
    type: 'expense',
    category: 'Housing',
    date: getRandomDate(31),
    ai_categorized: false
  },

  // === HEALTHCARE (3 transactions) ===
  {
    description: 'Prescription Medication',
    merchant: 'CVS Pharmacy',
    amount: 28.50,
    type: 'expense',
    category: 'Healthcare',
    date: getRandomDate(16),
    ai_categorized: true
  },
  {
    description: 'Gym Membership',
    merchant: 'Planet Fitness',
    amount: 24.99,
    type: 'expense',
    category: 'Healthcare',
    date: getRandomDate(7),
    ai_categorized: false
  },
  {
    description: 'Doctor Visit Copay',
    merchant: 'City Medical Center',
    amount: 45.00,
    type: 'expense',
    category: 'Healthcare',
    date: getRandomDate(38),
    ai_categorized: false
  },

  // === OTHER (2 transactions) ===
  {
    description: 'Car Insurance Premium',
    merchant: 'State Farm Insurance',
    amount: 156.00,
    type: 'expense',
    category: 'Other',
    date: getRandomDate(13),
    ai_categorized: false
  },
  {
    description: 'Birthday Gift',
    merchant: 'Amazon',
    amount: 65.00,
    type: 'expense',
    category: 'Other',
    date: getRandomDate(35),
    ai_categorized: true
  }
];

// Total: 5 income + 35 expenses = 40 transactions
// Leaves 10 slots for user testing (50 transaction limit)

module.exports = {
  sampleTransactions
};
