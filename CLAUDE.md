# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **copy-share** project workspace that contains:

1. **Enclosed** - An end-to-end encrypted note sharing application (cloned from https://github.com/CorentinTh/enclosed)
2. **Modification Plan Docs** - Detailed documentation for adding management features to Enclosed (in `./docs/`)

## Key Directories

- `./enclosed/` - The Enclosed project (Node.js + SolidJS + HonoJS monorepo)
- `./docs/` - Design documents for adding management features to Enclosed
- `./CLAUDE.local.md` - User's private instructions (in Linus Torvalds style)

## Enclosed Project Structure

The Enclosed project is a pnpm monorepo with the following packages:

### Backend (packages/app-server/)

- **Tech Stack**: HonoJS + Unstorage + Zod + TypeScript
- **Entry Points**:
  - `src/index.node.ts` - Node.js server
  - `src/index.cloudflare.ts` - Cloudflare Workers
- **Key Modules**:
  - `modules/notes/` - Note CRUD operations
  - `modules/app/auth/` - Authentication middleware
  - `modules/app/config/` - Configuration management
  - `modules/storage/` - Storage abstraction layer

### Frontend (packages/app-client/)

- **Tech Stack**: SolidJS + UnoCSS + Shadcn-solid
- **Key Files**:
  - `src/routes.tsx` - Route definitions
  - `src/modules/notes/pages/create-note.page.tsx` - Create note page
  - `src/modules/notes/pages/view-note.page.tsx` - View note page

### Shared Library (packages/lib/)

- **Crypto Operations**: Encryption/decryption logic
- **API Client**: HTTP client for backend communication

## Port Configuration Rules

**IRON LAW: Never hardcode ports in code. Use environment variables with these defaults:**

- **Backend**: Port `3501` (env: `PORT` or `BACKEND_PORT`)
- **Frontend**: Port `3500` (env: `VITE_PORT` or `FRONTEND_PORT`)

All port references MUST use environment variables. Hardcoding ports is a configuration management error that breaks deployment flexibility.

## Development Commands

### Start Development Server

```bash
# Backend (from enclosed/packages/app-server/)
pnpm run dev:node    # Should start on http://localhost:3501

# Frontend (from enclosed/packages/app-client/)
pnpm run dev         # Should start on http://localhost:3500
```

### Build

```bash
# From enclosed/ root
pnpm install         # Install all dependencies
pnpm run build       # Build all packages
```

### Testing

```bash
# From enclosed/packages/app-server/
pnpm run test        # Run unit tests
pnpm run test:watch  # Watch mode
```

## Key Architectural Concepts

### 1. End-to-End Encryption

- **Base Key** generated on client-side
- **Master Key** derived using PBKDF2
- **Content encrypted** with AES-256-GCM before sending to server
- **Server has zero knowledge** of plaintext content

### 2. URL Structure

```
http://localhost:8787/{noteId}#{encryptionKey}&pwd={isPasswordProtected}
```

- Hash fragment (`#`) never sent to server
- Encryption key stored in URL hash for client-side decryption

### 3. Storage Backend

- **Unstorage** abstraction layer
- Supports: Memory, FileSystem, Cloudflare KV
- KV-based: No complex queries, only get/set/delete operations

## Modification Plan

The `./docs/` directory contains a complete plan for adding management features:

1. **00-项目概述.md** - Overview and architecture
2. **01-需求分析.md** - Requirements and user stories
3. **02-数据结构设计.md** - Database schema and data models
4. **03-API设计.md** - Backend API specifications
5. **05-实现步骤.md** - Step-by-step implementation guide
6. **08-风险评估.md** - Privacy and technical risks

### Key Modifications Planned

1. **LocalStorage Management** - Store note list in browser
2. **My Notes Page** - List all user-created notes
3. **Delete Functionality** - Delete notes with permission check
4. **User Association** (Optional) - Link notes to user accounts

### Important Privacy Notes

⚠️ **Warning**: Adding management features will reduce Enclosed's privacy guarantees:

- Server will know which user created which notes (if user association is enabled)
- Original "zero knowledge" claim weakens
- Consider providing "anonymous mode" option

## Common Development Tasks

### Add a New Route

1. Create page component in `packages/app-client/src/modules/notes/pages/`
2. Add route in `packages/app-client/src/routes.tsx`
3. Add translations in `packages/app-client/src/modules/i18n/locales/*.json`

### Add a New API Endpoint

1. Add route handler in `packages/app-server/src/modules/notes/notes.routes.ts`
2. Update repository in `packages/app-server/src/modules/notes/notes.repository.ts`
3. Add types in `packages/app-server/src/modules/notes/notes.types.ts`

### Extend Database Schema

1. Update `DatabaseNote` interface in `packages/app-server/src/modules/notes/notes.types.ts`
2. Add migration logic if needed
3. Update repository methods to handle new fields

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Antfu config
- **Formatting**: Follow existing conventions
- **Naming**:
  - Functions: camelCase, descriptive
  - Components: PascalCase
  - Constants: UPPER_SNAKE_CASE for true constants
  - Files: kebab-case

## Important Notes for Claude

1. **No Reports Unless Asked**: DO NOT output any reports or documents unless explicitly requested by the user. Keep responses concise and direct.

2. **Respect Privacy Design**: Enclosed's core value is end-to-end encryption. Any modifications should preserve this when possible.

3. **LocalStorage First**: The modification plan recommends starting with LocalStorage-based management before adding server-side user association.

4. **Test Thoroughly**: Encryption/decryption is complex. Test all changes carefully.

5. **Follow Linus Philosophy**: The user's CLAUDE.local.md contains instructions in Linus Torvalds style. Be direct, practical, and prioritize simplicity.

6. **Document Trade-offs**: When adding features that reduce privacy, clearly document the trade-offs.

## Useful Resources

- **Enclosed Docs**: https://docs.enclosed.cc
- **Enclosed GitHub**: https://github.com/CorentinTh/enclosed
- **HonoJS Docs**: https://hono.dev
- **SolidJS Docs**: https://www.solidjs.com
- **Unstorage Docs**: https://unstorage.unjs.io

## Environment Variables

Key configuration options (see `packages/app-server/src/modules/app/config/config.ts`):

```bash
# Server Ports (REQUIRED - DO NOT HARDCODE)
PORT=3501                # Backend default port
VITE_PORT=3500          # Frontend default port

# Server
NODE_ENV=development

# Storage
STORAGE_DRIVER_FS_LITE_PATH=./.data

# Authentication (optional)
PUBLIC_IS_AUTHENTICATION_REQUIRED=false
AUTHENTICATION_JWT_SECRET=change-me
AUTHENTICATION_USERS=email:bcryptHash

# Notes
NOTES_MAX_ENCRYPTED_PAYLOAD_LENGTH=52428800  # 50MB
PUBLIC_DEFAULT_NOTE_TTL_SECONDS=3600
PUBLIC_IS_SETTING_NO_EXPIRATION_ALLOWED=true
```

## Current Status

- ✅ Enclosed cloned and dependencies installed
- ✅ Backend server running on http://localhost:8787
- ✅ Modification plan documented in `./docs/`
- ⏳ Implementation not started yet

When implementing the modifications, start with **Phase 1 (LocalStorage basics)** from `./docs/05-实现步骤.md`.

---

**Last Updated**: 2025-10-17
**Maintainer**: Claude Code (following Linus-style guidance from CLAUDE.local.md)
