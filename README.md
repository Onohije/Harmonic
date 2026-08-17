# Harmonic | Premium Music Catalog Web App

A visually stunning, premium single-page music catalog built using HTML5, Vanilla CSS, and Vanilla JavaScript, powered by the **iTunes Search API**. 

This application offers an immersive exploration experience with neon-cyberpunk visual styling, interactive layouts, a customized timeline-seeking audio player, and browser-persisted libraries.

---

## 🚀 Key Features

* **High-Res Search**: Fetch tracks, artists, and albums in real-time. Results are dynamically loaded, filtering for explicit content and displaying high-resolution album artwork (600x600px).
* **Live Previews**: Play 30-second audio streams using a fully responsive, custom-styled timeline player. Includes:
  * Shuffle, Next, Previous, and Loop controls.
  * Interactive progress tracking and scrubbing.
  * Audio mute and fine-grained volume sliders.
  * Mini-equalizer visualizer animation that pulses to playback state.
* **Offline Library**: Bookmark and save tracks directly to your device. Handled using client-side State and synchronized with the browser's `LocalStorage`.
* **Deep Album Insight**: Clicking any card opens a modal overlay featuring:
  * High-res layout detail grids.
  * Quick play overlays.
  * Direct links to open the item in the Apple Music Store.
  * **Interactive track list fetch**: A secondary look-up fetches and renders all other tracks belonging to the selected album, allowing users to listen to previews of items in sequence.
* **Modern Themes**: Seamless toggling between Cyber Dark mode (default) and Glass Light mode.
* **Responsive Architecture**: Fits all layout profiles (Sidebar design for desktop monitors; bottom quick-actions dock for mobile screens).

---

## 🛠️ Technology Stack

1. **HTML5**: Standard markup semantics.
2. **Vanilla CSS**: Custom design systems (themes, custom variables, grid layouts, animations, transitions).
3. **Vanilla JS**: DOM queries, audio context event mapping, LocalStorage synchronization, and public search/lookup API fetch requests.
4. **Icons**: Vector icon glyphs powered by [Boxicons](https://boxicons.com/).
5. **Fonts**: Google Fonts ('Outfit' and 'Plus Jakarta Sans').
6. **Vite**: Used for local serving, asset packaging, and fast HMR updates.

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install the development server:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm run dev
   ```

3. Open the local address provided in the terminal (usually `http://localhost:5173`) in your web browser.
