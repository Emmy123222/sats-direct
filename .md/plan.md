
# SatsGate — Bitcoin Payment Gateway MVP

A non-custodial Bitcoin checkout system for merchants who want to accept BTC payments directly to their own wallets. Modern minimal design with dark mode and Bitcoin orange accents.

---

## Phase 1: Landing Page & Validation

**Public Landing Page**
- Hero section with clear value proposition: "Accept Bitcoin payments. Keep your keys."
- Key benefits: No KYC, no fees to middlemen, instant settlement, no chargebacks
- Email capture form for early access waitlist (stored in localStorage for MVP)
- "Connect Wallet" CTA that leads to the merchant dashboard
- Dark theme with Bitcoin orange (#F7931A) accents

---

## Phase 2: Wallet Connection

**Stacks Wallet Integration**
- Connect/disconnect button supporting Hiro and Leather wallets
- Display connected BTC and STX addresses
- Wallet connection state persisted in browser storage
- Clean connection status indicator in the dashboard header

---

## Phase 3: Invoice Creation Flow

**Create Payment Invoice**
- Simple form: amount (BTC or sats), optional memo/description
- Generate unique invoice ID
- Display BTC payment address with QR code
- Shareable invoice URL for customers
- Copy-to-clipboard functionality for address and link

**Invoice Page (Public)**
- Clean payment page showing amount, memo, and QR code
- Real-time payment status indicator
- Instructions for paying via any Bitcoin wallet

---

## Phase 4: Payment Detection

**Mempool.space Integration**
- Monitor merchant's BTC address for incoming transactions
- Poll for transaction confirmations
- Update invoice status: Pending → Confirming → Paid
- Show number of confirmations (0-6)
- Mark invoice as complete when confirmed

---

## Phase 5: Merchant Dashboard

**Simple Overview**
- Total BTC received (all-time)
- Recent payments list (last 10)
- Invoice list with status filters
- Quick actions: Create new invoice, view invoice details
- All data stored in browser localStorage

---

## Phase 6: On-Chain Invoice Registry (Clarity)

**Basic Smart Contract**
- Register invoice metadata on Stacks blockchain
- Store: invoice ID, amount, merchant address, timestamp
- Query invoice by ID for verification
- Provides transparency and proof of invoice creation

---

## Technical Approach

- **Frontend**: React with Tailwind CSS, dark theme
- **Wallet**: @stacks/connect for Hiro/Leather integration
- **Storage**: Browser localStorage (no backend needed)
- **Bitcoin Data**: Mempool.space public API
- **Smart Contract**: Clarity for invoice registry
- **QR Codes**: Client-side generation

---

## Design Direction

- **Dark mode** as default (Bitcoin-native aesthetic)
- **Orange (#F7931A)** for CTAs and highlights
- **Minimal chrome** — focus on function over decoration
- **Mobile-responsive** — merchants check payments on the go
- **Clear status indicators** — payment states at a glance

