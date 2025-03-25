# Rich Text Editor with TipTap

## Overview
This project is a React-based rich text editor built using *TipTap*, featuring a custom variable insertion system. Users can trigger a popover by typing {{ to insert predefined variables, similar to email marketing and document automation platforms.

## Features
- *Rich Text Formatting* (Bold, Italic, Headings, Lists, etc.)
- *Custom Variable System* (Trigger Popover with {{)
- *Variable Tokens* (Styled distinctly in the document)
- *Popover Interface* (Select variables from a UI popup)
- *Built with React, TipTap, and Tailwind CSS*

## Installation

Ensure you have *Node.js (v18+)* installed. Then, run:

sh
# Clone the repository
git clone <your-repo-url>
cd frontend

# Install dependencies
npm install


## Usage

Start the development server:

sh
npm run dev 


Build the project for production:

sh
npm run build 


Run ESLint to check for linting issues:

sh
npm run lint 


Preview the production build:

sh
npm run preview 


## Tech Stack
- *React 19* – Core UI library
- *TipTap* – Rich text editor framework
- *Radix UI* – Popover UI component
- *Tailwind CSS* – Styling
- *ESLint* – Linting
- *Vite* – Fast build tool
- *TypeScript* – Strongly typed JavaScript

## Dependencies
### Core Dependencies
- @tiptap/react: Rich text editor framework
- @tiptap/starter-kit: Essential extensions for TipTap
- @radix-ui/react-popover: Popover UI component
- tailwind-merge: Utility for merging Tailwind classes
- lucide-react: Icon set for UI components

### Development Dependencies
- vite: Modern build tool
- eslint: Linter for code quality
- typescript: Type safety for JavaScript
