# OpenFisca Editor Commands & Guidelines

## Build & Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter

## Testing
- Tests are defined in YAML format
- Run tests via TestRunner component in UI
- Test results include pass/fail status and execution details

## Code Style Guidelines
- **Component naming**: PascalCase (e.g., `CodeEditorPanel`)
- **Variables/functions**: camelCase
- **Constants**: SNAKE_CASE
- **Types/interfaces**: PascalCase
- **Interface for props**: `ComponentNameProps`
- **Files for components**: Same as component name (PascalCase.tsx)

## Import Order
1. React/Next.js modules
2. Third-party libraries
3. Project components
4. Utility functions
5. Types

## Component Organization
- Components organized by function in subdirectories
- UI components in `/components/ui`
- Domain-specific components in dedicated folders:
  - `/simulation` - シミュレーション関連コンポーネント
  - `/visualization` - 可視化関連コンポーネント
  - `/test` - テスト関連コンポーネント

## Error Handling
- Use try/catch/finally pattern for API calls
- Use fallback mechanisms for API failures
- Display user-friendly error messages
- Handle loading states appropriately

## OpenFisca Concepts
- Variables: defined with attributes and formula methods
- Parameters: configurable values that may change over time
- Entities: represent individuals, households, or organizations
- Tests: verify system behavior with specific inputs/outputs

## API & Utilities
- `lib/simulation-helpers.ts` - クライアントサイドシミュレーション計算
- `lib/api.ts` - OpenFisca API への接続