
# WooCommerce Order Manager

A comprehensive order management system that integrates WooCommerce with Pushflow SMS to streamline e-commerce operations and customer communications.

## Features

### 🛍️ WooCommerce Integration
- Connect to any WooCommerce store via REST API
- Fetch and display orders with filtering and search
- Update order statuses dynamically
- Secure credential storage with connection testing

### 📱 SMS Notifications
- Pushflow SMS integration for customer notifications
- Automatic SMS sending on order status changes
- Simulation mode for testing without sending real messages
- Custom message templates with placeholders

### 📋 Order Management
- Clean, intuitive order dashboard
- Filter orders by status and search by customer/order number
- Bulk status updates with instant feedback
- Real-time order summary and statistics

### ✉️ Message Templates
- Create custom templates for each order status
- Dynamic placeholders: `{customer_name}`, `{order_id}`, `{order_total}`, `{store_name}`
- Template preview with sample data
- CRUD operations for template management

### ⚙️ Configuration Management
- Persistent settings stored in localStorage
- Secure credential handling with masked inputs
- Connection testing for both WooCommerce and Pushflow
- Easy setup wizard with validation

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Hooks, localStorage
- **Icons**: Lucide React
- **Notifications**: React Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- WooCommerce store with REST API enabled
- Pushflow SMS account (optional for simulation mode)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd woocommerce-order-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Configuration

#### WooCommerce Setup

1. In your WooCommerce admin, go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add Key** to create new API credentials
3. Set permissions to **Read/Write**
4. Copy the Consumer Key and Consumer Secret
5. In the app, go to the **WooCommerce** tab and enter:
   - Store URL (e.g., `https://yourstore.com`)
   - Consumer Key
   - Consumer Secret
6. Click **Test Connection** to verify

#### Pushflow Setup

1. Log into your Pushflow dashboard
2. Navigate to API settings
3. Copy your Instance ID and Access Token
4. In the app, go to the **Pushflow** tab and enter:
   - Instance ID
   - Access Token
   - Enable **Simulation Mode** for testing
5. Click **Test Connection** to verify

### Usage

#### Managing Orders

1. Navigate to the **Orders** tab
2. View all orders with status indicators
3. Use search and filters to find specific orders
4. Change order statuses using the dropdown
5. SMS notifications are sent automatically when templates exist

#### Creating Message Templates

1. Go to the **Templates** tab
2. Click **Create New Template**
3. Select an order status
4. Write your message using placeholders:
   - `{customer_name}` - Customer's full name
   - `{order_id}` - Order number
   - `{order_total}` - Order total amount
   - `{store_name}` - Your store name
5. Preview and save the template

#### Example Template
```
Hi {customer_name}, your order {order_id} for {order_total} is now being processed! We'll notify you once it ships. Thanks for shopping with {store_name}!
```

## API Integration

### WooCommerce REST API

The app uses the WooCommerce REST API v3 with the following endpoints:

- `GET /wp-json/wc/v3/orders` - Fetch orders
- `PUT /wp-json/wc/v3/orders/{id}` - Update order status

### Pushflow SMS API

SMS messages are sent via the Pushflow API:

- `POST /v1/instances/{instanceId}/messages` - Send SMS

## Development

### Project Structure

```
src/
├── components/           # React components
│   ├── WooCommerceConfig.tsx
│   ├── PushflowConfig.tsx
│   ├── OrderDashboard.tsx
│   └── MessageTemplates.tsx
├── hooks/               # Custom React hooks
│   ├── useWooCommerce.ts
│   ├── usePushflow.ts
│   └── useMessageTemplates.ts
├── pages/               # Page components
│   └── Index.tsx
└── lib/                # Utilities
    └── utils.ts
```

### Building for Production

```bash
npm run build
```

### Deployment

The app is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on each push

## Security Considerations

- API credentials are stored in browser localStorage
- Sensitive data is masked in the UI
- Connection testing validates credentials before storage
- Simulation mode prevents accidental SMS sending during development

## Backend API

This repository includes serverless API routes implemented with Next.js. These endpoints integrate with WooCommerce and Pushflow and are located under `pages/api/`.

### Setup

1. Copy `.env.example` to `.env.local` and fill in your credentials:
   - `WOO_BASE_URL`
   - `WOO_CONSUMER_KEY`
   - `WOO_CONSUMER_SECRET`
   - `PUSHFLOW_INSTANCE_ID`
   - `PUSHFLOW_ACCESS_TOKEN`
2. Run `npm install` to install dependencies.
3. Start the API locally with `npm run dev` or deploy to Vercel.

### Endpoints

- `GET /api/orders` – Fetch orders from WooCommerce.
- `POST /api/orders/[orderId]/status` – Update an order status.
- `POST /api/message` – Send an SMS via Pushflow.
- `GET/POST /api/templates` – Manage message templates.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the WooCommerce REST API documentation
- Review Pushflow API documentation
