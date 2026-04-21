interface Props {
    message?: string
    onReset?: () => void
}

export function EmptyState({ message = 'Nothing matches your filters.', onReset }: Props) {
    return (
        <div className="py-16 text-center text-gray-500">
            <p>{message}</p>
            {onReset && (
                <button type="button" onClick={onReset} className="mt-3 text-sm underline">
                    Reset filters
                </button>
            )}
        </div>
    )
}
