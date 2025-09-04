# Schema Builder UI

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mloveras-projects/v0-schema-builder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/YFSX1qKDnuP)

## Overview

A powerful, user-friendly Schema Builder UI that allows non-technical users to create complex data validation schemas with an intuitive visual interface. Build schemas with infinite nesting hierarchy, comprehensive validation rules, and export them as structured JSON.

## Features

### 🏗️ Schema Management
- **Multiple Schema Support**: Create, edit, and manage multiple schemas in a clean list interface
- **Schema Naming**: Give each schema a descriptive name for easy identification
- **UUID-based IDs**: Each schema gets a globally unique identifier for reliable tracking
- **Creation Tracking**: Automatic timestamps and field counting for each schema
- **JSON Export**: View and copy all schemas together in a structured JSON format

### 🎯 Data Types & Validation
- **String Validation**: min_length, max_length, pattern (regex), required, has_symbols, has_numbers, has_uppercase, has_lowercase
- **Number Validation**: min, max, integer_only, positive_only, required
- **Boolean Validation**: required, must_be_true
- **Array Validation**: min_items, max_items, unique_items, required, plus nested item schemas with multiple fields
- **Object Validation**: required fields, plus nested property schemas

### 🔄 Infinite Nesting & Advanced Array Support
- Objects can contain arrays and other objects
- Arrays can contain objects with multiple fields and other arrays
- **Enhanced Array Items**: Array items of type "object" can have multiple properties, not just single fields
- Unlimited depth for complex data structures
- Visual tree structure with collapsible sections for easy navigation

### 🎨 User Experience
- **Intuitive Interface**: Clean, modern design with collapsible sections and dropdown navigation
- **Collapsible Fields**: Minimize complex nested structures to focus on what you need
- **Real-time Preview**: See your schema structure as you build
- **Copy to Clipboard**: Export individual schemas or all schemas as formatted JSON
- **Built-in Documentation**: Comprehensive help system explaining all features and concepts
- **Responsive Design**: Works on desktop and mobile devices

### 📚 Documentation & Help
- **Interactive Documentation**: Built-in help system accessible from any view
- **Comprehensive Guides**: Detailed explanations of schemas, data types, and validation rules
- **Best Practices**: Guidelines for building effective schemas
- **Examples**: Real-world schema examples for common use cases

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository: 
```bash
git clone https://github.com/your-username/schema-builder-ui.git
cd schema-builder-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a New Schema
1. Click "Create New Schema" on the main page
2. Enter a descriptive name for your schema
3. Click "Create" to start building

### Building Schema Structure
1. Select a data type from the dropdown (string, number, boolean, array, object)
2. Click "Add" to add the field to your schema
3. Configure validation rules by toggling and setting values
4. For objects and arrays, add nested properties using the same process

### Managing Validation Rules
- **Toggle Rules**: Enable/disable validation rules with switches
- **Configure Values**: Set specific values for rules like min_length, max, pattern
- **Nested Validation**: Objects and arrays can have their own validation plus nested schemas

### Exporting Schemas
- Use the "Copy Schema" button to copy the JSON to your clipboard
- The exported schema follows a standardized format for easy integration

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript
- **Architecture**: Modular component structure with separated concerns

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with theme provider and Suspense boundary
│   ├── page.tsx                # Main page with schema list manager
│   └── globals.css             # Global styles and Tailwind config
├── components/
│   ├── schema-list-manager.tsx # Main schema management interface
│   ├── schema-builder.tsx      # Individual schema builder component
│   ├── documentation/
│   │   └── schema-documentation.tsx  # Comprehensive help system
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── types/
│   │   └── schema.ts           # TypeScript interfaces and types
│   ├── constants/
│   │   └── validation-rules.ts # Validation rule definitions
│   └── utils/
│       └── schema-utils.ts     # Utility functions for schema operations
└── README.md
```

## Architecture Highlights

### Modular Design
- **Separated Types**: All TypeScript interfaces in dedicated files
- **Utility Functions**: Reusable functions with comprehensive JSDoc documentation
- **Constants**: Centralized validation rule definitions
- **Component Separation**: Documentation and core functionality in separate components

### Code Quality
- **TypeScript**: Full type safety with comprehensive interfaces
- **JSDoc Documentation**: Detailed function and component documentation
- **Best Practices**: Following React/Next.js conventions and patterns
- **Maintainable Structure**: Clear separation of concerns and modular architecture

## Deployment

Your project is live at:

**[https://vercel.com/mloveras-projects/v0-schema-builder](https://vercel.com/mloveras-projects/v0-schema-builder)**

## Continue Development

Build and modify this project using:

**[https://v0.app/chat/projects/YFSX1qKDnuP](https://v0.app/chat/projects/YFSX1qKDnuP)**

## Contributing

This project is automatically synced with v0.app deployments. Any changes made through the v0 interface will be automatically pushed to this repository.

## License

MIT License - feel free to use this project for your own schema building needs.
