# FactoryOS

**Interactive 3D Manufacturing Digital Twin**

FactoryOS is a portfolio-grade manufacturing cell simulator that connects an interactive 3D factory to live equipment telemetry, production events, quality inspection, fault diagnostics, and event-derived KPIs. It is designed to demonstrate practical experience across manufacturing engineering, automation, troubleshooting, data systems, and modern web development.

[![License: MIT](https://img.shields.io/badge/License-MIT-5eb7e8.svg)](LICENSE)
[![CI](https://github.com/Jerry-Padilla/FactoryOS/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerry-Padilla/FactoryOS/actions/workflows/ci.yml)
[![Live on Vercel](https://img.shields.io/badge/Live_on_Vercel-FactoryOS-ffffff?logo=vercel&labelColor=000000)](https://factoryos-three.vercel.app)

[Launch the live FactoryOS simulator](https://factoryos-three.vercel.app)

![FactoryOS live 3D manufacturing cell](public/screenshots/factory-overview.png)

## Features

- Procedural low-poly factory with two CNC machines, conveyor, robot, CMM, material racks, and reject handling
- Traceable workpieces moving through a capacity-constrained production process
- Live spindle, robot, and inspection telemetry with smooth signal changes
- Machine selection, start/stop controls, status lights, and floating labels
- Five evidence-based CNC and robot fault scenarios
- Guided diagnostic questions and repair workflows
- Automatic fault modes plus a manual random-fault control
- Availability, performance, quality, OEE, throughput, scrap, utilization, and cycle-time calculations
- Live Recharts analytics and a bounded manufacturing event stream
- Desktop and touch orbit controls
- Desktop WASD/pointer-lock and mobile joystick Explore Modes
- Skippable system startup and cancellable guided demo
- Opt-in synthesized Web Audio machine ambience and alarm cues
- Responsive operator UI with mobile bottom sheets
- Graceful dashboard fallback when WebGL is unavailable

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- React Three Fiber, Three.js, and Drei
- Zustand
- Recharts
- Tailwind CSS
- Lucide React
- Vitest and Testing Library

## Architecture

```text
React Three Fiber scene
          ↓
Discrete-time simulation engine
          ↓
Typed Zustand operational state
          ↓
Telemetry + fault + production engines
          ↓
Event-derived KPI engine
          ↓
React operator panels + Recharts dashboard
```

All manufacturing behavior runs client-side. The presentation layer does not create independent telemetry or KPI values; both the factory view and dashboard consume the same simulation state.

The simulation uses a single bounded clock. It supports pause and accelerated time without stacking browser timers. Station capacity checks hold completed work when downstream equipment is unavailable, allowing faults to create visible work-in-process and KPI consequences.

## Production Flow

```text
Raw material → CNC-01 → CNC-02 → Conveyor → ROBOT-01 → CMM-01
                                                            ├─ Pass → Finished goods
                                                            └─ Fail → Reject bin
```

Nominal cycles are 8 seconds for CNC-01, 7 seconds for CNC-02, 3 seconds for conveyor travel, 3 seconds for robot transfer, and 5 seconds for inspection. Normal output targets a 97–99% first-pass yield; abnormal machine temperatures and active faults increase quality risk.

## Local Development

### Prerequisites

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm 10 or newer

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verification

```bash
npm test
npm run lint
npm run build
npm start
```

## Controls

### Orbit mode

- Left drag / one-finger drag: orbit
- Scroll / pinch: zoom
- Right drag: pan
- Click / tap equipment: inspect

### Explore mode

- `W`, `A`, `S`, `D`: move
- Mouse: look
- `E`: interact with centered equipment
- `Esc`: exit
- Mobile: virtual joystick, drag-to-look, and Interact button

Audio is off by default and starts only after the operator enables it.

## Vercel Deployment

No database, backend, environment variables, paid APIs, or external model assets are required.

The production deployment is available at [factoryos-three.vercel.app](https://factoryos-three.vercel.app).

1. Push the project to a Git repository.
2. Import the repository in Vercel.
3. Keep Framework Preset set to **Next.js**.
4. Keep Build Command set to `npm run build`.
5. Deploy.

The application is statically prerendered and the simulation starts in the browser.

## Project Structure

```text
app/                         App Router entry point and global styles
components/factory/          Procedural 3D equipment, parts, and controls
components/ui/               HUD, dashboard, panels, navigation, and project views
lib/simulation/              Production, telemetry, fault, KPI, and positioning logic
store/useFactoryStore.ts     Central operational state and actions
types/factory.ts             Domain model and public simulation interfaces
public/models/               Reserved for optional optimized local models
public/textures/             Reserved for optional optimized local textures
```

## Configuration

The public repository URL is exported as `GITHUB_URL` in `lib/constants.ts` and is used by the in-app navigation.

## Contributing and Security

Contributions are welcome under the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md). Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

Do not report vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md) and use GitHub private vulnerability reporting.

FactoryOS processes only synthetic in-browser simulation data. See [PRIVACY.md](PRIVACY.md) for details and [NOTICE.md](NOTICE.md) for the industrial-use and safety disclaimer.

Automatic fault windows:

- Off: disabled
- Low: 4–6 simulated minutes
- Normal: 2–4 simulated minutes
- High: 45–90 simulated seconds

## Future Improvements

- Persist optional scenario snapshots in local storage
- Add energy consumption and maintenance cost models
- Add configurable product routings and takt-time scenarios
- Import lightweight GLTF equipment variants
- Add operator training scores and scenario completion history
- Add automated browser-level visual regression tests

## License

FactoryOS is available under the [MIT License](LICENSE). Third-party packages remain subject to their respective licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
