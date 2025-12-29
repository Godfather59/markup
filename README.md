# Markup Beautifier

A modern, fast web application for beautifying and formatting JSON and XML markup. Built with React, TypeScript, and CodeMirror, featuring real-time formatting, search & replace, and web worker optimization for handling large files.

## ✨ Features

- **JSON & XML Formatting** - Automatically format and beautify JSON and XML with proper indentation
- **Auto-Detection** - Automatically detects and formats content when you paste JSON or XML
- **Web Worker Optimization** - Background formatting using web workers for non-blocking performance
- **Search & Replace** - Powerful search functionality with match highlighting and navigation
- **Keyboard Shortcuts** - Quick access to common actions:
  - `Ctrl+F` / `Cmd+F` - Format/Beautify
  - `Ctrl+H` / `Cmd+H` - Toggle search
  - `Esc` - Close search
  - `Enter` / `Shift+Enter` - Navigate search matches
- **Large File Protection** - Automatically handles large files (>1MB) gracefully
- **Modern UI** - Beautiful dark theme with smooth animations
- **Real-time Syntax Highlighting** - Powered by CodeMirror with JSON and XML language support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Godfather59/markup.git
cd markup
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚢 Deployment

The project is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This will build the project and deploy it to the `gh-pages` branch.

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **CodeMirror** - Code editor component
- **Tailwind CSS 4** - Styling
- **Web Workers** - Background processing
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations

## 📝 Usage

1. **Paste or type** your JSON or XML content into the editor
2. The app will **auto-detect** the format and offer to format it
3. Click **Beautify** or press `Ctrl+F` to format manually
4. Use the **search icon** or `Ctrl+H` to open search & replace
5. Navigate matches with the arrow buttons or `Enter`/`Shift+Enter`

## 🎯 Features in Detail

### Auto-Formatting on Paste
When you paste JSON or XML content, the app automatically:
- Detects the format (JSON or XML)
- Formats it in the background using a web worker
- Updates the editor with the formatted result

### Search & Replace
- **Find** - Search for text with case-insensitive matching
- **Replace** - Replace all occurrences at once
- **Navigate** - Jump between matches with keyboard shortcuts
- **Highlight** - Visual highlighting of all matches

### Large File Handling
For files larger than 1MB, auto-formatting is disabled to prevent UI freezing. You can still manually format these files using the Beautify button.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Live Demo](https://Godfather59.github.io/markup)
- [GitHub Repository](https://github.com/Godfather59/markup)
