# Master Timetable - Personal Productivity System

A beautifully structured, fast, and responsive React + Vite application for managing your personal productivity, daily weekday schedule, evening rotation blocks, and weekend goals.

---

## 🛠️ Step-by-Step Guide to Run This Project

Follow these steps to get the project running locally on your computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine (v18 or higher recommended).

### 1. Install Dependencies
First, open your terminal, navigate to the project directory, and run the following command to install the required React and Vite packages:
```bash
npm install
```

### 2. Start the Development Server
To run the application in development mode with hot-reloading:
```bash
npm run dev
```
This will start a local server. The output in your terminal will look like this:
```
  VITE v5.4.x  ready in 150 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the interactive timetable.

### 3. Build for Production
To bundle and optimize the application for production deployment:
```bash
npm run build
```
This will compile all code and generate highly optimized static assets inside the `dist/` folder.

### 4. Preview the Production Build
To preview the optimized production build locally:
```bash
npm run preview
```
This starts a lightweight server hosting your compiled assets at **[http://localhost:4173/](http://localhost:4173/)**.

---

## 📂 Project Structure

We have properly structured the codebase to follow modern React application conventions:

```
time-table-life/
├── .gitignore              # Files and directories ignored by Git (node_modules, dist, etc.)
├── index.html              # Entrypoint HTML document with mount target and meta tags
├── package.json            # Project metadata, dependencies (React 18), and scripts
├── vite.config.js          # Configuration for the Vite bundler with React plugin
├── README.md               # Step-by-step setup and project manual (this file)
└── src/
    ├── main.jsx            # Entry point for mounting React into index.html
    └── App.jsx             # Main interactive Timetable React Component (with tabs & styles)
```
