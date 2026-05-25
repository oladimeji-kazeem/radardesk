# RadarDesk: Collaborative Operational Editorial & Newsroom Workspace

**RadarDesk** is a enterprise-grade, full-stack collaborative workspace platform designed for modern editorial offices, newsrooms, and publishing houses. It orchestrates the entire content lifecycle—from initial topic proposal and writer claiming, through multi-layered manual and AI-assisted quality screening, up to final page-layout proofing and formal publication.

---

## 🎯 Platform Problems Solved

Traditional editorial operations suffer from fragmented toolchains, blind handoffs, and feedback loops that degrade content velocity and editorial consistency. RadarDesk solves these issues directly within a single operational frame:

1. **The “Black Hole” Draft Syndrome**  
   * **Problem:** Writers submit articles, after which they enter a passive black box with no real-time status visibility.  
   * **Solution:** Real-time visual queue highlights instantly distinguish article stages (**Submitted**, **Minor Revision**, **Escalated**, and **Under Review**) utilizing immediate side-border warnings inside the editorial desks.

2. **Editorial Bottlenecks & Strict Quality Gating**  
   * **Problem:** Editors waste human capacity proofreading low-quality, unverified, or poorly formatted drafts.  
   * **Solution:** Integrated automated pre-validations score grammar, readability, and source credentials before the draft hits the human review pools. Critical threshold control allows administrators to change strict AI gate limits instantly.

3. **Untracked Final Approvals & Compliance Gaps**  
   * **Problem:** Decentralized emails and chat logs make audit tracking for printed, scheduled, or compliance-bound stories impossible to run.  
   * **Solution:** An immutable **Published History Archive** stores chronological logs that map published titles to author attributions, final timestamps, and the specific Senior Editor key signature.

4. **Siloed Performance Analytics**  
   * **Problem:** Operations teams struggle to capture macro KPIs like writer throughput indexes, frequent rejection patterns, or turnaround SLAs.  
   * **Solution:** An **Operations Analytics Sandbox** provides an on-demand metrics dashboard with real-time live matrix synchronization and an active, downloadable CSV exporter.

---

## 🚀 Key Platform Benefits

* **Accelerated Content Velocity:** Automated status queues and claim timers ensure that hot-topic drafts are assigned, escalated, or revised immediately without manual delegation lag.
* **Elevated Content Standards:** Continuous AI scoring guarantees that every article meets basic readability indices, minimizing back-and-forth revision loops between editors and authors.
* **Granular Governance & Auditing:** The platform supports robust privilege tiering across Writers, Editors, Senior Editors, QA Specialists, Publishers, and Administrators.
* **High-Fidelity Layout Ready:** Integrated design testing directly within the Publisher's Desk lets team leaders preview exact article text against simulated desktop layouts before releasing content.

---

## 🛠️ Modular System Architecture & Workflows

### 1. Topic Pool & Claim Dynamics
* **Propose or Claim:** Writers can draft open creative briefs compiled in the global pools.
* **Strict Expirations:** Proposed claims feature automatic operational timers, prompting writers to execute drafts swiftly, or the topic returns to the unassigned general queue.

### 2. Multi-Role Editorial Pipeline
* **Duty Editorial Desk:** Editors screen papers utilizing live review tools.
* **Left-Margin Border Cues:**
  * 🟡 **Amber Border:** Minor revisions required (interactive comments and feedback loop enabled).
  * 🔵 **Sky Blue Border:** Freshly submitted, awaiting immediate screening.
  * 🟣 **Purple Border:** Escalated to Senior Editor for executive override.
* **Quality Checker Desk:** Approved articles are routed to QA specialists who score precise proofreading performance indexes (grammar, style, factual accuracy) before signing off.

### 3. High-Fidelity Publisher Workspace
* **Simulated Release:** Publishers select certified drafts to build mock responsive layouts.
* **Final Release:** Direct compilation into the outer RadarDesk reader feed with real-time updates.

### 4. Enterprise Administrative Governance
* **Published History Archive:** Tracking of all active publications, original author attributions, exact dates, and approving executive signatures.
* **Active Security & Configurations:** Fine-tune privileges, edit workflow thresholds, inspect diagnostic terminals, or trigger general database purges.
* **Analytics Sandbox with CSV Export:** Live monitoring of relative writer throughput matrices, rejection reason counts, and instant CSV generation for offline reporting.

---

## ⚙️ Tech Stack & Local Setup

RadarDesk is designed as a modular full-stack application leveraging modern frontend and backend primitives:

* **Frontend:** [React 18+](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
* **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) Custom Dev Server Routing
* **State Management:** Fully reactive custom React hook pipelines and unified JSON schemas
* **Data Visualization:** [Recharts](https://recharts.org/) and SVG-based micro-interactions

### 1. Installation
Ensure Node.js is installed, then run structural setup:
```bash
# Install required workspace packages
npm install
```

### 2. Development Runner
Launch the React application and custom Node backend simultaneously on the proxy-bound port:
```bash
npm run dev
```
*Note: The platform is configured to run at `http://0.0.0.0:3000` internally.*

### 3. Production Compilation & Build
Compile and package the Express server and React single-page static files inside the `/dist` bundle:
```bash
npm run build
```
The standard start command executes the bundled CommonJS server:
```bash
npm start
```

---

## 📂 Project Organization
```
├── server.ts              # Custom full-stack Express & development middleware proxy
├── package.json           # Workspace configurations and dependencies
├── metadata.json          # Platform frame permissions and capabilities
├── src/
│   ├── main.tsx           # Primary app mount point
│   ├── App.tsx            # Main layout controller and global coordination layers
│   ├── types.ts           # Unified TypeScript enums, models, and interface schemas
│   └── components/        # Isolated operational desktop modules
│       ├── WriterPortal.tsx        # Authors workspace & markdown drafting desk
│       ├── EditorDashboard.tsx     # Quality gating, queues, and revision controls
│       ├── QualityCheckerDesk.tsx  # QA proofreading and performance scoring
│       ├── PublisherDesk.tsx       # Live newsletter structures & simulated viewports
│       ├── AnalyticsDashboard.tsx  # Operational KPIs & CSV download controllers
│       ├── AdminPanel.tsx          # System configurations and Published History Logs
│       └── DocsAndManual.tsx       # Integrated operational training resources
```

---
*Developed under AI Studio Operational standards.*
