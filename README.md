# FastCheckout

> Pay with transfer — without leaving the checkout screen.

**[Live Demo →](https://fastproto.netlify.app/)**

---

## The Problem

Bank transfer is the dominant payment method in Nigeria. When a user chooses "Pay with Transfer" at checkout, the experience breaks down immediately:

1. A virtual account number appears on screen
2. The user copies it
3. They leave the checkout page and open their bank app
4. They navigate to the transfer screen, paste the account number, enter the amount
5. They complete the transfer and switch back to the merchant's checkout page for confirmation.

This happens millions of times a day. It is slow, fragile, and full of drop-off points — users abandon checkouts mid-flow, paste wrong account numbers, or simply give up. Merchants lose sales. Payment processors lose volume. Everyone loses.

The irony is that the money is sitting ready in a PalmPay or OPay wallet. The only thing standing between the user and a completed payment is four unnecessary steps and two app switches.

---

## The Solution

**FastCheckout** is a floating overlay that detects when a "Pay with Transfer" screen appears and gives the user a direct path to complete the transfer — without leaving the checkout page.

When the transfer details screen renders, a **Fast Checkout FAB** (Floating Action Button) slides in. The user taps it. A lightweight modal opens, pre-filled with the merchant name, transfer amount, and destination account. They authenticate with their PIN and the payment is sent. The entire flow takes under 10 seconds.

No app switching. No copying. No losing the checkout page.

---

## How It Works

```
Checkout page loads
        ↓
User selects "Pay with Transfer"
        ↓
Transfer details appear (account number, bank, amount)
        ↓
FastCheckout FAB slides in [top-right]
        ↓
User taps FAB → modal opens (pre-filled with transfer details)
        ↓
User taps "Transfer Now" → PIN entry screen
        ↓
User enters 4-digit PIN → Payment sent
        ↓
Success screen — user stays on the checkout page
```

The overlay sits on top of the existing checkout UI. It does not interfere with the merchant's flow, does not redirect the user, and does not require the merchant to change anything on their end.

---

## What This Prototype Demonstrates

This is an interactive concept prototype simulating how FastCheckout would work if integrated natively by a wallet provider (e.g. PalmPay, OPay, or Kuda).

The prototype includes:

- A pixel-accurate simulation of the Paystack checkout modal — both the card view and the "Pay with Transfer" screen
- The FastCheckout FAB with spring entrance animation and idle glow
- A three-state modal flow:
  - **State 1** — Transfer summary (merchant, amount, destination account)
  - **State 2** — PIN entry with native keyboard and animated dot indicators
  - **State 3** — Animated SVG checkmark success screen
- Smooth horizontal slide transitions between modal states
- A live countdown timer on the Paystack transfer screen

---

## The Bigger Picture

FastCheckout is not a fintech product. It does not hold funds, initiate debits, or sit between the user and their money. It is a **UX layer** — a shortcut that connects a user to their own wallet faster.

This means:

- **No CBN licensing required** — no funds are held or moved by the product itself
- **No security risk beyond what the wallet already provides** — authentication is handled by the wallet's own PIN system
- **Wallet providers retain full control** — FastCheckout is a feature they can ship natively, not a third-party with access to funds

The natural integration path is for a wallet provider to build this as a native browser extension or in-app overlay, using their own deep-link scheme to pre-fill the transfer screen. It will works on only Android device iOS restricts in-app overlay.

---

## Built With

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- Vanilla CSS animations (no animation libraries)
- SVG stroke-dashoffset for the checkmark animation

---

## Running Locally

```bash
git clone https://github.com/yourusername/fastcheckout.git
cd fastcheckout
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## The Opportunity

Nigeria processes over ₦100 trillion in transfers annually through NIBSS. A significant portion of that volume originates from online checkout flows. Every percentage point of friction reduction in that flow is worth hundreds of millions in recovered transactions.

FastCheckout is a category that does not exist yet in the Nigerian market. The infrastructure (wallets, virtual accounts, USSD) is already in place. What is missing is the user-side layer that connects them seamlessly.

---

## Author

Built by [Harry](https://www.linkedin.com/in/elochukwu-udechukwu/) — product thinker

---

## License

MIT
