# Research: Game Hub & Session Foundation

## Technology Choices

### Frontend Framework
- **Decision**: Angular
- **Rationale**: Angular provides a robust, opinionated structure suitable for scalable enterprise platforms. Its component-based architecture aligns perfectly with Principle IV (Reusable & Composable Architecture) and allows for strict typing and modularity.
- **Alternatives considered**: React, Vue (rejected in favor of the user-mandated Angular stack).

### Styling & Visual Identity
- **Decision**: Tailwind CSS
- **Rationale**: Tailwind allows rapid implementation of the Neobrutalist visual identity (Principle VII) through custom utility tokens (bold outlines, flat fills, strong shadows). It avoids the overhead of writing custom CSS for every component while keeping styles scoped and maintainable.
- **Alternatives considered**: Vanilla CSS, SCSS (rejected as Tailwind provides faster iteration for utility-driven design systems).

### Backend Framework & Architecture
- **Decision**: .NET 9 (C#) using Clean Architecture
- **Rationale**: .NET is highly performant and strongly typed. Clean Architecture enforces Principle VIII (Maintainability & Pragmatic Engineering) by decoupling the core domain logic (session management) from infrastructure and presentation concerns. This allows the platform to scale and adapt over time.
- **Alternatives considered**: Node.js, Go, standard N-tier .NET architecture.

### Storage & Persistence
- **Decision**: Supabase (PostgreSQL)
- **Rationale**: Supabase provides a scalable PostgreSQL database out of the box, with real-time capabilities that are essential for room-based multiplayer state synchronization (Principle III).
- **Alternatives considered**: SQL Server, MongoDB.

### Real-time Communication
- **Decision**: Supabase Realtime / SignalR (to be determined based on specific backend integration, but Supabase Realtime is preferred for direct DB syncs if applicable, or SignalR for .NET hosted hubs).
- **Rationale**: Room-based multiplayer requires low-latency event broadcasting.
- **Alternatives considered**: WebSockets, Server-Sent Events.

## Constitution Alignment
- **Principle II & V (Extensibility & Content Separation)**: The game registry will be designed as a declarative metadata system, allowing games to register without tight coupling to the .NET backend.
- **Principle VII (Neobrutalism)**: Tailwind configuration will explicitly define neobrutalist tokens (e.g., `border-width: 4px`, `box-shadow: 4px 4px 0px #000`).
