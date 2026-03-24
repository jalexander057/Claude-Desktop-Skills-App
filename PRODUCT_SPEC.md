# SkillKit Desktop: Product Requirements Document

**Version:** 0.2 (Revised)
**Date:** 2026-03-23
**Author:** [Founder]
**Status:** Pre-build

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Landscape Reality Check](#2-landscape-reality-check)
3. [Product Definition](#3-product-definition)
4. [Target Users](#4-target-users)
5. [User Stories](#5-user-stories)
6. [System Architecture](#6-system-architecture)
7. [Recommended Tech Stack](#7-recommended-tech-stack)
8. [Security Model](#8-security-model)
9. [Permissions Model](#9-permissions-model)
10. [Skill Package Specification](#10-skill-package-specification)
11. [Local vs Cloud Responsibilities](#11-local-vs-cloud-responsibilities)
12. [Local File and Config Structure](#12-local-file-and-config-structure)
13. [Sample Skill Schema](#13-sample-skill-schema)
14. [Example Skills: PE/Finance Vertical](#14-example-skills-pefinance-vertical)
15. [MVP Scope](#15-mvp-scope)
16. [Roadmap](#16-roadmap)
17. [Pricing and Monetization](#17-pricing-and-monetization)
18. [Major Risks](#18-major-risks)
19. [Open Questions](#19-open-questions)

---

## 1. Executive Summary

SkillKit Desktop is a local-first desktop application that delivers a managed library of expert-built Claude Code skills to non-technical finance professionals. You (the founder) are the skill author. The app is your distribution and update channel. Users bring their own Claude subscription. All model inference, file access, and data processing happen locally on the user's machine. You monetize through a SaaS subscription that grants access to your continuously expanding and improving skill library -- not through proxying API calls or touching customer data.

**The core thesis:** There is a large population of knowledge workers in PE, investment banking, and financial services who would pay for professionally built, continuously maintained AI workflows delivered through a polished GUI -- but who will never open a terminal, write a prompt, or configure a YAML file. You are selling the skills themselves and your ongoing expertise in making them excellent, not a platform for others to publish on.

**The moat:** Domain expertise in finance workflows + continuous skill improvement + seamless GUI delivery + live push updates to teams. Anthropic builds horizontal infrastructure. You build the vertical product on top of it and own the customer relationship.

---

## 2. Landscape Reality Check

Before building, you need to understand what already exists. As of March 2026, the Claude Code ecosystem is significantly more mature than most founders realize:

### What Already Exists

| Capability | Current State |
|---|---|
| **Skills** | Markdown-based, follow the open [AgentSkills.io](https://agentskills.io) standard. Support auto-invocation, subagent delegation, dynamic context injection, model overrides, and tool restrictions. |
| **Plugins** | Bundle skills + MCP servers + hooks + agents into installable units. 9,000+ plugins exist. Namespaced to prevent conflicts. |
| **Marketplace** | Git-based. Anthropic runs an official marketplace. Anyone can host a custom marketplace. Enterprise controls exist (blocklists, force-enable, restrict sources). |
| **Distribution** | `npm`, GitHub repos, git subdirectories, relative paths. One-command install via `/plugin install`. |
| **MCP Protocol** | Industry standard (Linux Foundation). Adopted by OpenAI, Google, etc. Handles tool/resource/prompt primitives over JSON-RPC. |
| **Desktop Extensions** | `.mcpb` files for one-click MCP server installation in Claude Desktop. |
| **Permissions** | Layered deny/ask/allow system. Enterprise managed settings. OS-level sandboxing. |

### What Does NOT Exist

| Gap | Opportunity |
|---|---|
| **GUI for skills** | Everything is CLI or text-config. No visual browse/install/configure/run experience. |
| **Non-developer UX** | Skills assume you're comfortable with terminals, markdown frontmatter, and file systems. |
| **Vertical curation** | The marketplace is horizontal. No one is curating "PE/finance skill packs" or "legal workflow bundles." |
| **Guided workflows** | Skills are invoked by slash command. No step-by-step wizard UI, no form-based input, no visual output formatting. |
| **Team management** | No way for a firm to say "here are the 12 approved skills for our analysts" with a GUI. |
| **Skill analytics** | No visibility into which skills are being used, how often, or by whom across a team. |

### Strategic Implication

You are NOT building the skill runtime, the marketplace protocol, or an open platform. Those exist and are maintained by Anthropic. You are building a **proprietary skill library + GUI delivery app + live update pipeline + team management layer** that runs on top of Claude Code's infrastructure. Think of it like: Anthropic is the app store OS, Claude Code is the runtime, and you are a premium software studio shipping a subscription product through your own app. You own the skills, you own the customer relationship, you push updates on your schedule.

---

## 3. Product Definition

### What It Is

A native desktop application that:

1. **Delivers** your proprietary library of finance-specific Claude Code skills through a polished GUI
2. **Runs** skills with guided input workflows (file pickers, forms, drag-and-drop) and formatted output
3. **Receives live updates** -- when you improve a skill or ship a new one, subscribers get it immediately via the app
4. **Manages** permissions, execution logs, and team-wide deployments
5. **Syncs with Anthropic's evolving platform** -- you absorb the complexity of Claude Code updates so your users don't have to

### What It Is Not

- Not an open marketplace or platform for third-party skill authors (you are the author)
- Not a Claude API proxy or middleware (no model traffic flows through your servers)
- Not a replacement for Claude Code CLI (power users can still use the CLI; this is the GUI product)
- Not a general-purpose AI chat app (it's a skill runner, not a conversation interface)
- Not a code editor or IDE extension

### Core Value Proposition

**"AI-powered finance workflows that run on your machine, built by someone who understands your work."**

Secondary: "A growing library of expert-built skills for PE, IB, and financial services -- delivered through a desktop app, updated continuously, running entirely on your laptop with your own Claude account."

### Business Model in One Sentence

You are a **SaaS skill studio**: you build and maintain the skills, you ship them through your app, teams subscribe for access to the library and ongoing updates. You never touch their data. They bring their own Claude.

---

## 4. Target Users

### Primary: Non-Technical Knowledge Workers at Professional Services Firms

| Attribute | Detail |
|---|---|
| **Role** | Analysts, associates, VPs at PE firms, investment banks, consulting firms, law firms, accounting firms |
| **Technical comfort** | Use Excel, PowerPoint, Outlook daily. Comfortable installing desktop apps. Do NOT use terminals, CLIs, or code editors. |
| **Data sensitivity** | Work with highly confidential deal documents, financials, legal agreements. Cannot use tools that transmit data to third-party servers. |
| **Buying behavior** | Firm purchases tools centrally or reimburses individual subscriptions. Price-insensitive if the tool saves meaningful analyst hours. |
| **Current AI usage** | May use Claude/ChatGPT via web UI for ad-hoc queries. No systematic AI workflow automation. |

### Secondary: Technical Team Leads / IT Admins at These Firms

- Deploy and manage approved skills across the team
- Set permissions and data handling policies
- Need audit logs and compliance reporting

### Tertiary: Managing Directors / Partners (Buyer Persona)

- Approve budget for team tools
- Care about ROI (hours saved per analyst per week), security posture, and compliance
- Will not use the app themselves but need to understand the value proposition
- Want proof that data stays local and that the tool doesn't create regulatory exposure

---

## 5. User Stories

### Skill Library and Updates

| ID | Story | Priority |
|---|---|---|
| U-01 | As an analyst, I can see the full SkillKit library organized by workflow (e.g., "Due Diligence," "Financial Modeling," "Reporting") and understand what each skill does before running it. | P0 |
| U-02 | As an analyst, when Jake ships a new skill or improves an existing one, it appears in my app automatically without me doing anything. | P0 |
| U-03 | As an analyst, I can see a "What's New" feed showing recently added or improved skills so I know when new capabilities are available. | P1 |
| U-04 | As an IT admin, I can control which skills from the library are visible/enabled for my team (e.g., hide skills that aren't relevant to our fund's workflow). | P1 |

### Skill Execution

| ID | Story | Priority |
|---|---|---|
| U-05 | As an analyst, I can run a skill by clicking it, filling in a form (e.g., "select PDF," "choose output format"), and receiving structured output -- without writing a prompt. | P0 |
| U-06 | As an analyst, I can drag-and-drop files (PDF, Excel, PowerPoint) onto a skill to use them as input. | P0 |
| U-07 | As an analyst, I can see a progress indicator while a skill is running and cancel it if needed. | P0 |
| U-08 | As an analyst, I can view skill output in a formatted way (tables, charts, documents) and export it to common formats. | P1 |
| U-09 | As an analyst, I can re-run a skill with different inputs without reconfiguring it. | P1 |

### Configuration and Permissions

| ID | Story | Priority |
|---|---|---|
| U-10 | As an analyst, I can connect the app to my existing Claude account (API key or OAuth) and verify it works. | P0 |
| U-11 | As an analyst, I can see exactly which files and directories a skill will access before granting permission. | P0 |
| U-12 | As an IT admin, I can restrict which skills users can install and which file paths skills can access. | P1 |
| U-13 | As an analyst, I can see a log of everything a skill did (files read, files written, API calls made) after it completes. | P1 |

### Team and Management

| ID | Story | Priority |
|---|---|---|
| U-14 | As an IT admin, I can see usage analytics (which skills, how often, by whom) across my team. | P2 |
| U-15 | As an IT admin, I can define a team-wide skill policy (enabled skills, permission defaults) that syncs to all team members' apps. | P2 |
| U-16 | As a team lead, I can request a custom skill from Jake (the vendor) tailored to our firm's specific workflow, and have it delivered to our team through the app. | P2 |
| U-17 | As a managing director, I can see a monthly summary of team usage and estimated time saved to justify the subscription cost. | P2 |

---

## 6. System Architecture

### High-Level Architecture

```
+------------------------------------------------------------------+
|                        USER'S MACHINE                            |
|                                                                  |
|  +----------------------------+   +---------------------------+  |
|  |   SkillKit Desktop App     |   |   Claude Code CLI         |  |
|  |   (Tauri / webview)        |   |   (already installed)     |  |
|  |                            |   |                           |  |
|  |  +----------------------+  |   |  +---------------------+  |  |
|  |  | Skill Browser UI     |  |   |  | Skill Runtime       |  |  |
|  |  | Skill Runner UI      |<-|---|->| MCP Server Host     |  |  |
|  |  | Config Manager UI    |  |   |  | Permission Engine   |  |  |
|  |  | Team Dashboard UI    |  |   |  | Sandbox             |  |  |
|  |  +----------------------+  |   |  +---------------------+  |  |
|  |                            |   |                           |  |
|  |  +----------------------+  |   +---------------------------+  |
|  |  | Local Skill Store    |  |                                  |
|  |  | (installed skills,   |  |   +---------------------------+  |
|  |  |  configs, logs)      |  |   | Anthropic API             |  |
|  |  +----------------------+  |   | (user's own key/account)  |  |
|  |                            |   +---------------------------+  |
|  +----------------------------+                                  |
+------------------------------------------------------------------+
              |
              | HTTPS (metadata only)
              v
+------------------------------------------------------------------+
|                     YOUR CLOUD SERVICES                          |
|  (Jake's infrastructure -- metadata and updates only)            |
|                                                                  |
|  +----------------------+  +---------------------------+         |
|  | Skill Library API    |  | License / Auth Service    |         |
|  | (manifest, versions, |  | (seat validation,         |         |
|  |  changelogs, assets) |  |  entitlement checks)      |         |
|  +----------------------+  +---------------------------+         |
|                                                                  |
|  +----------------------+  +---------------------------+         |
|  | Live Update Push     |  | Team Admin API            |         |
|  | (skill versions,     |  | (seat mgmt, policies,     |         |
|  |  delta packages,     |  |  usage dashboards)        |         |
|  |  new skill announce) |  |                           |         |
|  +----------------------+  +---------------------------+         |
+------------------------------------------------------------------+
```

### Key Architectural Decisions

**Decision 1: Wrap Claude Code, don't replace it.**

The app shells out to `claude` CLI commands (or uses Claude Code's SDK mode / programmatic API) to execute skills. It does NOT re-implement the skill runtime, MCP hosting, permission engine, or sandbox. Rationale:

- Claude Code's runtime is actively maintained by Anthropic
- The permission and sandbox layers are battle-tested
- Skills in the wild are already built for Claude Code's runtime
- You avoid maintaining a parallel execution environment

**Decision 2: The app is a delivery vehicle, not a proxy.**

All Claude API calls go directly from the user's machine to Anthropic. The app never sees, routes, or stores model request/response payloads. Your cloud services only handle:

- Skill package distribution (the SKILL.md files and skillkit.json manifests -- your IP, not customer data)
- License/entitlement validation (does this user/team have an active subscription?)
- Live update push (new skill versions, new skills added to the library)
- Team administration (seat management, skill visibility policies)

**Decision 3: Skills are Claude Code plugins under the hood, but they're YOUR plugins.**

Every skill in your library is a valid Claude Code plugin that could theoretically be installed via the CLI. But you distribute them exclusively through your app, which adds:

- A `skillkit.json` manifest with GUI metadata (form schema, input types, output formatting, screenshots)
- A visual form layer that translates GUI inputs into skill arguments
- Output formatting that renders skill results in the app's UI
- Versioned updates pushed from your build pipeline

This means you're compatible with Claude Code's runtime (no fork risk) but your skills are proprietary and delivered through your channel.

**Decision 4: Live skill updates are your key differentiator.**

When you improve a skill (better prompts, new output formats, bug fixes) or ship a new skill, the update pipeline works like this:

```
1. You update a skill locally and test it
2. You push to your skill distribution service (git-based or API-based)
3. Your cloud service increments the version and generates a delta package
4. All connected SkillKit apps receive an update notification
5. App downloads the new skill version in the background
6. User sees a "1 update available" badge (or auto-applies if team policy allows)
7. Updated skill is immediately available on next run
```

This is the muscle that makes the SaaS model work: subscribers get continuous value, not a static download.

### Execution Flow

```
1. User clicks "Run" on a skill in the GUI
2. App reads the skill's form schema (skillkit.json)
3. App presents a form UI (file pickers, dropdowns, text fields)
4. User fills in the form and clicks "Execute"
5. App translates form inputs into skill arguments
6. App invokes Claude Code:
   claude --skill <skill-name> --args "<serialized-args>" \
          --output-format json --session-id <tracking-id>
7. App streams Claude Code's output to the UI
8. App formats output per the skill's output schema
9. App logs the execution (locally) for audit trail
```

**Fallback if Claude Code SDK mode is unavailable:** Use Claude Code's `--print` mode or pipe commands to stdin. Worst case, spawn an interactive Claude Code session and communicate via stdio.

---

## 7. Recommended Tech Stack

### Desktop Framework: Tauri v2

**Recommendation: Tauri, not Electron.**

| Factor | Tauri | Electron |
|---|---|---|
| **Binary size** | ~5-10 MB | ~150-200 MB |
| **Memory usage** | ~30-50 MB | ~150-300 MB |
| **Security** | Rust backend, granular IPC permissions, no Node.js in main process | Full Node.js access in main process, larger attack surface |
| **System access** | Native Rust plugins for filesystem, process spawning | Node.js child_process (works but heavier) |
| **Startup time** | Near-instant | 2-5 seconds |
| **Auto-update** | Built-in updater | electron-updater (works fine) |
| **Maturity** | Tauri v2 is stable (GA since late 2024), strong ecosystem | Very mature, massive ecosystem |
| **Signing/notarization** | Built-in support for macOS, Windows | Works but more manual |
| **Webview** | System webview (WebKit on macOS, WebView2 on Windows) | Bundled Chromium |

**Why Tauri wins for this product:**

1. **Security narrative.** You're selling to finance/legal firms with confidential data. "Built with Rust, no bundled browser engine, minimal attack surface" is a real sales differentiator. Electron's reputation in security-conscious organizations is poor.
2. **Binary size.** A 5 MB download vs 200 MB matters for enterprise deployment.
3. **System integration.** Tauri's Rust backend makes it natural to spawn Claude Code processes, manage file watching, and handle IPC securely.
4. **Resource usage.** Analysts already have Excel, PowerPoint, Outlook, and a browser open. Adding a 300 MB Electron app on top is noticeable. A 30 MB Tauri app is not.

**The case against Tauri (be aware of these):**

- Smaller talent pool if you hire (more Electron developers exist)
- System webview inconsistencies across OS versions (less of an issue on macOS/Windows 11+)
- Less mature plugin ecosystem than Electron

### Frontend

| Layer | Choice | Rationale |
|---|---|---|
| **UI framework** | React 19 | Largest talent pool, mature ecosystem, good Tauri integration |
| **Styling** | Tailwind CSS v4 | Fast iteration, consistent design, small bundle |
| **Component library** | shadcn/ui | Copy-paste components, no dependency lock-in, good accessibility |
| **State management** | Zustand | Lightweight, no boilerplate, works well with Tauri IPC |
| **Forms** | React Hook Form + Zod | Dynamic form generation from skill schemas |
| **File handling** | Tauri fs plugin + drag-and-drop API | Native file picker, drag-and-drop support |

### Backend (Rust / Tauri)

| Layer | Choice | Rationale |
|---|---|---|
| **Process management** | `tokio::process` | Async Claude Code process spawning and streaming |
| **Local database** | SQLite via `rusqlite` | Skill metadata, execution logs, user preferences |
| **Config management** | `serde` + TOML/JSON | Read/write Claude Code config files |
| **File watching** | `notify` crate | Watch for skill output files |
| **IPC** | Tauri command system | Type-safe frontend-backend communication |
| **Crypto** | `ring` or system keychain | License key validation, credential storage |

### Cloud Services (Your Infrastructure)

| Layer | Choice | Rationale |
|---|---|---|
| **API** | Cloudflare Workers or Hono on Fly.io | Low-cost, global edge, minimal infrastructure |
| **Database** | PlanetScale (MySQL) or Turso (SQLite) | Subscriber accounts, team configs, skill version metadata |
| **Auth** | Clerk or custom JWT | License validation, team seat management |
| **Skill distribution** | Cloudflare R2 or S3 + signed URLs | Skill package archives (your IP), versioned bundles, delta updates |
| **Update notifications** | WebSocket or SSE via Cloudflare Durable Objects | Push "new version available" to connected apps in real-time |
| **Admin dashboard** | Simple web app (Next.js on Vercel) | Team admins manage seats, policies, and view usage -- accessed via browser, not the desktop app |
| **Your skill dev pipeline** | GitHub repo (private) + CI/CD | You author skills in a private repo, CI tests them, CD pushes to distribution |

---

## 8. Security Model

### Threat Model

| Threat | Mitigation |
|---|---|
| **Malicious skill reads/exfiltrates user files** | Skills run through Claude Code's sandbox. App adds an additional UI-level consent layer showing exactly which paths a skill requests. |
| **Skill phones home with user data** | Claude Code's network sandbox restricts outbound connections. App displays network permissions before install. |
| **Supply chain attack via compromised skill** | Skills are code-reviewed before inclusion in your curated marketplace. Signature verification on skill packages. |
| **Your cloud service is compromised** | Your servers never receive user files or model responses. Attacker gains access to skill metadata and anonymized usage stats only. |
| **Man-in-the-middle on skill download** | HTTPS + package integrity hashes. Skill packages are signed. |
| **API key exposure** | Keys stored in OS keychain (macOS Keychain, Windows Credential Manager). Never written to disk in plaintext. Never transmitted to your servers. |
| **Analyst installs unapproved skill** | Team policy enforcement: IT admin defines approved skill list, app blocks installation of unapproved skills. |

### Data Flow Classification

| Data Type | Where It Lives | Touches Your Servers? |
|---|---|---|
| User's files (PDFs, Excel, etc.) | User's filesystem only | **No** |
| Claude API requests/responses | User's machine <-> Anthropic | **No** |
| API keys / credentials | OS keychain on user's machine | **No** |
| Skill source code | User's machine (downloaded from git/npm) | **No** (you host metadata, not code) |
| Skill execution logs | Local SQLite on user's machine | **No** |
| Skill metadata (name, desc, tags) | Your cloud database | Yes |
| License/entitlement status | Your cloud database | Yes |
| Usage telemetry (skill name + count) | Your analytics service | Yes (anonymized) |
| Team policies (approved skills) | Your cloud database | Yes |

### What Still Creates Liability for You

**Be honest about these. The managed-library model reduces some risks but creates others:**

1. **You own every skill.** This is both your moat and your liability. Unlike a marketplace where you could claim "we just host it," every skill is yours. If a skill misbehaves, there's no third party to blame. The upside: you control quality end-to-end. The downside: you're fully accountable. This is manageable -- just be rigorous about testing.

2. **Skill output accuracy.** This is your biggest liability. Skills that extract financial data, build models, or generate IC decks will be used to make investment decisions. If a skill extracts "$142.3M" when the PDF says "$142.3K," and someone makes a deal decision based on that, you have exposure. **Mitigations:** Every skill must include confidence scores and source citations. Output must include a prominent disclaimer. Your ToS must explicitly disclaim liability for output accuracy. Consider E&O (Errors & Omissions) insurance -- budget $2-5K/year for a startup policy.

3. **Update pipeline as attack vector.** You push skill updates to every subscriber's machine. If your signing key is compromised, an attacker can push malicious skill code to all your customers. This is a real supply chain risk. **Mitigations:** HSM or hardware-backed signing keys. CI/CD pipeline with mandatory review before publishing. Code-sign every skill package. Consider a 24-hour staged rollout (push to 10% first, then 100%).

4. **Telemetry liability.** Even "anonymized" usage telemetry can be subpoenaed. If you log that "user X ran M&A Due Diligence Analyzer on 2026-03-15," you've created a record that user X was working on an M&A deal on that date. Finance firms will flag this during procurement. **Recommendation: telemetry is fully opt-in and local-only by default.** If you want aggregate usage data to improve skills, have it be anonymized and aggregated on-device before any data leaves the machine.

5. **Team policy sync.** If you sync team policies from your cloud to user machines, you're a processor of organizational configuration data. Enterprise customers may require a DPA (Data Processing Agreement). This is standard and not a blocker, but budget for legal review.

6. **Claude Code platform dependency.** If Anthropic changes Claude Code's skill format, CLI interface, or pricing in a way that breaks your app, your customers are impacted immediately. You own the customer relationship but not the runtime. **Mitigation:** abstraction layer, version pinning, and staying close to Anthropic's developer relations.

---

## 9. Permissions Model

### Three-Layer Permission System

```
Layer 1: Skill Manifest Declarations (what the skill SAYS it needs)
    |
    v
Layer 2: SkillKit App Consent (what the USER approves in the GUI)
    |
    v
Layer 3: Claude Code Runtime Permissions (what the SYSTEM enforces)
```

### Layer 1: Skill Manifest Declarations

Every skill declares its required permissions in `skillkit.json`:

```json
{
  "permissions": {
    "fileRead": ["*.pdf", "*.xlsx", "*.pptx"],
    "fileWrite": ["~/Documents/SkillKit Output/**"],
    "network": ["none"],
    "tools": ["Read", "Edit", "Write", "Bash(python3 *)"],
    "maxTokenBudget": 100000
  }
}
```

### Layer 2: SkillKit App Consent

Before first execution, the app shows a permission consent screen:

```
+----------------------------------------------------+
|  "PDF Financial Analyzer" wants to:                |
|                                                    |
|  [x] Read PDF files you select                     |
|  [x] Write output to ~/Documents/SkillKit Output/  |
|  [ ] Access the internet (not requested)           |
|  [x] Use up to ~100K tokens per run (~$0.30)       |
|                                                    |
|  [See full permission details]                     |
|                                                    |
|  [Deny]                    [Allow for this run]    |
|                            [Always allow]          |
+----------------------------------------------------+
```

### Layer 3: Claude Code Runtime Enforcement

The app configures Claude Code's `settings.json` to enforce the declared permissions:

```json
{
  "permissions": {
    "allow": ["Read(*.pdf)", "Write(~/Documents/SkillKit Output/**)"],
    "deny": ["Bash(curl *)", "Bash(wget *)", "WebFetch(*)"]
  }
}
```

### Team Policy Override

IT admins can define team policies that restrict the permission superset:

```json
{
  "teamPolicy": {
    "maxPermissions": {
      "fileRead": ["~/Documents/**", "~/Desktop/**"],
      "fileWrite": ["~/Documents/SkillKit Output/**"],
      "network": ["none"],
      "maxTokenBudget": 500000
    },
    "blockedSkills": ["*:unreviewed"],
    "approvedSkills": ["skillkit-official:*", "firm-internal:*"]
  }
}
```

---

## 10. Skill Package Specification

### Directory Structure

A SkillKit-enhanced Claude Code plugin:

```
my-skill/
  .claude-plugin/
    plugin.json              # Standard Claude Code plugin manifest
  skills/
    my-skill/
      SKILL.md               # Claude Code skill definition (the actual instructions)
  skillkit.json              # SkillKit GUI metadata (your addition)
  README.md                  # Displayed in the skill browser
  icon.png                   # 256x256 skill icon
  screenshots/               # Gallery images for the skill browser
    01-input.png
    02-output.png
```

### skillkit.json: The GUI Layer

This is the file your app adds on top of standard Claude Code plugins. It defines how the skill appears and behaves in the GUI:

```json
{
  "$schema": "https://skillkit.dev/schema/v1/skillkit.json",
  "version": "1.0.0",
  "display": {
    "name": "PDF Financial Analyzer",
    "tagline": "Extract key metrics and build comparison tables from financial PDFs",
    "icon": "icon.png",
    "screenshots": ["screenshots/01-input.png", "screenshots/02-output.png"],
    "category": "Finance",
    "tags": ["pdf", "financial-analysis", "due-diligence", "pe"]
  },
  "inputs": {
    "schema": {
      "type": "object",
      "properties": {
        "files": {
          "type": "array",
          "items": { "type": "file", "accept": [".pdf"] },
          "title": "Financial Documents",
          "description": "Upload one or more financial PDFs (10-Ks, pitch decks, CIMs)",
          "minItems": 1,
          "maxItems": 10,
          "ui": "file-drop-zone"
        },
        "metrics": {
          "type": "array",
          "items": { "type": "string" },
          "title": "Metrics to Extract",
          "description": "Which financial metrics to look for",
          "default": ["Revenue", "EBITDA", "Net Income", "Total Debt", "Cash"],
          "ui": "tag-input"
        },
        "outputFormat": {
          "type": "string",
          "enum": ["table", "excel", "json"],
          "title": "Output Format",
          "default": "table",
          "ui": "radio-group"
        }
      },
      "required": ["files"]
    }
  },
  "outputs": {
    "primary": {
      "type": "table",
      "exportFormats": ["xlsx", "csv", "clipboard"]
    },
    "secondary": {
      "type": "markdown",
      "label": "Analysis Notes"
    }
  },
  "permissions": {
    "fileRead": ["*.pdf"],
    "fileWrite": ["~/Documents/SkillKit Output/**"],
    "network": ["none"],
    "tools": ["Read", "Write", "Bash(python3 *)"],
    "maxTokenBudget": 100000
  },
  "pricing": {
    "tier": "pro",
    "estimatedCostPerRun": "$0.15-0.50 (Claude API, paid by user)"
  },
  "requirements": {
    "claudeCode": ">=2.0.0",
    "os": ["macos", "windows"],
    "dependencies": ["python3"]
  }
}
```

### Relationship to SKILL.md

The `SKILL.md` file contains the actual Claude Code instructions. The `skillkit.json` wraps it with GUI metadata. At execution time:

1. The GUI reads `skillkit.json` to render the input form
2. User fills in the form
3. The app serializes form data into arguments
4. The app invokes the skill via Claude Code: `claude --skill my-skill --args '{"files":["/path/to/doc.pdf"],"metrics":["Revenue","EBITDA"]}'`
5. Claude Code reads `SKILL.md` and executes with the provided arguments
6. The app reads the output and formats it per `outputs` in `skillkit.json`

---

## 11. Local vs Cloud Responsibilities

| Responsibility | Local (User's Machine) | Cloud (Your Servers) |
|---|---|---|
| **Model inference** | User's Claude API key -> Anthropic | -- |
| **File access** | Direct filesystem access via Claude Code | -- |
| **Skill execution** | Claude Code runtime + sandbox | -- |
| **Permission enforcement** | Claude Code permission engine + app consent layer | -- |
| **Execution logs** | Local SQLite database | -- |
| **API key storage** | OS keychain | -- |
| **Skill library browsing** | Cached library manifest + UI | Library manifest API (your skill catalog) |
| **Skill package download** | Downloaded and installed locally | Served from CDN (signed packages, your IP) |
| **Live skill updates** | App receives update notification, downloads delta, applies | Update push service (you trigger when you ship a new version) |
| **License validation** | App checks entitlement on launch + periodic recheck | License API (seat count, plan tier, expiration) |
| **Team policy** | Enforced locally | Team admin dashboard (web) where admin configures policies |
| **Usage telemetry** | Collected locally, optionally sent | Analytics ingestion (opt-in, anonymized -- see liability section) |
| **App updates** | Auto-updater (Tauri built-in) | Update server (signed binaries) |
| **Skill authoring** | -- | You author skills in your private repo. Users never author skills. |

### Edge Cases

**Offline mode:** The app should work fully offline for installed skills. Skill discovery, license validation, and team policy sync require connectivity but should degrade gracefully (cached state, grace period for license checks).

**License enforcement without phoning home:** Cache the license validation result locally with a signed, time-limited token (e.g., valid for 7 days). The app works offline for up to 7 days before requiring a connectivity check. This avoids constant phone-home but prevents indefinite use of a revoked license.

---

## 12. Local File and Config Structure

```
~/Library/Application Support/SkillKit/          # macOS
%APPDATA%/SkillKit/                              # Windows

  config.toml                  # App configuration
  license.dat                  # Signed license token (cached)

  skills/                      # Installed skills
    pdf-financial-analyzer/
      .claude-plugin/
        plugin.json
      skills/
        pdf-financial-analyzer/
          SKILL.md
      skillkit.json
      icon.png
      ...
    excel-model-builder/
      ...

  db/
    skillkit.db                # SQLite: execution logs, preferences, cached metadata

  logs/
    app.log                    # App-level logs (not skill execution content)

  cache/
    registry/                  # Cached skill registry metadata
    thumbnails/                # Cached skill icons and screenshots

  team/
    policy.json                # Cached team policy (synced from cloud)
    members.json               # Cached team member list (for admin UI)
```

### Integration with Claude Code

The app writes to Claude Code's config locations to register installed skills:

```
~/.claude/
  skills/
    skillkit-pdf-financial-analyzer -> ~/Library/Application Support/SkillKit/skills/pdf-financial-analyzer/skills/pdf-financial-analyzer/
    skillkit-excel-model-builder -> ...
  settings.json                # App may add permission rules scoped to skillkit-* skills
```

Skills are symlinked (not copied) into Claude Code's skill directory so they appear as native Claude Code skills. Namespaced with `skillkit-` prefix to avoid conflicts.

---

## 13. Sample Skill Schema

### Full Example: `skillkit.json` for a PowerPoint Generator Skill

```yaml
# Shown in YAML for readability; actual file is JSON
$schema: "https://skillkit.dev/schema/v1/skillkit.json"
version: "1.2.0"

display:
  name: "Deal Deck Builder"
  tagline: "Generate investment committee decks from deal data"
  icon: "icon.png"
  screenshots:
    - "screenshots/input-form.png"
    - "screenshots/output-deck.png"
    - "screenshots/customization.png"
  category: "Finance"
  tags:
    - powerpoint
    - investment-committee
    - pe
    - deal-memo

inputs:
  schema:
    type: object
    properties:
      companyData:
        type: file
        accept: [".xlsx", ".csv"]
        title: "Company Financials"
        description: "Excel file with historical financials"
        ui: file-picker
      cim:
        type: file
        accept: [".pdf"]
        title: "CIM / Teaser (optional)"
        description: "Confidential Information Memorandum"
        ui: file-picker
        required: false
      dealType:
        type: string
        enum: ["LBO", "Growth Equity", "Add-on", "Recap"]
        title: "Deal Type"
        ui: select
      sections:
        type: array
        items:
          type: string
          enum:
            - "Executive Summary"
            - "Company Overview"
            - "Market Analysis"
            - "Financial Summary"
            - "Deal Structure"
            - "Returns Analysis"
            - "Key Risks"
            - "Appendix"
        title: "Sections to Include"
        default:
          - "Executive Summary"
          - "Company Overview"
          - "Financial Summary"
          - "Deal Structure"
          - "Returns Analysis"
          - "Key Risks"
        ui: checkbox-group
      template:
        type: string
        enum: ["standard", "minimalist", "detailed"]
        title: "Deck Template"
        default: "standard"
        ui: radio-group
    required: ["companyData", "dealType"]

outputs:
  primary:
    type: file
    format: pptx
    label: "Investment Committee Deck"
    saveTo: "~/Documents/SkillKit Output/"
  secondary:
    type: markdown
    label: "Generation Notes"

permissions:
  fileRead: ["*.xlsx", "*.csv", "*.pdf"]
  fileWrite: ["~/Documents/SkillKit Output/**"]
  network: ["none"]
  tools:
    - "Read"
    - "Write"
    - "Bash(python3 *)"
  maxTokenBudget: 200000

requirements:
  claudeCode: ">=2.0.0"
  os: ["macos", "windows"]
  dependencies:
    - "python3"
    - "python-pptx"  # pip package
```

---

## 14. Example Skills: PE/Finance Vertical

### Skill 1: PDF Financial Extractor

**What it does:** Reads one or more financial PDFs (10-Ks, CIMs, pitch decks, audited financials) and extracts structured financial data into a normalized table.

**Inputs:**
- 1-10 PDF files (drag-and-drop)
- Metrics to extract (tag input, defaults: Revenue, EBITDA, Net Income, Total Debt, Cash, Gross Margin, Capex)
- Time periods to look for (e.g., "FY2020-FY2025" or "auto-detect")
- Output format: table view, Excel export, or JSON

**What Claude does under the hood:**
- Reads each PDF using Claude Code's `Read` tool
- Identifies financial statements, tables, and narratives
- Extracts the requested metrics, normalizes units (millions vs thousands vs raw), and aligns time periods
- Flags confidence levels (high/medium/low) for each extracted value
- Outputs a structured table with source page references

**Output:**
```
| Metric       | FY2022    | FY2023    | FY2024    | Source       | Confidence |
|--------------|-----------|-----------|-----------|--------------|------------|
| Revenue      | $142.3M   | $168.7M   | $201.4M   | 10-K p.47    | High       |
| EBITDA       | $28.5M    | $35.2M    | $43.8M    | 10-K p.52    | High       |
| Net Income   | $12.1M    | $18.3M    | $24.6M    | 10-K p.48    | High       |
| Total Debt   | $95.0M    | $87.5M    | $72.3M    | 10-K p.61    | Medium     |
| Cash         | $31.2M    | $28.7M    | $45.1M    | 10-K p.58    | High       |
```

**Why this is valuable:** An analyst currently spends 2-4 hours manually pulling these numbers from PDFs and cross-referencing. This skill does it in minutes with source citations.

**SKILL.md (abbreviated):**

```markdown
---
name: pdf-financial-extractor
description: Extract structured financial metrics from PDF documents
allowed-tools: Read, Write, Bash(python3 *)
---

You are a financial data extraction specialist. The user will provide financial
PDF documents and a list of metrics to extract.

## Instructions

1. Read each provided PDF file using the Read tool.
2. Identify all financial statements, tables, and key metrics in the documents.
3. Extract the requested metrics for all available time periods.
4. Normalize all values to consistent units (default: millions USD).
5. For each extracted value, note:
   - The source document and page number
   - Your confidence level (High: clearly stated; Medium: calculated/inferred; Low: estimated)
6. Output a structured table with columns: Metric, [Time Periods], Source, Confidence.
7. After the table, add brief notes on any discrepancies or assumptions.

## Input Arguments
- `$1` = Comma-separated file paths
- `$2` = Comma-separated metrics to extract (default: Revenue,EBITDA,Net Income,Total Debt,Cash)
- `$3` = Output format: table|excel|json (default: table)

If output format is "excel", write an .xlsx file to the output directory using python-pptx.
```

---

### Skill 2: Excel Model Auditor

**What it does:** Reads an Excel financial model (.xlsx) and produces a comprehensive audit report identifying errors, circular references, inconsistencies, hardcoded values in formula rows, broken links, and structural issues.

**Inputs:**
- 1 Excel file (.xlsx or .xlsm)
- Audit depth: Quick scan, Standard, Deep
- Focus areas (optional): Formulas, Assumptions, Outputs, Sensitivity tables, Debt schedule, DCF

**What Claude does under the hood:**
- Uses `python3` with `openpyxl` to parse the workbook structure
- Maps all formulas, named ranges, and cross-sheet references
- Identifies: hardcoded values in formula rows, inconsistent formulas across rows/columns, circular references, #REF/#VALUE/#N-A errors, unused named ranges, unprotected assumption cells, sign convention inconsistencies
- Flags severity (Critical / Warning / Info) for each finding
- Generates a summary with a "model health score"

**Output:**
```
## Model Audit Report: "Project Atlas LBO Model.xlsx"

**Model Health Score: 72/100**

### Critical Issues (3)
1. **Circular reference** in 'Debt Schedule'!D14 -> 'Cash Flow'!E22 -> 'Debt Schedule'!D14
   - Impact: Debt repayment calculation depends on cash flow which depends on interest which depends on debt balance
   - Fix: Break circularity by using prior-period debt balance for interest calculation

2. **Hardcoded value in formula row** in 'Revenue Build'!F8
   - Cell contains `45000` but adjacent cells (D8:E8, G8:J8) use formula `=D7*D6`
   - Likely: analyst overwrote the formula with a manual number during a sensitivity check

3. **Inconsistent formula** in 'Returns'!C15
   - Formula: `=C14/C3` but all other cells in row 15 use `=XX14/XX2` (referencing row 2, not row 3)
   - Likely: copy-paste error shifted the reference

### Warnings (7)
...

### Info (12)
...
```

**Why this is valuable:** Model auditing is a tedious, high-stakes task. Senior associates spend hours reviewing junior analysts' models. This skill catches the mechanical errors instantly, letting the senior person focus on business logic and assumptions.

---

### Skill 3: Deal Deck Builder (PowerPoint)

**What it does:** Takes structured deal data (from Excel or manual input) and generates a formatted investment committee PowerPoint deck with standard PE sections.

**Inputs:**
- Company financials (Excel file or manually entered key metrics)
- CIM/teaser PDF (optional, for company description and market context)
- Deal type: LBO / Growth Equity / Add-on / Recap
- Sections to include (checklist)
- Deck template: Standard / Minimalist / Detailed

**What Claude does under the hood:**
- Reads the Excel file to extract key financials
- If a CIM is provided, reads it to extract company description, market overview, and competitive landscape
- Uses `python-pptx` to generate a formatted PowerPoint deck
- Each section gets 1-3 slides with appropriate content:
  - **Executive Summary:** Deal overview, key metrics, investment highlights, preliminary valuation range
  - **Company Overview:** Description, history, products/services, management team
  - **Financial Summary:** Revenue/EBITDA/margin trends (chart), key ratios, working capital analysis
  - **Deal Structure:** Sources & uses table, pro forma capitalization, key terms
  - **Returns Analysis:** IRR/MOIC sensitivity table across entry/exit multiples and hold periods
  - **Key Risks:** Top 5-7 risks with mitigation factors

**Output:** A `.pptx` file saved to the output directory, plus a markdown summary of what was generated.

**Why this is valuable:** Analysts spend 4-8 hours building IC decks from scratch. Even with templates, populating data, formatting charts, and writing narratives is time-consuming. This skill produces a solid first draft in minutes that the analyst can then refine.

---

## 15. MVP Scope

### What's In (MVP v0.1)

| Feature | Detail |
|---|---|
| **Skill browser** | List view of installed + available skills. Search and filter by category/tag. |
| **Skill detail page** | Description, screenshots, permissions, estimated cost per run, install button. |
| **One-click install** | Download skill, symlink into Claude Code, verify dependencies. |
| **Skill runner** | Dynamic form UI generated from `skillkit.json` input schema. File drag-and-drop. |
| **Output display** | Render skill output as formatted markdown, tables, or file download links. |
| **Permission consent** | Pre-execution permission screen showing exactly what the skill will access. |
| **Execution log** | Local log of skill runs (skill name, timestamp, duration, token usage, success/fail). |
| **Claude Code connection** | Setup wizard: verify Claude Code is installed, API key is configured, test connectivity. |
| **3 bundled skills** | The three finance skills above, pre-installed and ready to use. |
| **macOS only** | Ship macOS first. Windows in v0.2. |
| **Free tier** | 3 bundled skills free. No license server needed for MVP. |

### What's Out (MVP)

| Feature | Deferred To |
|---|---|
| Windows support | v0.2 |
| Team management / policy sync | v0.3 |
| Marketplace (community skills) | v0.4 |
| Skill authoring tools | v0.5 |
| License server / paid tiers | v0.2 (but design the architecture now) |
| Usage analytics dashboard | v0.3 |
| Auto-updates | v0.2 (manual download for MVP) |
| Offline mode | v0.2 |

### MVP Success Criteria

1. A non-technical user can install the app, connect their Claude account, and run a skill in under 5 minutes
2. The three bundled finance skills produce output that a PE analyst would describe as "useful first draft" (not "garbage I have to redo")
3. At no point does user data leave their machine (verifiable by network inspection)
4. The app adds less than 100 MB to disk and less than 100 MB to RAM while idle

---

## 16. Roadmap

### Phase 1: MVP -- Prove the Skill Quality (Months 1-2)

The goal is not a polished app. The goal is proving that 3 skills are good enough that finance professionals say "I would pay for this."

- [ ] Tauri app scaffold with React frontend (minimal chrome -- skill list + runner + output)
- [ ] Claude Code integration layer (process spawning, output streaming)
- [ ] Dynamic form renderer from `skillkit.json` schema
- [ ] Output renderer (markdown, tables, file download links)
- [ ] Permission consent UI
- [ ] Local SQLite execution logging
- [ ] Build and rigorously test 3 finance skills (PDF Extractor, Excel Auditor, Deal Deck Builder)
- [ ] macOS build, sign, and notarize pipeline
- [ ] Hardcoded skill library (no update server -- skills ship bundled with the app)
- [ ] **Ship to 10-20 beta users at target PE firms. Collect feedback obsessively.**

### Phase 2: Live Updates + Monetization (Months 3-4)

The goal is the update pipeline and the paywall. This is where it becomes a real SaaS.

- [ ] Skill distribution service (R2/S3 + signed packages + version manifests)
- [ ] Live update pipeline: app checks for skill updates on launch + periodic polling
- [ ] "What's New" feed in the app showing recently updated/added skills
- [ ] License server (Clerk or custom) with Starter/Pro tier enforcement
- [ ] Stripe integration for Pro subscriptions
- [ ] App auto-updater (Tauri built-in)
- [ ] Build 5 additional finance skills based on beta feedback
- [ ] Offline mode (cached license token, cached skills work without connectivity)
- [ ] **Public launch. Start charging Pro tier.**

### Phase 3: Teams (Months 5-7)

The goal is expansion revenue from teams. One analyst converts their VP, VP buys seats.

- [ ] Team admin web dashboard (Next.js -- seat management, usage stats, skill visibility)
- [ ] Team license management (add/remove seats, billing)
- [ ] Policy sync (admin controls which skills are visible, permission defaults)
- [ ] Usage analytics dashboard (which skills, how often, by which team members)
- [ ] SSO integration (SAML/OIDC for enterprise procurement)
- [ ] Windows support
- [ ] 5 more skills (total library: ~15)
- [ ] **Start enterprise sales conversations. First Team tier customers.**

### Phase 4: Enterprise + Custom Skills (Months 8-12)

The goal is enterprise contracts and custom skill development as a revenue stream.

- [ ] Custom skill development workflow (customer requests -> you build -> push to their team only)
- [ ] Private skills (skills visible only to a specific team, not the whole library)
- [ ] SOC 2 Type I preparation and audit
- [ ] Skill versioning with rollback (admin can pin a team to a specific skill version)
- [ ] Advanced audit logging (export execution logs for compliance)
- [ ] 10+ more skills, including skills suggested by enterprise customers
- [ ] **First Enterprise tier contracts. $50K+ ARR from single accounts.**

### Phase 5: Scale (Year 2+)

- [ ] Skill chaining (output of skill A feeds into skill B -- e.g., PDF Extract -> Model Audit -> Deck Build)
- [ ] Vertical expansion: legal, consulting, accounting (same model, new skill libraries)
- [ ] Consider opening a curated third-party skill author program (invite-only, revenue share)
- [ ] Scheduled/recurring skill runs
- [ ] Multi-model support as hedge against Claude dependency
- [ ] Enterprise on-prem update server option
- [ ] Potential acquisition target for Anthropic, Bloomberg, S&P, or fintech platforms

---

## 17. Pricing and Monetization

### Recommended Model: Managed Skill Library SaaS

You are NOT selling a platform, a marketplace, or API access. You are selling **ongoing access to your continuously improving skill library** and **the expertise behind it**. This is the Bloomberg Terminal model applied to AI skills: the product is the content + the delivery mechanism, priced as a subscription.

### Pricing Tiers

| Tier | Price | Includes |
|---|---|---|
| **Starter** | $0 | App + 3 demo skills with limited functionality (e.g., PDF Extractor processes max 2 pages, Excel Auditor flags top 3 issues only). Enough to prove value, not enough to replace manual work. |
| **Pro** | $49/user/month | Full skill library (all current + all future skills). Unlimited runs. All skill updates as they ship. Email support. Local execution logs. |
| **Team** | $79/user/month (min 5 seats) | Everything in Pro + web-based admin dashboard + team usage analytics + skill visibility policies + priority support + SSO. |
| **Enterprise** | Custom ($150-250/seat/month) | Everything in Team + custom skill development for your firm's specific workflows + dedicated Slack channel + SLA + SOC 2 report + on-prem update server option. |

### Why This Pricing Works

1. **$49/month is invisible** for a PE analyst whose loaded cost is $75-150/hour. If the tool saves 3 hours/month, it's 50-100x ROI. Finance firms do not optimize for $49/month/seat.
2. **"All current + all future skills" is the hook.** Subscribers know that every time you ship a new skill, they get it automatically. This creates anticipation and ongoing perceived value -- same psychology as Netflix adding new content.
3. **Free tier is a teaser, not a product.** The capped demo skills let prospects experience the quality of your work, but they can't actually use them for real work. This is intentional. You don't want a large free user base -- you want fast conversion.
4. **Team tier is where the money is.** One analyst adopts Pro individually, shows results to their VP, VP buys 8 Team seats. The admin dashboard and usage analytics are what the VP needs to justify the spend.
5. **Enterprise tier funds custom skill development.** A large PE firm paying $150/seat/month for 30 seats ($54K/year) can also request "build us a skill that formats output in our IC memo template." This is high-margin services revenue that also improves your library for everyone.

### The Pricing Moat

Each skill you build increases the value of the subscription without increasing the price. Subscriber #1 gets 3 skills. Subscriber #100 (six months later) gets 20 skills for the same price. But subscriber #1 also got those 17 new skills for free. This creates:
- **Increasing switching cost** (the library grows, the value of leaving grows)
- **Improving unit economics** (your cost to serve a subscriber doesn't increase as you add skills)
- **Natural expansion revenue** (as the library grows, you can justify price increases or higher-tier features)

### Alternative Models Considered

| Model | Verdict |
|---|---|
| **Per-skill purchase** | Rejected. Fragments the library, creates decision fatigue, doesn't fund ongoing improvement. |
| **Revenue share on API costs** | Rejected. Violates the "you never touch my data" premise. Also complex to implement. |
| **Usage-based (per run)** | Rejected. Creates anxiety about running skills. Knowledge workers hate metered pricing. |
| **One-time purchase** | Rejected for primary model. Doesn't fund ongoing skill development. Could offer a "lifetime" tier later as a cash-flow lever. |
| **Open marketplace with rev share** | Rejected for now. You're the skill author. Opening a marketplace dilutes quality control and your moat. Revisit in Year 2+ if you want to grow beyond what you can author yourself. |

### Revenue Projections (Conservative)

| Metric | Month 6 | Month 12 | Month 18 |
|---|---|---|---|
| Starter (free) users | 200 | 500 | 1,000 |
| Pro subscribers | 30 | 100 | 250 |
| Team seats | 0 | 40 | 150 |
| Enterprise seats | 0 | 0 | 30 |
| Skills in library | 8 | 18 | 30 |
| MRR | $1,470 | $8,160 | $28,500 |
| ARR | $17,640 | $97,920 | $342,000 |

These assume organic growth + LinkedIn content + direct outreach to boutique PE firms. No paid acquisition. The Team and Enterprise tiers are lumpy (one deal = 5-30 seats) so actual trajectory will be step-function, not linear.

### Custom Skill Development as a Revenue Stream

Enterprise customers will ask: "Can you build a skill that does X for our specific workflow?" This is high-margin services revenue ($5K-25K per custom skill) that also:
- Funds R&D on skills that can be generalized into the library
- Creates deep customer relationships (switching cost)
- Gives you direct insight into what finance professionals actually need

Budget ~20% of your time for custom skill work in Year 1. It's the best product research you can do.

---

## 18. Major Risks

### Risk 1: Anthropic Builds a GUI for Skills

**Likelihood:** High (for a generic GUI). Low (for a finance-vertical product).
**Impact:** Medium-High

Anthropic will almost certainly add a better GUI to Claude Desktop for running skills/plugins. They already have Desktop Extensions. But they will build horizontal, not vertical. They won't build "PE Due Diligence Analyzer" or maintain 30 finance-specific skills.

**Mitigation:**
- Your moat is the skills themselves, not the app. If Anthropic ships a better skill runner GUI, you can distribute your skills through their GUI too. You'd lose the app revenue but keep the skill library subscription.
- Go deep on finance. The more specialized your skills, the harder they are to replicate with a generic tool.
- Build switching costs: enterprise contracts, custom skills tied to a firm's workflow, team policies configured in your dashboard.
- Position as "the skill library for finance teams" not "a GUI for Claude Code."
- Engage Anthropic's partnerships team. They may want to promote you as a vertical showcase.

### Risk 2: Claude Code API/CLI Interface Changes

**Likelihood:** Medium
**Impact:** High

Your app depends on Claude Code's CLI interface, skill format, and config file structure. If Anthropic changes these without notice, your app breaks.

**Mitigation:**
- Pin to specific Claude Code versions with tested compatibility
- Build an abstraction layer between your app and Claude Code's interface
- Maintain a relationship with Anthropic's developer relations team
- Monitor Claude Code's changelog and GitHub for breaking changes
- Consider joining the Claude Code plugin ecosystem officially to get early notice of changes

### Risk 3: Skills Produce Inaccurate Financial Output

**Likelihood:** High
**Impact:** High (reputational + legal)

LLMs hallucinate. A skill that extracts "$142.3M revenue" when the PDF says "$142.3K" could lead to bad investment decisions.

**Mitigation:**
- Every financial skill must include confidence scores and source citations
- Output should include a prominent disclaimer: "AI-generated. Verify all figures against source documents."
- Skills should be designed to extract and cite, not to analyze or recommend
- Build a QA process: test each financial skill against a corpus of known documents with verified answers
- Terms of Service must explicitly disclaim liability for output accuracy
- Consider E&O (Errors & Omissions) insurance

### Risk 4: Security Incident

**Likelihood:** Low-Medium
**Impact:** Very High

A malicious skill, a compromised update, or a data leak would be catastrophic for a product selling to finance firms.

**Mitigation:**
- Code-sign every release and every skill package
- Implement skill review process before inclusion in curated packs
- Security audit before public launch (at minimum, a penetration test of the cloud services)
- Bug bounty program after launch
- Transparent security architecture documentation (finance firms will ask for it)

### Risk 5: Low Adoption / Hard to Reach Users

**Likelihood:** Medium
**Impact:** High

PE analysts are not browsing Product Hunt. They're behind corporate firewalls, using firm-issued laptops with restricted software installation.

**Mitigation:**
- Target boutique and mid-market firms first (less IT bureaucracy than megafunds)
- Content marketing on finance-specific channels (LinkedIn, finance podcasts, CFA/CAIA communities)
- Demo-tier removes the "let me ask IT" barrier for initial testing
- Build case studies early with beta users showing hours saved and ROI
- Consider a "portable" version that doesn't require admin install
- **Your best channel is probably direct outreach + warm intros**, not inbound marketing. 10 design partners from your network is worth more than 1,000 website visitors.

### Risk 6: You Can't Build Skills Fast Enough

**Likelihood:** Medium
**Impact:** Medium

You're the sole skill author. Subscribers expect a growing library. If you're spending all your time on app development, support, and sales, the skill library stagnates and churn increases.

**Mitigation:**
- Skills are markdown + prompt engineering. They're fast to author once you have the patterns down. Budget 40% of your time for skill development.
- Enterprise custom skill work funds and informs library expansion.
- In Year 2, consider an invite-only skill author program where vetted finance professionals contribute skills for revenue share.
- Prioritize skill quality over quantity. 15 excellent skills beat 50 mediocre ones.

### Risk 6: Claude Code Requires Paid Subscription You Can't Bundle

**Likelihood:** Medium
**Impact:** Medium

If Claude Code changes its pricing model or requires a separate paid subscription that your users don't have, your TAM shrinks.

**Mitigation:**
- Current assumption: users have a Claude Pro/Team/Enterprise subscription that includes Claude Code access
- Monitor Anthropic's pricing announcements
- Design the architecture so you could theoretically support other model backends in the future (not MVP, but keep the option open)

---

## 19. Open Questions

### Product

1. **Should the app be a standalone app or a Claude Desktop extension?** Claude Desktop supports MCP Desktop Extensions. Building as an extension might get you distribution through Claude Desktop's install base, but limits your UI freedom and makes it harder to control the update pipeline. Recommendation: standalone app for now, but design skills to be compatible with Claude Desktop extensions as a future distribution channel.

2. **Should you support non-Claude models?** If a user has an OpenAI or Gemini API key instead, should the skills work with those? This dramatically increases engineering scope but also increases TAM. **Recommendation: No for MVP. Claude-only simplifies everything. Revisit only if Claude dependency becomes a real risk.**

3. **How do you handle skills that need external dependencies?** The Deal Deck Builder needs `python-pptx`. Options: (a) bundle a Python runtime with the app (~50 MB), (b) require the user to install Python (friction), (c) use a lightweight containerized runtime (complexity), (d) use `uv` for zero-config Python dependency management (promising). **This needs a prototype to determine the right approach.**

4. **Should skills be able to persist state between runs?** E.g., a "Deal Tracker" skill that remembers all the deals you've analyzed. This creates data management complexity but could be very valuable for workflows like "compare this quarter's financials to last quarter's extraction."

### Technical

5. **What is the best interface to programmatically drive Claude Code?** Options: CLI with `--print` flag, SDK mode (if available), stdio pipe to interactive session. Need to test reliability of each.

6. **How do you handle long-running skills?** A skill that processes 10 large PDFs might take 5-10 minutes. Need robust progress indication, cancellation, and timeout handling.

7. **How do you version skills and handle breaking changes?** If a skill update changes its output format, existing user workflows may break.

8. **Can you reliably detect Claude Code's installed version and configuration?** You need to verify the user has Claude Code installed, what version, and that their API key is valid -- all without touching their API key.

### Business

9. **Do you need a EULA or ToS review by a lawyer before distributing to finance firms?** Almost certainly yes. Budget $3-5K for this. Key clauses: output accuracy disclaimer, limitation of liability, data handling commitments, IP ownership of skill output.

10. **Do you need E&O insurance?** If your skills produce financial analysis that someone relies on, you may have professional liability exposure. Consult with an insurance broker. Budget $2-5K/year for a startup E&O policy.

11. **How do you handle firms that want to run the update server on-prem?** This is a common enterprise request in finance. It's expensive to support but may be required for $100K+ deals. **Recommendation: defer to Phase 4. For now, the update server is your cloud, and skills are cached locally. The app works offline with cached skills. This should satisfy most security reviews.**

12. **What's the IP status of custom skills?** When you build a custom skill for an Enterprise customer, who owns it? **Recommendation: you retain IP on the skill logic/prompts, they own any firm-specific templates or configurations embedded in the skill. Define this clearly in the Enterprise agreement.**

13. **Should you engage Anthropic's partnerships team before building?** Yes, do this in Month 1. Getting their non-objection (or better, endorsement) dramatically reduces your biggest risk. They may want to promote you as a vertical showcase for the plugin ecosystem. At minimum, you want to know if they plan to build a competing product in the next 12 months.

14. **What happens if a firm's Claude subscription lapses or changes?** Your app depends on the user having Claude Code access. If Anthropic changes pricing or a firm drops their Claude subscription, your app becomes useless. **You need a clear communication in onboarding: "SkillKit requires an active Claude Pro/Team/Enterprise subscription."**

---

## Appendix A: Competitive Landscape

| Competitor | What They Do | How You Differ |
|---|---|---|
| **Claude Code CLI** | The runtime you build on | You add GUI, managed skill library, and team management. Complementary, not competitive. |
| **Anthropic Plugin Marketplace** | Horizontal plugin discovery (9K+ plugins) | They're a platform. You're a product. They host anyone's plugins. You ship your own, continuously improved skills for a specific vertical. |
| **Smithery / MCP registries** | MCP server discovery | Tool-level, developer-focused. You're workflow-level, analyst-focused. |
| **Dust.tt** | AI workflow builder for teams | Cloud-hosted, processes customer data. You're local-first. They're horizontal, you're vertical. |
| **Custom GPTs (OpenAI)** | Similar concept, different ecosystem | Cloud-only, no local processing, limited to OpenAI. You're Claude-native, local-first, and finance-specialized. |
| **Internal firm tools** | Custom-built by firm's tech team | You're faster to deploy, cheaper, continuously improving, and don't require the firm to hire AI engineers. |
| **Indie prompt libraries** | Collections of prompts sold as PDFs/Notion docs | No execution layer, no GUI, no updates. You're an executable product, not a document. |
| **Big 4 / consulting AI tools** | Deloitte, McKinsey building internal AI workflows | Not available to buy. Your product gives mid-market firms the same capabilities without Big 4 fees. |

## Appendix B: Decision Log

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| Business model | Managed skill library SaaS (you author all skills) | Open marketplace, platform for third-party authors | Stronger moat via domain expertise, full quality control, simpler to start, avoids marketplace liability |
| Desktop framework | Tauri v2 | Electron, Flutter Desktop, Swift (native) | Security narrative, binary size, Rust backend for process management |
| Skill format | Claude Code plugin + skillkit.json overlay | Custom format, VS Code extension format | Compatibility with existing ecosystem, no lock-in, skills work in both your app and CLI |
| Distribution | Your own app with live push updates | Claude Code marketplace, npm, direct download | Controlled delivery channel, update pipeline is a key differentiator, SaaS metrics |
| Data architecture | Local-first, no customer data on your servers | Cloud-processed, hybrid | Core security requirement, liability minimization, finance firm procurement requirement |
| Monetization | Library subscription ($49-250/seat/month) | Per-skill, usage-based, one-time purchase | Predictable revenue, funds ongoing skill development, increasing value over time |
| Initial vertical | PE / Finance | Legal, consulting, healthcare | Highest willingness to pay, clearest pain points, author's domain expertise |
| Platform | macOS first | Cross-platform from day 1 | Finance professionals overwhelmingly use macOS at boutique/mid-market firms. Faster to ship one platform. |

## Appendix C: Your Skill Development Pipeline

Since you are the skill author, you need a development workflow:

```
1. Identify workflow   -- Talk to analysts, watch them work, find the 2-4 hour manual task
2. Prototype skill     -- Write SKILL.md + skillkit.json locally, test with real documents
3. QA with real data   -- Run against a corpus of real financial documents (anonymized)
                          Verify extracted values against known answers
                          Test edge cases (scanned PDFs, non-standard formats, multi-currency)
4. Write tests         -- Automated regression tests for each skill (input doc -> expected output)
5. Push to staging     -- Deploy to your internal test instance of the update server
6. Beta test           -- Push to 2-3 trusted users, collect feedback
7. Ship                -- Push to all subscribers via the live update pipeline
8. Monitor + iterate   -- Track execution success/failure rates, user feedback, common errors
```

**Skill authoring tools you'll want:**
- A private GitHub repo with one directory per skill
- CI that runs skill regression tests on every push
- A staging environment where you can test the full flow (app -> skill -> output)
- A feedback mechanism in the app ("Was this output helpful? Y/N + comment")

**Estimated time per skill:**
- Simple extraction skill (PDF -> table): 1-2 days
- Complex workflow skill (multi-file -> formatted output): 3-5 days
- Custom enterprise skill (firm-specific templates): 2-5 days + client iteration
