# Code Standards & Conventions

## Core Principles

**YAGNI** (You Aren't Gonna Need It) — Don't implement features until needed
**KISS** (Keep It Simple, Stupid) — Favor simplicity over complex abstractions
**DRY** (Don't Repeat Yourself) — Extract duplicated logic into reusable modules

## File Organization & Naming

### File Naming Convention

- **TypeScript/JavaScript:** kebab-case with descriptive names

    - ✅ `adjust-margin.widget.tsx`
    - ✅ `close-position-desktop.ui.tsx`
    - ❌ `adjustMargin.tsx` (camelCase not preferred for non-hook files)

- **Hook files:** camelCase with `use` prefix (exception to kebab-case rule)

    - ✅ `usePositionsScript.ts`
    - ✅ `useCombinePositionScript.ts`
    - ✅ `useWindowSize.tsx`
    - ❌ `use-combine-positions-script.ts` (kebab-case not allowed for hooks)
    - ❌ `use-positions-script.ts` (kebab-case not allowed for hooks)
    - **Exception — Widget `.script.ts` files:** The 3-file widget pattern's `.script.ts` defines the widget's main hook but follows **kebab-case** (matching the widget name), not camelCase. This is because the file is part of the widget identity, not a standalone hook.
        - ✅ `adjust-margin.script.tsx` → exports `useAdjustMarginScript()`
        - ✅ `data-list.script.ts` → exports `useDataListScript()`
        - ❌ `useAdjustMarginScript.ts` (don't rename `.script.ts` to camelCase)

- **Hook file separation:** Hooks must be in dedicated files, not co-located with components

    - ✅ `hooks/usePositionsScript.ts` + `positions-table.ui.tsx` (separate files)
    - ✅ `leverage.script.tsx` defining `useLeverageScript()` (widget's main hook in `.script.ts`)
    - ❌ Defining `usePositionsScript` inside `positions-table.ui.tsx`
    - **Exception 1:** `useContext` hooks for providers can stay in the provider file (e.g., `usePositionsRow()` inside `positions-row-provider.tsx`)
    - **Exception 2:** Widget `.script.ts` files can define the widget's main hook (see 3-file pattern below)

- **CSS/Styling:** Follow Tailwind conventions, use design tokens

    - All color, spacing, shadow values defined as CSS variables in `src/app/globals.css`

- **SVG Icons:** kebab-case files, PascalCase exports
    - File: `arrow-right-icon.tsx`
    - Export: `ArrowRightIcon`

### File Size Management

**Target:** Keep code files under 200 lines

**Strategy for larger features:**

1. Extract utilities into separate `utils.ts`
2. Extract hooks into separate `hooks/` directory
3. Split UI into sub-components
4. Use composition over large monolithic files

**Example: Positions Table**

```
positions/
├── positions-table.widget.tsx
├── positions-table.ui.tsx
├── hooks/
│   ├── usePositionsScript.ts
│   ├── useCombinePositionScript.ts
│   └── usePositionColumns.ts
├── desktop/
│   └── ...
├── mobile/
│   └── ...
└── providers/
    └── positions-row-provider.tsx
```

**Exception:** Markdown files, config files, environment files — size limits don't apply.

## Component Architecture

### Module Pattern (Page-Level)

Each route in `src/app/` maps 1:1 to a folder in `src/modules/`. Module entry uses `.module.tsx` suffix.

```
modules/
└── home/
    ├── home.module.tsx    # entry — composes .ui + .script
    ├── home.ui.tsx        # pure UI
    ├── home.script.ts     # logic hook
    ├── components/        # module-local single-file components
    ├── widgets/           # module-local 3-file widgets
    ├── hooks/             # module-local hooks
    └── utils/             # module-local utils
```

**Rules:**

- Module = page-level container (1:1 với route)
- Widget = reusable UI block (inside module or shared)
- Shared across modules → promote to `src/components/shared/`
- NEVER place `.module.css` next to `.module.tsx` (Next.js CSS Modules collision)

**page.tsx consumer:**

```tsx
import { HomeModule } from '@/modules/home/home.module'
export default function Page() {
    return <HomeModule />
}
```

### 3-File Widget Pattern

Standard structure for feature components:

```typescript
// feature.widget.tsx
// Entry point, prop definitions, modal/dialog registration
'use client'

import type { ComponentProps } from '@/core/types'
import { useFeatureScript } from './feature.script'
import { Feature } from './feature.ui'

export type FeatureWidgetProps = {
    id: string
    data: Data
}

export const FeatureWidget: React.FC<FeatureWidgetProps> = (props) => {
    const state = useFeatureScript(props)
    return <Feature {...state} />
}

// Register with modal provider (if applicable)
import { registerSimpleDialog } from '@orderly.network/ui'

registerSimpleDialog(FeatureDialogId, FeatureWidget, {
    title: 'Feature Dialog',
    closable: true,
})
```

```typescript
// feature.ui.tsx
// Pure rendering, styling, no business logic
'use client'

import { cn } from '@/utils'

export type FeatureProps = {
    title: string
    onSubmit: () => void
    isLoading?: boolean
}

export const Feature: React.FC<FeatureProps> = ({ title, onSubmit, isLoading }) => {
    return (
        <div className="p-4 bg-surface-primary-medium rounded">
            <h2 className="text-foreground-on-dark">{title}</h2>
            <button
                className={cn('px-4 py-2 bg-primary rounded', {
                    'opacity-50': isLoading,
                })}
                onClick={onSubmit}
                disabled={isLoading}
            >
                Submit
            </button>
        </div>
    )
}
```

```typescript
// feature.script.ts
// Business logic, API calls, validation, state management
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from '@orderly.network/i18n'

export const useFeatureScript = (props: FeatureWidgetProps) => {
    const { t } = useTranslation()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            // API call here
            return submitFeature(props.id)
        },
    })

    return {
        title: t('feature.title'),
        onSubmit: () => mutate(),
        isLoading: isPending,
    }
}
```

### Widget Hook Organization

**When to use `.script.ts` vs `hooks/` folder:**

| Scenario                    | Approach                                       | Example                                                         |
| --------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| Widget needs 1 main hook    | `.script.ts` (kebab-case, matches widget name) | `leverage.script.tsx` → `useLeverageScript()`                   |
| Widget needs multiple hooks | `hooks/` folder (camelCase per hook)           | `orderbook/hooks/useOrderbookScript.ts` + `usePendingOrders.ts` |
| Auxiliary/shared hooks      | Always `hooks/` folder (camelCase)             | `hooks/useTabSort.ts`, `hooks/useReversePositionEnabled.ts`     |

`.script.ts` = kebab-case (widget identity). `hooks/` = camelCase. Never define hooks inside `.widget.tsx` or `.ui.tsx`.

### Component Type Annotations

**For components with children:**

```typescript
import type { FCC } from '@/core/types'

type MyComponentProps = {
    title: string
}

export const MyComponent: FCC<MyComponentProps> = ({ title, children }) => {
    return <div>{title}{children}</div>
}
```

**For regular components:**

```typescript
type MyComponentProps = {
    id: string
    value: number
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
    return <div>{props.value}</div>
}
```

## TypeScript Standards

### Type Definitions

**Explicit parameter & return types:**

```typescript
// ✅ Correct
function calculateTotal(items: Order[], rate: number): number {
    return items.reduce((sum, item) => sum + item.amount * rate, 0)
}

// ❌ Incorrect (no types)
function calculateTotal(items, rate) {
    return items.reduce((sum, item) => sum + item.amount * rate, 0)
}
```

**Use interfaces for object shapes:**

```typescript
// ✅ Preferred
interface Position {
    id: string
    symbol: string
    quantity: number
    entryPrice: number
}

// ❌ Less clear
type Position = {
    id: string
    symbol: string
    quantity: number
    entryPrice: number
}
```

**Strict mode enabled:**

```typescript
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true
    }
}
```

### Error Handling

**Always use try-catch for async operations:**

```typescript
export const useSubmitForm = () => {
    const [error, setError] = useState<string | null>(null)

    const submit = async (data: FormData) => {
        try {
            const result = await submitOrder(data)
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        }
    }

    return { submit, error }
}
```

**Handle API errors consistently:**

```typescript
// APIs return IAxiosResponse<T>
interface IAxiosResponse<T> {
    success: boolean
    data: T
    error?: {
        message: string
        code: string
    }
}

// Usage
const handleApiCall = async () => {
    try {
        const response = await submitOrder(...)
        if (!response.success) {
            throw new Error(response.error?.message || 'Request failed')
        }
        return response.data
    } catch (err) {
        console.error('API Error:', err)
        // Show user-facing error
    }
}
```

## Styling Standards

### Tailwind CSS + Design Tokens

**Use design tokens from `src/app/globals.css`:**

```css
/* globals.css defines CSS variables */
--color-surface-primary-medium
--color-text-foreground-on-dark
--color-primary
--color-secondary
--spacing-*
--shadow-*
--font-roboto
```

**Apply via Tailwind classes:**

```typescript
<div className="bg-surface-primary-medium text-foreground-on-dark p-4 rounded">
    <h1 className="text-lg font-roboto">Title</h1>
</div>
```

**Never use raw colors in components:**

```typescript
// ❌ Incorrect (hardcoded colors)
<div className="bg-blue-500 text-red-800">

// ✅ Correct (design tokens)
<div className="bg-surface-primary-medium text-foreground-on-dark">
```

### Class Merging with `cn()`

Use the `cn()` utility for conditional classes and merging:

```typescript
import { cn } from '@/utils'

type ButtonProps = {
    variant?: 'primary' | 'secondary'
    disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', disabled }) => {
    return (
        <button
            className={cn(
                'px-4 py-2 rounded font-medium transition',
                {
                    'bg-primary text-white': variant === 'primary',
                    'bg-surface-secondary text-foreground': variant === 'secondary',
                    'opacity-50 cursor-not-allowed': disabled,
                }
            )}
            disabled={disabled}
        >
            Click me
        </button>
    )
}
```

### CVA for Complex Variants

Use Class Variance Authority for intricate component variants:

```typescript
import { cva } from 'class-variance-authority'

const buttonCva = cva('px-4 py-2 rounded font-medium', {
    variants: {
        variant: {
            primary: 'bg-primary text-white',
            secondary: 'bg-surface-secondary text-foreground',
        },
        size: {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    },
})

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, className, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(buttonCva({ variant, size }), className)}
            {...props}
        />
    )
)
```

## Import Organization

### Path Aliases

Use absolute imports with aliases:

```typescript
// ✅ Correct (alias)
import { Button } from '@/components/base/button/button'
import { cn } from '@/utils'
import { envConfig } from '@/core/configs/env.config'

// ❌ Incorrect (relative, hard to read)
import { Button } from '../../../../components/base/button/button'
import { cn } from '../../../../utils'
```

### Alias Convention

| Alias                | Path                  | Purpose               |
| -------------------- | --------------------- | --------------------- |
| `@/`                 | `src/`                | Absolute root imports |
| `@orderly.network/*` | External SDK packages | Orderly Network SDK   |

### Import Order (ESLint enforced)

1. External dependencies
2. Orderly SDK imports
3. Absolute imports from `@/`
4. Relative imports

```typescript
// ✅ Correct order
import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useTranslation } from '@orderly.network/i18n'
import { Button } from '@orderly.network/ui'

import { cn } from '@/utils'
import { envConfig } from '@/core/configs/env.config'
import { MyComponent } from '@/components/my-component'

import { useLocalLogic } from './useLocalLogic'
```

## Base Components Import Convention

**`src/components/base/` has NO barrel exports** — import by direct path:

```typescript
// ✅ Correct
import { Button } from '@/components/base/button/button'
import { Input } from '@/components/base/input/input'
import { Checkbox } from '@/components/base/checkbox/checkbox'

// ❌ Incorrect (no index.ts in base/)
import { Button, Input } from '@/components/base'
```

**Why?** Barrel exports cause circular dependencies and slow down type checking. Direct paths are more explicit.

## API Layer Standards

### Domain-Based Organization

```
apis/
├── axios.ts          # Shared axios instance
├── types.ts          # IAxiosResponse<T>, errors
├── keys.ts           # React Query key factory
├── define.ts         # Endpoint definitions
└── trading/          # Domain
    ├── types.ts      # Trading-specific types
    ├── requests.ts   # fetch() wrappers (no hooks)
    └── queries.ts    # useQuery/useMutation hooks
```

### Request File Pattern

```typescript
// apis/trading/requests.ts
import { axios } from '@/apis/axios'
import type { Order, Position } from './types'
import type { IAxiosResponse } from '@/apis/types'

export const submitOrder = (data: CreateOrderDto): Promise<IAxiosResponse<Order>> => {
    return axios.post('/v1/order', data)
}

export const getPositions = (): Promise<IAxiosResponse<Position[]>> => {
    return axios.get('/v1/positions')
}
```

### Query Hooks Pattern

```typescript
// apis/trading/queries.ts
import { useMutation, useQuery } from '@tanstack/react-query'

export const usePositions = (symbol?: string) =>
    useQuery({
        queryKey: tradingKeys.positions(symbol),
        queryFn: () => requests.getPositions(),
        staleTime: 5000,
    })

export const useSubmitOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateOrderDto) => requests.submitOrder(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: tradingKeys.positions() }),
    })
}
```

## State Management

### Zustand Store Pattern

```typescript
// stores/ui.store.ts
import { create } from 'zustand'

interface UIStore {
    showAllSymbols: boolean
    setShowAllSymbols: (value: boolean) => void
    pnlDecimal: number
    setPnlDecimal: (value: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
    showAllSymbols: false,
    setShowAllSymbols: (value) => set({ showAllSymbols: value }),
    pnlDecimal: 2,
    setPnlDecimal: (value) => set({ pnlDecimal: value }),
}))

// Helper for external updates (non-React)
export const setUIStore = (updates: Partial<UIStore>) => {
    useUIStore.setState(updates)
}
```

**Usage in components:**

```typescript
export const MyComponent = () => {
    const { showAllSymbols, setShowAllSymbols } = useUIStore()

    return (
        <button onClick={() => setShowAllSymbols(!showAllSymbols)}>
            Toggle: {showAllSymbols ? 'All' : 'Current'}
        </button>
    )
}
```

## Hooks Standards

### Custom Hook Naming

- Prefix with `use`, use full English names, not abbreviations
- **File name:** camelCase (e.g., `useWindowSize.tsx`, `useCombinePositionScript.ts`)
- **Function name:** camelCase matching file name
- ✅ `useWindowSize`, `useLocalStorage`, `useCombinePositions`
- ❌ `useWS`, `useLS` (unclear abbreviations)

### Hook File Organization

- Hooks must live in **dedicated files** — not defined inside component files
- Place in `hooks/` directory within the feature folder
- **Exception:** `useContext`-based hooks can stay in their provider file
    ```typescript
    // ✅ OK — context hook in provider file
    // providers/positions-row-provider.tsx
    export const usePositionsRow = () => {
        const ctx = useContext(PositionsRowContext)
        if (!ctx) throw new Error('...')
        return ctx
    }
    ```

### Hook Pattern for Complex Logic

Combine state, queries, mutations, and callbacks in a single custom hook. Return an object with all needed state and handlers.

## Form Handling (react-hook-form)

Use `useForm()` with type-safe `control` and `handleSubmit`. Always validate inputs with Zod schemas.

**Pattern:**

```typescript
const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ }
})

const onSubmit = handleSubmit((data) => {
    // Submit to API
})

return <form onSubmit={onSubmit}>{/* fields */}</form>
```

## Internationalization (Lingui)

Wrap translatable strings with `<Trans>` (JSX) or `msg()` (non-JSX).

**JSX:**

```typescript
import { Trans } from '@lingui/react/macro'
<Trans>Translatable string</Trans>
```

**Non-JSX:**

```typescript
import { msg } from '@lingui/core/macro'
const text = msg`Translatable string`
```

After updates, run:

```bash
pnpm translations:extract && pnpm translations:compile
```

Supported locales: en, de, es, ru, fr, ja, ko, nl, vi, uk, zh (11 total)

## Client vs Server Components

### `'use client'` Directive

Add `'use client'` to components that use:

- React hooks (`useState`, `useEffect`, `useContext`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

```typescript
// ✅ Client component
'use client'

import { useState } from 'react'

export const Counter = () => {
    const [count, setCount] = useState(0)
    return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

```typescript
// ✅ Server component (no directive needed)
import { getPost } from '@/apis/posts'

export const PostDetail = async ({ id }: { id: string }) => {
    const post = await getPost(id)
    return <article>{post.title}</article>
}
```

## Error Boundaries

Wrap risky components to catch errors and show fallback UI:

```typescript
'use client'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }> {
    state = { hasError: false }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    render() {
        return this.state.hasError ? this.props.fallback : this.props.children
    }
}
```

## Code Comments

Comment the "why", not the "what": complex algorithms, non-obvious optimizations, business logic, workarounds.

✅ Good: `// Memoize to prevent re-renders when parent updates with same data`
❌ Bad: `// Set the value to 5`

## Testing Standards

Testing coverage is currently in progress (0% baseline). Target: 80%+ coverage.

### Unit Tests

Test utilities and pure functions with comprehensive coverage including edge cases.

**Tools:** Jest + @testing-library/utils

**Pattern:**

```typescript
describe('formatNumber', () => {
    it('formats with 2 decimal places', () => {
        expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    })

    it('handles zero', () => {
        expect(formatNumber(0)).toBe('0.00')
    })
})
```

### Component Tests

Test user interactions, rendering, and props using `@testing-library/react` and `jest`.

**Pattern:**

```typescript
import { render, screen, userEvent } from '@testing-library/react'

describe('Button', () => {
    it('calls onClick when clicked', async () => {
        const onClick = jest.fn()
        render(<Button onClick={onClick}>Click me</Button>)

        await userEvent.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalled()
    })
})
```

### E2E Tests

E2E testing suite planned for Q3 2026. Will test critical user flows: wallet connection, order placement, position closing.

## Performance Best Practices

### Memoization

```typescript
// Memoize expensive components
export const ExpensiveList = React.memo(({ items }: Props) => {
    return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
}, (prevProps, nextProps) => {
    // Return true if props are equal (skip render)
    return prevProps.items === nextProps.items
})

// Memoize callbacks to prevent unnecessary re-renders of children
const handleSubmit = useCallback(async (data) => {
    await submitOrder(data)
}, [])

// Memoize expensive computations
const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount * item.quantity, 0)
}, [items])
```

### Code Splitting

```typescript
// Dynamic imports for large features
const AdvancedChartWidget = dynamic(
    () => import('@/widgets/advanced-chart'),
    { loading: () => <Skeleton /> }
)

export const Dashboard = () => {
    return (
        <div>
            <AdvancedChartWidget />
        </div>
    )
}
```

## Pre-Commit Checklist

Before committing code:

- [ ] Run `pnpm lint` — No ESLint errors
- [ ] Run `pnpm format` — Code is formatted
- [ ] Manual testing — Feature works as expected
- [ ] No console warnings/errors — Check dev console
- [ ] TypeScript strict mode — No `any` types
- [ ] No hardcoded colors/spacing — Use design tokens
- [ ] Components follow 3-file pattern (if applicable)
- [ ] Imports organized correctly — Absolute before relative
- [ ] Error handling present — try-catch for async, Error boundaries

## Common Patterns & Anti-Patterns

| Pattern                             | Usage                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| **Responsive Component**            | Use `useWindowSize()` for md: 768px breakpoint               |
| **Context for State**               | React Context for positions, rows, symbols with custom hooks |
| **⚠️ No barrel exports in `base/`** | Direct imports only (circular deps, slow type-checking)      |

---

**Last Updated:** 2026-04-16
**Version:** 2.2 (Post orders-list migration, testing section added)
**Next Review:** When new patterns emerge or dependencies update
