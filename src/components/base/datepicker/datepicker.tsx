'use client'

/**
 * @todo Compose Popover + Calendar (react-day-picker) when upgrading Calendar.
 * Current: native date input wrap — shares Calendar component (both use native input).
 * Rationale: keeps base template dependency-free until real design system lands.
 */

import * as React from 'react'
import { Calendar, type CalendarProps } from '@/components/base/calendar'

export type DatepickerProps = CalendarProps

export const Datepicker = React.forwardRef<HTMLInputElement, DatepickerProps>((props, ref) => (
    <Calendar ref={ref} {...props} />
))
Datepicker.displayName = 'Datepicker'
