# DST Seller Admin Portal

A modern Next.js admin portal for managing sellers, products, bids, and orders in a steel trading platform.

## Features ##new changfe 5.40pm

- **Dashboard Overview**: Statistics cards showing pending approvals, bids, and orders
- **Seller Management**: View and manage seller registrations and approvals
- **Product Approval Queue**: Review and approve product listings
- **Dealer Portal**: Comprehensive seller management with filtering capabilities
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Interactive Navigation**: Sidebar navigation with active state management

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hooks** - State management

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dst-seller-admin-portal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
dst-seller-admin-portal/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main dashboard page
├── components/            # Reusable components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── StatCard.tsx      # Statistics card component
│   ├── RecentActivity.tsx # Recent seller activity table
│   ├── ProductApprovalQueue.tsx # Product approval table
│   ├── DealerPortalTable.tsx # Dealer portal table
│   ├── SellerUsersTable.tsx # Seller users management
│   ├── ProductsTable.tsx # Products management
│   ├── MasterRatesTable.tsx # Master rates management
│   ├── BidsTable.tsx     # Bids management
│   ├── OrdersTable.tsx   # Orders management
│   └── TrucksTable.tsx   # Trucks management
├── public/               # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard
- Statistics overview with pending approvals
- Recent seller activity table
- Product approval queue
- Responsive grid layout

### Dealer Portal
- Advanced filtering options
- Seller status management
- Registration date tracking
- Action buttons for approval/rejection
- Chat functionality with sellers

### Seller Users Page
- User management interface with search functionality
- Multiple filter options (Status, Role, Last Active)
- Active/Inactive toggle switches for users
- Role and permissions management
- Add new user functionality

### Products Page
- Comprehensive product management system
- Advanced filtering (Seller, Status, Master Categories, Last Active)
- Product pricing display with difference rates
- Bulk selection with checkboxes
- Approve/Reject actions for product status
- Last modified tracking

### Master Rates Page
- Rate management for different categories
- Pricing configuration (per unit and per ton)
- Auto reject margin settings
- Sale status toggle switches
- Seller and category filtering
- Edit functionality for rate adjustments

### Bids Page
- Comprehensive bid management system
- Bid tracking with unique IDs
- Seller and dealer information
- Master category classification
- Date and time tracking with sorting
- Bid amount and quantity display
- Comments section for additional details
- Approve/Reject actions for bid processing

### Orders Page
- Comprehensive order tracking system
- Order ID management with blue clickable links
- Master category classification
- Date and time tracking for order placement
- Status monitoring with color-coded badges
- Dealer and seller information display
- Multiple truck ID tracking for logistics
- Bulk selection with checkboxes
- Delete functionality with trash icons
- Advanced filtering (Status, Order Date)

### Trucks Page
- Complete truck fleet management
- Truck number identification (TN format)
- Driver information (name and contact number)
- Order assignment tracking
- Truck status management with dropdown
- Seller and dealer assignment
- Update functionality for status changes
- Search and filtering capabilities
- Real-time status tracking

## Customization

The application uses Tailwind CSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Global styles in `app/globals.css`
- Component-specific styles in individual component files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary. 