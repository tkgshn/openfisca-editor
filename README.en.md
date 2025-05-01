# OpenFisca Editor

OpenFisca Editor is a web application for defining, editing, testing, and visualizing social welfare programs.

## Features

- Define and edit social welfare institutions
- Set up and adjust parameters
- Run simulations with 3D visualization
- Create and run test cases
- Display flowcharts of institutions (using Mermaid.js)
- Publish and share institutions
- Multilingual support (Japanese, English, French)

## Documentation

Detailed documentation is available at the following links:

- [Installation Guide](/public/docs/installation.md) - Installation and setup instructions
- [User Guide](/public/docs/user-guide.md) - Basic usage
- [OpenFisca Concepts Guide](/public/docs/openfisca-concepts.md) - Basic concepts of OpenFisca
- [OpenFisca File Creation Guide](/public/docs/openfisca-file-guide.md) - How to create OpenFisca files
- [Architecture](/public/docs/architecture.md) - Application structure
- [Component Organization Plan](/public/docs/component-reorganization.md) - Component organization policy

## Tech Stack

- **Frontend**: Next.js (React), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Data Storage**: Local storage (client-side)
- **Backend Connection**: OpenFisca API (optional)
- **Internationalization**: i18n (Japanese, English, French)
- **Visualization**: Plotly.js (simulation), Mermaid.js (flowchart)

## Getting Started

1. Set up environment variables:

Create `.env.local` file and set the following variables:

```bash
# For local development
NEXT_PUBLIC_API_URL=http://localhost:5000  # OpenFisca API URL (optional)
OPENAI_API_KEY=your_key_here               # OpenAI API key (required for AI assistant feature)
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Access in your browser:

```
http://localhost:3000
```

## Requirements

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Modern browser (latest versions of Chrome, Firefox, Safari, Edge)
- OpenAI API key (for AI assistant features)

## Project Structure

OpenFisca Editor is organized with the following directory structure:

- `app/` - Next.js application entry points
  - `api/` - API routes
  - `docs/` - Documentation pages
  - `institutions/` - Institution detail pages
- `components/` - React components
  - `ui/` - Generic UI components (shadcn/ui)
  - `editor/` - Code editor related
  - `institution/` - Institution related
  - `test/` - Test related
  - `visualization/` - Visualization related (MermaidPanel)
  - `simulation/` - Simulation related (3D visualization)
  - `layout/` - Layout related
  - `shared/` - Shared components
- `contexts/` - React contexts
- `lib/` - Utility functions, type definitions, etc.
  - `i18n/` - Internationalization related
- `public/` - Static assets
  - `docs/` - Markdown documentation

## Key Components

- **OpenFiscaEditor**: Main application component
- **InstitutionDetails**: Component to display and edit institution details
- **CodeEditorPanel**: Component to edit OpenFisca code
- **TestCasePanel**: Component to manage test cases
- **SimulationPanel**: Component to run simulations and visualize results in 3D
- **MermaidPanel**: Component to display institution flowcharts

## Contributing

Contributions are welcome. You can contribute as follows:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a pull request

## License

This software is provided under the Server Side Public License (SSPL) v1.0.
See the [LICENSE](./LICENSE) file for details.
