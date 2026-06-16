# VogueSocial - The Future of Fashion Discovery

VogueSocial is a Next.js-based social marketplace featuring advanced **AI-powered Virtual Try-On** technology. It bridges the gap between consumers, fashion designers, and merchants, allowing users to discover apparel, try on looks virtually via cloud-based GPU execution, and purchase items safely through an escrow-backed payment structure.

---

## 🚀 Key Modules & Architecture

The platform is designed around three main user roles, supported by key server APIs and a Supabase database backend:

```
                  ┌───────────────────────────────┐
                  │          Super Admin          │
                  │   Disputes, Escrow, Webhooks  │
                  └───────────────┬───────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                                                       ▼
┌───────────────────────────┐                           ┌───────────────────────────┐
│     Merchants / Vendors   │ ◄─── Sync Product Catalog ──► │         Customers         │
│  Onboarding, Dashboards   │                           │ Virtual Try-on, Profiles  │
└───────────────────────────┘                           └───────────────────────────┘
```

---

## 👥 User Roles & Features

### 1. Customers (End-Users)
*   **Virtual Try-On Output & Interface**: Select any compatible apparel item and see high-fidelity virtual overlays showing how it looks.
*   **Social Feed Page**: An editorial fashion feed where customers can browse looks uploaded by creators and purchase matching outfits. 
*   **Brand Profiles**: Consumers can click any creator or designer avatar to open their public **Brand Hub** (`/brand/[handle]`), featuring banner art, bio details, location data, follower counts, and their catalog sorted by clothing type (Tops & Jackets, Bottoms & Trousers, Dresses & Jumpsuits, Lifestyle & Others).
*   **Social Media Sharing (Facebook & Instagram)**:
    *   *Manual Share Loop (UGC)*: Instead of background auto-posting (which violates privacy and Meta developer policies), customers can generate a **Share Style Card** directly from the Try-On output panel.
    *   *Web Share API*: Launches the native mobile/browser share menu to post structured image cards directly to Instagram/Facebook Stories or WhatsApp in one tap.

### 2. Merchants / Vendors
*   **Complete Onboarding Flow**: Multi-step registration process allowing vendors to configure store details (name, categories, website URLs, locations, social handles) and upload business registration documents.
*   **Merchant Dashboard**: View sales statistics, manage inventory, monitor payouts, and audit API usage.
*   **Meta Catalog Integration (Facebook/Instagram Sync)**:
    *   *Export (VogueSocial ➔ Facebook)*: Push local products directly to the vendor's Facebook Shop catalog using Meta's Batch Graph API (`POST /v18.0/catalog_{id}/batch_items`).
    *   *Import (Facebook ➔ VogueSocial)*: Pull catalog feeds directly from Facebook to onboard vendors quickly, checking for duplicates.
    *   *Smart "Clothing-Only" Filter*: Automatically filters out incompatible items (shoes, accessories, etc.), ensuring only apparel suited for Virtual Try-On is processed.

### 3. Super Admins
*   **Vendor Approval**: Review pending merchant registrations and approve/reject their status.
*   **Escrow & Dispute Resolution Board**: Full control over active and settled transaction disputes (Claimant names, reason categories like "Damaged Item" or "Wrong Size", and dispute statuses: `open`, `under_review`, `resolved_refunded`, `resolved_released`).
*   **Developer API Webhook Console**: Simulate incoming Shippo carrier updates. Delivering packages automatically releases corresponding escrow funds after a **48-Hour Auto-Release** settlement window.

---

## ⚡ Core API Integrations

### 1. RunPod AI API (`/api/try-on`)
*   Manages serverless GPU execution to process image-to-image Virtual Try-On models.
*   Handles token authentication and queries the status of rendering jobs synchronously or asynchronously.

### 2. Stripe Payments & Escrow Payouts (`/api/orders`)
*   Creates payment intents and holds customer funds in platform escrow.
*   Safely releases payments to vendor balances upon delivery confirmation or resolves/refunds disputes directly to customer credit cards through admin arbitration.

### 3. Shippo Delivery Webhook Console (`/api/webhooks/shipping`)
*   Listens to incoming carrier tracking events.
*   Injects a `tracker.updated` event to unlock and release held vendor payments upon package arrival.

---

## ⛃ Database Schema (Supabase)

The database schema spans six major tables:

1.  **`public.profiles`**: Contains account data for customers, vendors, and admins. Stores store handles, category settings, location metrics, and onboarding approval states.
2.  **`public.products`**: Contains names, descriptions, sizing parameters, prices, and image URLs.
3.  **`public.orders`**: Stores transactions, status codes (`pending`, `shipped`, `delivered`, `cancelled`), and escrow parameters (`held`, `released`, `refunded`, `disputed`).
4.  **`public.order_items`**: Maps orders to specific product quantities and unit prices.
5.  **`public.payouts`**: Audits completed vendor balance transfers and stores Stripe transfer IDs.
6.  **`public.disputes`**: Records reasons, claims text, and arbitration notes for contested orders.

---

## ⚙️ Installation & Local Development

### 1. Prerequisites
*   Node.js (v18+)
*   Supabase Account & Project

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Stripe & RunPod (Optional for mock mode)
STRIPE_SECRET_KEY=your_stripe_secret_key
RUNPOD_API_KEY=your_runpod_api_key
RUNPOD_ENDPOINT_ID=your_runpod_endpoint_id
```

### 3. Spin Up Dev Server
To run the project locally under Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build Production Bundle
To compile the site prior to Vercel/production deployment:
```bash
npm run build
```
