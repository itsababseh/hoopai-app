# 🏀 HoopAI — Premium Basketball Training App

> *Train like a pro. Built like one.*

HoopAI is a premium AI-powered basketball training app built with React Native + Expo. It rivals HomeCourt, Ladder, and Nike Training Club — positioned as the virtual personal trainer for serious ballers at $10/month.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| Animations | React Native Reanimated 3 |
| State | Zustand v5 |
| Storage | MMKV + AsyncStorage |
| Video | react-native-youtube-iframe |
| Charts | Victory Native XL |
| Fonts | Inter + Anton (expo-google-fonts) |
| Health | expo-health (iOS) + react-native-health-connect (Android) |

## Design System

```
Background:   #0A0A0F
Surface:      #131318
Accent:       #FF6B2C  (orange — all interactive elements)
Accent Blue:  #4FACFE
Success:      #00D4AA
Text Primary: #FFFFFF
```

## Features

### Phase 1 — Foundation
- ✅ Full design system (theme, components, typography)
- ✅ 7-screen onboarding flow with spring animations
- ✅ Zustand stores (user, session, health)
- ✅ Reusable UI components (Button, Card, ProgressRing, Badge, Skeleton)

### Phase 2 — Core Loop
- ✅ Today screen with AI readiness card
- ✅ Daily check-in (energy, soreness, sleep) with haptic feedback
- ✅ Readiness computation algorithm (sleep 40% + energy 35% + soreness 25% + HRV modifier)
- ✅ Train screen with programs + drill library
- ✅ Drill detail with YouTube embed + set tracker
- ✅ Progress screen with streak tracking
- ✅ Profile screen

## Readiness Algorithm

```typescript
score = (sleep × 0.40) + (energy × 0.35) + ((10 - soreness) × 0.25)
// HRV modifier: >60 bpm → ×1.1, <30 bpm → ×0.85
// Modifier: peak (>80) | normal (>65) | push_down (>45) | recovery
```

## Project Structure

```
hoopai-app/
├── app/
│   ├── _layout.tsx          # Root layout + font loading
│   ├── index.tsx            # Auth gate (onboarding vs tabs)
│   ├── onboarding/          # 7-screen onboarding flow
│   │   ├── welcome.tsx
│   │   ├── name.tsx
│   │   ├── position.tsx
│   │   ├── level.tsx
│   │   ├── goal.tsx
│   │   ├── schedule.tsx
│   │   ├── health.tsx
│   │   └── complete.tsx
│   ├── tabs/                # Main app tabs
│   │   ├── today.tsx        # Today + readiness
│   │   ├── train.tsx        # Programs + drill library
│   │   ├── progress.tsx     # Stats + history
│   │   └── profile.tsx      # User settings
│   └── drill/
│       └── [id].tsx         # Drill detail modal
├── components/
│   ├── ui/                  # Base design system components
│   └── today/               # CheckInSheet
├── constants/
│   ├── theme.ts             # Design tokens
│   ├── drills.ts            # 20 drills with real YouTube IDs
│   └── programs.ts          # 5 training programs
├── stores/                  # Zustand state
├── utils/
│   └── readiness.ts         # Core readiness algorithm
└── assets/
```

## Getting Started

```bash
npm install
npx expo start
```

## Trainers Integrated
- **Drew Hanlen** — Ball handling fundamentals
- **Steph Curry mechanics** — Shooting form
- **PGC Basketball** — Athletic development
- **Tim Grover** — Relentless conditioning
- **Alan Stein Jr.** — Elite performance habits

---

*Built to rival HomeCourt, Ladder, and Nike Training Club. Premium feel. $10/month.*
