import { cn } from '@/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            className={cn('animate-skeleton rounded-md bg-[#1e1e1e]', className)}
            {...props}
        />
    )
}

export { Skeleton }
