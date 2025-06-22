# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (default port 5173, falls back to next available)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run Svelte type checking in watch mode

## Architecture Overview

This is a SvelteKit proof-of-concept application for testing OAuth 2.0 + PKCE authentication flows and CORS API testing from the browser.

### Core Components

**OAuth Flow Implementation**
- `src/lib/oauth.js` - Contains OAuth 2.0 + PKCE implementation with functions for:
  - Code verifier/challenge generation (PKCE)
  - State parameter generation for CSRF protection
  - OAuth initiation (`initiateOAuth`)
  - Callback handling (`handleOAuthCallback`)
- Uses browser's Web Crypto API for secure random generation

**State Management**
- `src/lib/stores/auth.js` - Svelte stores for OAuth state management:
  - `authState` - Authentication status, tokens, user data, errors, loading state
  - `oauthConfig` - OAuth provider configuration (client ID, URLs, scope)
  - Helper functions for updating auth state

**UI Components**
- `OAuthConfig.svelte` - OAuth provider configuration form with default redirect URI logic
- `AuthStatus.svelte` - Display current authentication status
- `CorsTestor.svelte` - API endpoint testing for CORS compatibility

### OAuth Flow Details

The app implements OAuth 2.0 Authorization Code flow with PKCE:
1. User configures OAuth provider settings (client ID, auth URL, token URL)
2. App generates code verifier, challenge, and state parameters
3. User is redirected to OAuth provider's authorization endpoint
4. Provider redirects back to `/callback` with authorization code
5. App exchanges code for tokens using PKCE verification

### Default Configuration

- Default redirect URI: `{window.location.origin}/callback`
- Development server: `http://localhost:5174/callback` (or next available port)
- Default scope: `openid profile email`

### Missing Route Handler

The app expects OAuth providers to redirect to `/callback` but SvelteKit doesn't have a route handler for this endpoint yet. You'll need to create `src/routes/callback/+page.svelte` or `src/routes/callback/+page.server.js` to handle the OAuth callback and extract the authorization code from URL parameters.