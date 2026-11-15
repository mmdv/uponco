# Uponco MCP — directory submission checklist

How to list the Uponco connector in the Claude Connectors Directory and the
ChatGPT directory. Checked against both programs' published requirements on
2026-11-15; re-read them before submitting, they change.

- Claude: <https://claude.com/docs/connectors/building/submission> — portal <https://claude.ai/directory/manage> → Submit new → MCP connector
- ChatGPT: <https://developers.openai.com/apps-sdk/app-submission-guidelines> — submitted as a plugin from the OpenAI Platform dashboard

## 1. Technical requirements (in the code)

- [x] Remote server over HTTPS: `https://uponco.com/mcp`
- [x] OAuth 2.0 with PKCE and dynamic client registration (Passport, `/.well-known/oauth-*`)
- [x] Every tool has a `title` and explicit `readOnlyHint`, `destructiveHint` and `openWorldHint` (checked by `ConnectTest`)
- [x] Tool names are specific verbs; descriptions state side effects (customer emails, what is not cancelled)
- [x] Each tool works on its own; no tool tells the model to use another app
- [x] Responses carry only what the tool needs (no request ids or log metadata)
- [x] No restricted data collected (no card data, health data, government ids, passwords)
- [x] Logo in `serverInfo.icons` (`public/icons/icon-512.png`, `public/favicon.svg`)
- [x] All tools listed on one `tools/list` page
- [x] Rate limit (120/min per user) and an audit log of changes
- [ ] Every tool tried by hand from Claude as a custom connector (the Claude portal asks you to confirm this)
- [ ] Every tool tried from ChatGPT developer mode, on desktop and mobile

## 2. Things only you can do

- [ ] **Privacy policy covers AI assistants.** `/privacy` exists but says nothing about connecting Claude or ChatGPT. Add a section (draft in §5) and have it checked — both directories reject missing or vague policies.
- [ ] **Public documentation page** for the connector: what it does, how to connect, example prompts, how to disconnect. The Claude portal needs a documentation URL. (Could be a page on uponco.com — ask Claude Code to build it.)
- [ ] **Support contact**: an email or page that is answered.
- [ ] **Demo account for ChatGPT review**: email + password (not Google sign-in), email verified, no 2FA, business onboarded, with sample services, specialists, working hours, customers and a few past and upcoming appointments. Give it to OpenAI in the submission form; give it to Anthropic only by email if a reviewer asks (never in the Claude portal).
- [ ] **Verify your identity / business** in the OpenAI Platform dashboard (general settings) before submitting there.
- [ ] **Claude account**: any paid Claude plan can submit.
- [ ] **Icon file** for the listings: `public/icons/icon-512.png` (512×512 PNG).

## 3. Claude portal answers

| Step | What to enter |
| --- | --- |
| Connection | `https://uponco.com/mcp` (one URL for everyone) |
| Tools | Synced from the server — 7 read, 11 write |
| Listing | Name, one-liner, description and categories from §4; documentation URL; `https://uponco.com/privacy`; support contact; icon; slug `uponco` (permanent) |
| Use cases | Users need an Uponco account with a set-up business. Reads and writes data. |
| Company | Uponco, `https://uponco.com`, your contact |
| Authentication | Required; OAuth with dynamic client registration (no client id/secret to enter) |
| Data handling | Own API; no health data; no sponsored content |
| Test & launch | Confirm every tool was run from Claude |
| Compliance | Read and accept the seven acknowledgments |

## 4. Listing text (drafts)

**Name:** Uponco

**One-liner (≤200):** Check your appointments, find free times, book clients and manage working hours in Uponco, the appointment booking app for service businesses.

**Description (≤2,000):**

> Uponco is appointment booking software for salons, studios, clinics and other service businesses. Connect it to see and run your schedule by chatting.
>
> - See your day or week: who is coming, when, for which service, and where the gaps are.
> - Find free times for any service and specialist, using your real working hours and bookings.
> - Book, reschedule and cancel appointments. Customers get the same confirmation and cancellation emails as when you book in Uponco.
> - Set working hours and days off. Existing bookings are never cancelled automatically — you are told which ones need attention.
> - Look up and add customers, mark no-shows, and (owners and admins) add or edit services.
>
> The assistant acts as you, inside your current business, with exactly the permissions you have in Uponco: team members only see and change their own appointments. It asks before changing anything. You can disconnect it at any time under Settings → Integrations in Uponco.
>
> Requires an Uponco account.

**Categories:** Productivity; Business / Scheduling (pick the closest the portal offers).

**Example prompts:**

- "What's on my calendar tomorrow?"
- "When is anyone free for a haircut on Friday afternoon?"
- "Book Aysel for a manicure next Tuesday at 3pm."
- "I'm off on Monday — block the day and tell me which bookings need moving."
- "Plan my week."

Rules to keep: no "MCP" or "plugin" in the name; no pricing, trials or comparisons in the text (ChatGPT rejects them).

## 5. Privacy policy section (draft — have it reviewed)

> **AI assistants (Claude, ChatGPT and similar)**
>
> You can connect an AI assistant to your Uponco account under Settings → Integrations. When you do, you sign in to Uponco and approve the connection; the assistant receives an access token, never your password.
>
> While connected, the assistant can read and change the data you can see and change in your current business in Uponco — appointments, customers' names and contact details, services, locations and working hours — but only when you ask it to in a conversation. What the assistant does with that data is governed by its provider's terms and privacy policy (for example Anthropic for Claude, OpenAI for ChatGPT).
>
> Uponco keeps a record of changes made through an assistant (which tool, when, by which user, and which appointment or record) for security and support, for the same period as our other application logs. We do not store your conversations with the assistant.
>
> You can disconnect an assistant at any time under Settings → Integrations; its access stops immediately. Expired and revoked access tokens are deleted regularly.
