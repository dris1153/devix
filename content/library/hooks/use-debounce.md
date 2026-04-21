---
title: useDebounce
difficulty: intermediate
tags:
    - React
    - Performance
updatedAt: 2023-11-01
---

A custom hook that delays updating a value until after a specified delay time has elapsed. Essential for optimizing performance-heavy search inputs or window resizing events.

```tsx
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
```

## Props API Interface

| Property | Type     | Description           |
| -------- | -------- | --------------------- |
| `value`  | `T`      | The value to debounce |
| `delay`  | `number` | Delay in ms           |
