export default function Loading() {
    return (
        <div className="relative flex min-h-full w-full flex-col bg-[#0d1117]">
            {/* Top indeterminate progress bar — VSCode-style */}
            <div
                aria-hidden
                className="absolute top-0 right-0 left-0 h-[2px] overflow-hidden bg-[#1e1e1e]"
            >
                <div className="animate-bar-sweep h-full w-[30%] bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Skeleton body — mirrors Container + card list layout */}
            <div
                role="status"
                aria-label="Loading content"
                className="mx-auto w-full max-w-[1840px] px-8 py-8 md:px-20"
            >
                {/* Path breadcrumb skeleton */}
                <div className="mb-2 h-3 w-40 animate-skeleton rounded" />

                {/* Heading skeleton */}
                <div className="mb-4 flex items-end justify-between border-b border-[#2d2d2d] pb-4">
                    <div className="h-8 w-48 animate-skeleton rounded" />
                    <div className="h-4 w-20 animate-skeleton rounded" />
                </div>

                {/* Filter bar skeleton */}
                <div className="mb-8 space-y-3">
                    <div className="h-10 w-full animate-skeleton rounded-md" />
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-7 w-20 animate-skeleton rounded"
                                style={{ animationDelay: `${i * 80}ms` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Card grid skeleton */}
                <div className="grid gap-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="rounded-lg border border-[#2d2d2d] bg-[#181818] p-6"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="mb-3 h-5 w-3/4 animate-skeleton rounded" />
                            <div className="mb-4 h-3 w-48 animate-skeleton rounded" />
                            <div className="mb-2 h-3 w-full animate-skeleton rounded" />
                            <div className="mb-4 h-3 w-5/6 animate-skeleton rounded" />
                            <div className="flex gap-2">
                                <div className="h-5 w-16 animate-skeleton rounded" />
                                <div className="h-5 w-20 animate-skeleton rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Screen-reader + mono status line */}
                <div className="mt-8 font-mono text-[11px] tracking-wider text-slate-500">
                    <span className="sr-only">Loading page content, please wait.</span>
                    <span aria-hidden>&gt; loading</span>
                    <span aria-hidden className="animate-pulse">
                        ...
                    </span>
                </div>
            </div>
        </div>
    )
}
