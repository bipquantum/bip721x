# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bipquantum is an intellectual property (IP) marketplace built on the Internet Computer Protocol (ICP) using a multi-canister architecture. The platform enables users to create, trade, and manage intellectual property as NFTs with integrated chat functionality and royalty management.

## Development Commands

### Setup
```bash
npm install
mops toolchain init  # Restart VS Code or terminal after this
mops install
```

### Local Development
```bash
dfx start --background
./install-local.sh
npm run start  # Starts Vite dev server on port 3000
```

### Build and Deploy
```bash
npm run build    # Builds frontend with dfx generate
dfx deploy      # Deploy to local replica
```

### Testing
```bash
mops test       # Run Motoko tests
```

### Formatting
```bash
npm run format  # Format frontend code with Prettier
```

### Tailwind CSS
```bash
npm run tw:generate  # Generate Tailwind CSS with watch mode
```

## Architecture

### Multi-Canister Structure
- **backend**: Main business logic canister (Motoko)
- **bip721_ledger**: ICRC-7 NFT ledger for IP tokens (Motoko)
- **bqc_ledger**: BQC token ledger for marketplace currency (Motoko)
- **ckusdt_ledger**: chain-key USDT ledger on the internet computer (Rust)
- **frontend**: React/TypeScript frontend assets
- **internet_identity**: External identity provider (pulled canister)

### Backend Architecture (Motoko)
- **Controller.mo**: Main business logic coordinator
- **TradeManager.mo**: Handles NFT trading, royalties, and transfers
- **ChatBot.mo**: AI chat functionality integration
- **ChatBotHistory.mo**: Chat history management
- **Types.mo**: Core type definitions
- **migrations/**: Database migration system with versioned state

### Frontend Architecture (React/TypeScript)
- **components/App.tsx**: Main application with theme context
- **actors/**: Canister actor providers for IC integration
- **pages/**: Route-based page components (dashboard, bips, profile, etc.)
- **layout/**: Navigation and layout components
- **common/**: Shared UI components and utilities
- **hooks/**: Custom React hooks for IP operations

### Key Features
- **IP Creation**: Users can create intellectual property NFTs with metadata
- **Marketplace**: Buy/sell/list IP tokens with BQC currency
- **Chat Integration**: AI-powered chat with history
- **Royalties**: Automatic royalty distribution on secondary sales
- **User Profiles**: User management with country/specialty info
- **Airdrop System**: Token distribution mechanism

## Development Notes

### State Management
- Multiple context providers for authentication, balance, chat history
- Stable storage with migration system in backend

### React Hook Guidelines
- **NEVER use actor calls (`useQueryCall`, `useUpdateCall`) as dependencies in `useEffect`** - This causes infinite re-render loops and makes the application unusable
- **ALWAYS provide `args` parameter to actor hooks** - Query calls like `useQueryCall` require an `args` parameter (even if empty array `args: []`) to execute. Without it, the query won't run and `data` will remain `undefined`

### Styling
- Tailwind CSS for styling
- Dark/light theme support with localStorage persistence
- Responsive design with mobile navigation

### Testing
- Motoko unit tests in `test/` directory
- Use `mops test` for backend testing
- Test scenarios available in `scripts/` directory

### Known TODOs
- ChatGPT API key injection (currently hardcoded)
- Idempotent proxy cycle consumption optimization
- ICRC-7/ICRC-37/ICRC-3 implementation code review
- Frontend miscellaneous improvements

## Code Readability Guidelines

### Avoid Deep Nesting with Early Returns (Guard Clauses)

**❌ AVOID: Deep nesting with nested switch/if statements**
```motoko
public func claim_rewards(account: Account) : async* ?Nat {
    switch (Map.get(rewards, hash, account)) {
        case (null) { null; };
        case (?tracker) {
            if (tracker.owed > 0) {
                let result = await* transfer(tracker.owed, account);
                switch (result) {
                    case (#ok(tx_id)) { ?tracker.owed; };
                    case (#err(_)) { null; };
                };
            } else {
                null;
            };
        };
    };
}
```

**✅ DO: Use early returns (guard clauses) to reduce nesting**
```motoko
public func claim_rewards(account: Account) : async* ?Nat {
    let tracker = switch (Map.get(rewards, hash, account)) {
        case (null) { return null; };
        case (?t) { t; };
    };
    
    if (tracker.owed == 0) {
        return null;
    };
    
    let result = await* transfer(tracker.owed, account);
    let tx_id = switch (result) {
        case (#err(_)) { return null; };
        case (#ok(id)) { id; };
    };
    
    // Main logic here at consistent indentation
    ?tracker.owed;
}
```

**Pattern Benefits**:
- **Readability**: Main logic flows at consistent indentation level
- **Maintainability**: Error conditions are handled upfront and clearly
- **Cognitive Load**: Reduces mental tracking of nested conditions
- **Early Exit**: Handles edge cases immediately, keeping main logic clean

**When to Apply**:
- Functions with optional values that are required for the rest of the logic
- Multiple validation checks that should fail fast
- Error handling that doesn't need complex recovery logic
- Any time nesting exceeds 2-3 levels

This pattern is also known as "guard clauses" or "early return pattern" in software engineering.