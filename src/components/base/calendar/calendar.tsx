'use client'

/**
 * @todo Replace with `react-day-picker` when that dependency is installed.
 * Current: native HTML date input — accessible, functional, no extra deps.
 * Recommended upgrade: `pnpm add react-day-picker` + swap implementation.
 */

import * as React from 'react'
import { cn } from '@/utils'

export interface CalendarProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onSelect' | 'value'> {
    mode?: 'single' | 'range' // placeholder API for future react-day-picker compat
    selected?: Date
    onSelect?: (date: Date | undefined) => void
}

export const Calendar = React.forwardRef<HTMLInputElement, CalendarProps>(
    ({ className, selected, onSelect, mode, ...props }, ref) => {
        void mode // accept future react-day-picker API without using it yet
        const value = selected ? selected.toISOString().split('T')[0] : ''
        return (
            <input
                ref={ref}
                type="date"
                value={value}
                onChange={(e) => onSelect?.(e.target.value ? new Date(e.target.value) : undefined)}
                className={cn(
                    'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            />
        )
    },
)
Calendar.displayName = 'Calendar'
