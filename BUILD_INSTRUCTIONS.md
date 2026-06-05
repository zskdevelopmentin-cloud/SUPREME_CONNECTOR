# Supreme Connector Build & Packaging Instructions

This guide provides the instructions needed to install dependencies, run Supreme Connector in Electron development mode, and package it into a Windows Executable (`.exe`).

## Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your computer.

---

## 1. Installation

First, navigate to the web project directory and install all the web and Electron dependencies:

```bash
cd supreme-connector-web
npm install
```

---

## 2. Running in Development (Next.js + Electron)

To run the Next.js development server and Electron shell concurrently:

```bash
npm run electron-dev
```

This command will:
1. Start the Next.js development server at `http://localhost:3000`.
2. Wait for the server to become available.
3. Open the Electron desktop window loading the admin dashboard.

*Note: Since Electron runs with `webSecurity: false`, you will be able to test and run sync against TallyPrime on `http://localhost:9000` without CORS or Mixed Content errors.*

---

## 3. Packaging into Windows EXE

To build the project and package it into a standalone Windows installer (`.exe`):

1. **Build Next.js Production Assets:**
   ```bash
   npm run build
   ```

2. **Run Electron Builder:**
   ```bash
   npm run electron-pack
   ```

Once the packager finishes, you will find the generated standalone installer inside the directory:
- `supreme-connector-web/dist/Supreme Connector Setup 0.1.0.exe` (or similar depending on platform configuration)

You can copy this installer to any other Windows computer, install it, and use it to connect with a locally running TallyPrime client.
