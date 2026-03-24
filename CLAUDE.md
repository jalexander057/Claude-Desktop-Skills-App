# SkillKit Desktop

## What This Is

A local-first Tauri v2 desktop app that delivers a **managed library** of Claude Code skills to PE/finance professionals. This is NOT a marketplace or platform -- Jake (the founder) is the sole skill author. The app is the delivery vehicle for his proprietary, continuously improving skill library.

## Business Model

SaaS subscription. Users pay for access to the skill library + ongoing updates. Users bring their own Claude subscription. User data never touches our servers. We push skill updates live to subscribers via the app.

Pricing: $49/user/month (Pro), $79/seat/month (Team 5+), custom Enterprise.

## Architecture Decisions

- **Tauri v2** (not Electron) -- security narrative for finance firms, small binary, Rust backend
- **Skills are Claude Code plugins** with a `skillkit.json` overlay for GUI metadata
- **App wraps Claude Code CLI** -- shells out to `claude --print` for execution, never reimplements the runtime
- **Local-first** -- all model inference and file processing on user's machine, our cloud only handles license validation, skill package distribution, and team policy sync
- **Windows-first** -- target users are on Windows. macOS is secondary.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Zustand + React Hook Form + Zod
- **Backend:** Rust (Tauri v2) + SQLite (rusqlite) + tokio
- **Skills:** SKILL.md (Claude Code format) + skillkit.json (GUI metadata)

## Project Structure

```
skillkit/                    # The Tauri desktop app
  src/                       # React frontend
    components/layout/       # Sidebar, AppLayout
    components/skills/       # SkillLibrary, SkillRunner, SkillOutput, ExecutionHistory
    components/settings/     # Settings page
    components/ui/           # Button, Badge, Card, Input, Select
    stores/app-store.ts      # Zustand store (currently has mock data)
    types/skill.ts           # Frontend types
  src-tauri/src/             # Rust backend
    lib.rs                   # App entry, plugin registration
    commands.rs              # 7 Tauri IPC commands
    claude.rs                # Claude Code CLI detection + execution (Windows + macOS)
    skills.rs                # Skill catalog (3 hardcoded MVP skills)
    db.rs                    # SQLite execution logging

skills/                      # Standalone skill packages (the IP)
  pdf-financial-extractor/   # SKILL.md + skillkit.json
  excel-model-auditor/       # SKILL.md + skillkit.json
  deal-deck-builder/         # SKILL.md + skillkit.json

skillkit-types/              # Formal TypeScript type definitions (reference)
PRODUCT_SPEC.md              # Full product requirements document
```

## Current State (v0.1.0)

- Frontend builds clean (Vite: 265KB JS, 24KB CSS)
- Rust backend compiles clean with Windows + macOS Claude Code path detection
- 3 finance skills written with detailed SKILL.md instructions
- UI uses mock data -- not yet wired to Rust backend via Tauri IPC
- No license server, no update pipeline, no team management yet

## Setup on a New Machine

```bash
# 1. Clone the repo
git clone https://github.com/jalexander057/Claude-Desktop-Skills-App.git
cd Claude-Desktop-Skills-App

# 2. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# 3. Install frontend dependencies
cd skillkit && npm install

# 4. Verify frontend builds
npx vite build

# 5. Verify Rust compiles
cargo check --manifest-path src-tauri/Cargo.toml

# 6. Run dev mode (opens the app window)
npx tauri dev
```

## Next Steps (Priority Order)

1. **Wire frontend to Rust backend** -- replace mock data in Zustand store with actual Tauri IPC `invoke()` calls
2. **File picker integration** -- use Tauri dialog plugin for native file selection instead of text inputs
3. **Test skill execution end-to-end** -- verify `claude --print` invocation works from the Rust backend
4. **Windows build pipeline** -- set up GitHub Actions CI for Windows .msi builds
5. **License server** -- Stripe + simple API for subscription validation
6. **Live skill update pipeline** -- push skill updates from private repo to subscriber apps

## Key Constraints

- Never proxy user data through our servers
- Never touch user's Claude API key
- Skills run through Claude Code's sandbox -- we add a GUI consent layer on top
- Telemetry is opt-in and local-only by default (finance firms are sensitive to usage logging)
