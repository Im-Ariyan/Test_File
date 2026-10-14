# Almighty AI

Smarter Campus. Greener Tomorrow.

Interactive smart-campus hackathon MVP, styled from the supplied monochrome visual reference. Built with TanStack Start, React, TypeScript, Tailwind v4, shadcn controls, Lucide and Recharts.

## Run

```sh
bun install
bun run dev
bun run test
```

No paid APIs, credentials or database are required. The first page is the campus overview.

## Demo workflows

- Water leakage: creates linked maintenance and community records at Main Academic Block.
- Energy anomaly: creates a Science Block record with observed value, baseline and explanation.
- Suspicious login pattern: adds an explainable simulated security event.
- Maintenance workflow: advances a request one step at a time: Reported → Under Review → Assigned → In Progress → Resolved. Student demo role cannot advance statuses.
- Submit reports with optional images, review possible duplicates, add notes and export data.
- Campus markers open building details; map filters follow the shared open incidents.
- Assistant answers supported questions using actual shared demo records and deterministic rules.
- What-if sliders estimate daily resource and carbon savings.

## Data and calculations

Seed records and buildings are in `src/lib/campus/data.ts`. Weekly energy readings total 129.1 MWh; their baseline totals 146.8 MWh. Daily building readings are an independent sample day, not the weekly chart aggregate.

Anomaly = (observed − baseline) / baseline × 100; flag above 15%. Invalid zero baselines are not flagged. Complaint keywords classify category and priority, with explanations; image content is not analyzed. Duplicate suggestions match at least two words of four or more characters in the same building; nothing is silently discarded.

Score = round(100 − 20 × weekly energy / weekly baseline), clamped conceptually to the performance sample; this is an illustrative energy score, not a certified sustainability measure. Carbon uses configurable kg CO₂e/kWh (default 0.4). What-if estimates use the selected daily sample building readings.

## Persistence and limitations

The brief explicitly allows a local demo fallback. Records are saved under `almighty-demo-v1` in this browser's local storage. Data is not shared across devices or users. Images are limited to 2 MB JPEG/PNG/WebP. Reset removes submitted reports and history after confirmation. Export downloads JSON. Demo role and notification preference are session-only.

No real authentication, authorization, sensors, equipment control, emergency guidance, AI provider, email/SMS/push delivery or offensive scanning is connected. Alex Morgan is a fictional operator. Role switching illustrates workflows, not a security boundary. Event history is local demonstration history, not tamper-proof auditing. The map is a fictional architectural model, not surveyed geography. Charts are sample measurements and do not fabricate new sensor readings when an incident is added.

## Production extension

Before adding sign-in, decide whether user profiles are needed. Enable Lovable Cloud for shared persistence and real identity. Use owner-scoped access policies, server-side authorization, validated mutations, immutable audits, and schema migrations containing literal seeds. No production database schema is installed in this MVP.

For optional AI, add a server-only adapter through TanStack server functions using Lovable AI Gateway, never expose private keys to browser code, and retain the deterministic rules as fallback. Ground responses in permitted records and label uncertainty. No optional integration is currently active.
