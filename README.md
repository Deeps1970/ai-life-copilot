<div align="center">

# 🧬 AI Life Copilot

### Your intelligent lifestyle analytics & AI wellness coach

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![VAPI](https://img.shields.io/badge/VAPI-Voice_AI-8B5CF6?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmExMCAxMCAwIDEgMCAwIDIwIDEwIDEwIDAgMCAwIDAtMjBaIiBmaWxsPSIjOEI1Q0Y2Ii8+PC9zdmc+)](https://vapi.ai)

<br />

<img src="https://img.shields.io/badge/status-active-success" alt="Status" />
<img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />

---

**AI Life Copilot** tracks your daily habits — sleep, hydration, exercise, screen time, diet, and transport — then generates personalized **Health**, **Productivity**, and **Sustainability** scores with AI-powered coaching via text chat and voice.

</div>

---

## ✨ Features

| Feature                           | Description                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| 📊 **Smart Scoring Engine**       | Three composite scores (0–100) calculated from 7 lifestyle inputs using weighted algorithms |
| 🤖 **AI Chat Coach**              | Real-time streaming chat powered by Google Gemini 3 Flash — personalized to your data       |
| 💬 **Chat Threads**               | Multiple conversation threads with sidebar navigation, auto-titling, and thread management  |
| 🎙️ **Voice AI Coach**             | Talk to your coach hands-free via [VAPI](https://vapi.ai) voice agent integration           |
| 📈 **Visual Analytics**           | Interactive Recharts dashboards — health trends, steps vs screen time, sleep quality        |
| 🎯 **Actionable Recommendations** | AI-generated lifestyle tips ranked by impact level                                          |
| 🌙 **Dark Glassmorphic UI**       | Stunning frosted glass design with purple/cyan gradients and glow effects                   |
| 📱 **Fully Responsive**           | Mobile-first bottom nav + desktop floating dock navigation                                  |
| ⚡ **Blazing Fast**               | Vite + React SWC — instant HMR, sub-second builds                                           |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│                                                          │
│   Landing ── LifestyleInput ── Dashboard ── ChatCoach    │
│                                    │            │   │    │
│                              ScoreEngine    Stream  VAPI │
│                              (weighted      SSE    Voice │
│                               algo)         ↓      Agent│
├──────────────────────────────────────────────────────────┤
│           Supabase Edge Functions (Deno)                 │
│           └── ai-coach (streaming proxy)                 │
├──────────────────────────────────────────────────────────┤
│   Lovable AI Gateway ──► Google Gemini 3 Flash           │
│   VAPI Cloud ──► Voice AI Agent                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **bun**
- A [Supabase](https://supabase.com) project (for the AI coach edge function)
- _(Optional)_ A [VAPI](https://vapi.ai) account for voice agent

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ai-life-copilot.git
cd ai-life-copilot
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key

# Optional — enables the voice coach button
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
```

### 3. Deploy the Edge Function

```bash
supabase functions deploy ai-coach
```

Make sure `LOVABLE_API_KEY` is set in your Supabase project secrets.

### 4. Run

```bash
npm run dev
```

Open **http://localhost:5173** and start tracking your lifestyle.

---

## 🎙️ Voice AI Coach (VAPI)

The AI Coach page includes a **voice agent** powered by [VAPI](https://vapi.ai). When configured, a microphone button appears in the chat header.

**How it works:**

1. Tap the 🎤 mic icon in the AI Coach header
2. A full-screen voice overlay opens with real-time audio visualization
3. Speak naturally — the VAPI voice agent responds as your wellness coach
4. Voice transcripts are added to the chat history
5. Mute/unmute and end the call with on-screen controls

**Setup:**

1. Create a VAPI account at [vapi.ai](https://vapi.ai)
2. Create or configure an assistant
3. Copy your **Public Key** from the VAPI dashboard
4. Set `VITE_VAPI_PUBLIC_KEY` in your `.env` file
5. The mic button will appear automatically

> Without the VAPI key, the app works normally with text-only chat.

---

## 📊 Scoring Algorithm

Each score is calculated from weighted lifestyle inputs:

### Health Score (0–100)

| Input        | Weight | Target   |
| ------------ | ------ | -------- |
| Sleep        | 25%    | 8 hours  |
| Water Intake | 25%    | 3 liters |
| Steps        | 25%    | 10,000   |
| Meals        | 5–25%  | Healthy  |
| Exercise     | 10%    | 60 min   |

### Productivity Score (0–100)

| Input       | Weight | Target               |
| ----------- | ------ | -------------------- |
| Screen Time | 35%    | Low (penalizes >12h) |
| Sleep       | 35%    | 8 hours              |
| Exercise    | 15%    | 60 min               |
| Meals       | 3–15%  | Healthy              |

### Sustainability Score (0–100)

| Input       | Weight | Target      |
| ----------- | ------ | ----------- |
| Transport   | 40%    | Walk / Bike |
| Meals       | 5–30%  | Healthy     |
| Water       | 15%    | Efficient   |
| Screen Time | 15%    | Low         |

---

## 🛠️ Tech Stack

| Layer             | Technology                                 |
| ----------------- | ------------------------------------------ |
| **Framework**     | React 18 + TypeScript                      |
| **Build**         | Vite 5 + SWC                               |
| **Styling**       | Tailwind CSS 3 + custom glassmorphic theme |
| **Components**    | Shadcn UI (Radix primitives)               |
| **Animations**    | Framer Motion                              |
| **Charts**        | Recharts                                   |
| **Forms**         | React Hook Form + Zod                      |
| **Data Fetching** | TanStack React Query                       |
| **Backend**       | Supabase (Auth, DB, Edge Functions)        |
| **AI Model**      | Google Gemini 3 Flash via Lovable Gateway  |
| **Voice AI**      | VAPI Web SDK                               |
| **Testing**       | Vitest + Testing Library                   |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Landing.tsx          # Hero landing page
│   ├── LifestyleInput.tsx   # Daily data entry (7 sliders)
│   ├── Dashboard.tsx        # Scores, charts, recommendations
│   ├── ChatCoach.tsx        # AI chat + voice agent
│   └── Profile.tsx          # User settings
├── components/
│   ├── BottomNav.tsx        # Responsive nav (mobile bar + desktop dock)
│   ├── ChatThreadSidebar.tsx # Thread list sidebar with CRUD
│   ├── CircularProgress.tsx # Animated SVG score rings
│   ├── FloatingIcons.tsx    # Landing page animations
│   ├── VoiceOverlay.tsx     # VAPI voice call UI
│   └── ui/                  # Shadcn UI components
├── hooks/
│   ├── use-vapi.ts          # VAPI voice agent hook
│   ├── useChatThreads.ts    # Multi-thread chat state management
│   ├── use-mobile.tsx       # Responsive breakpoint hook
│   └── use-toast.ts         # Toast notifications
├── lib/
│   ├── store.ts             # localStorage state management
│   └── utils.ts             # Utility functions (cn)
├── utils/
│   └── scoreEngine.ts       # Health/Productivity/Sustainability scoring
└── integrations/
    └── supabase/
        ├── client.ts        # Supabase client init
        └── types.ts         # Database types

supabase/
└── functions/
    └── ai-coach/
        └── index.ts         # Streaming AI coach edge function
```

---

## 📜 Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Production build         |
| `npm run preview`    | Preview production build |
| `npm run lint`       | Lint with ESLint         |
| `npm run test`       | Run tests (Vitest)       |
| `npm run test:watch` | Run tests in watch mode  |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with 💜 by AI Life Copilot team**

_Track smarter. Live better._

</div>
