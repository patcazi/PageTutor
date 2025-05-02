# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript type-checking)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Code Style & Conventions
- **TypeScript**: Use strict typing; avoid `any` types
- **Imports**: Group imports by: React, third-party libraries, local components, styles
- **Formatting**: Consistent indentation (2 spaces); semi-colons required
- **Error Handling**: Use try/catch for async operations; explicit error logs
- **Component Structure**: Functional components with React.FC typing
- **State Management**: Use React hooks (useState, useEffect, useRef) appropriately
- **PDF Handling**: Use react-pdf with proper worker configuration
- **Naming**: PascalCase for components; camelCase for variables/functions
- **Comments**: Document complex logic and component purposes; avoid obvious comments
- **Effect Management**: Cleanup listeners/observers in useEffect return functions