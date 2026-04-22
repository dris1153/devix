import Link from 'next/link'
import { Container } from '@/components/base/container'
import { StaleTabCleanup } from '@/components/stale-tab-cleanup'

export default function NotFound() {
    return (
        <Container>
            <StaleTabCleanup />
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    404 / file not found
                </div>
                <h1 className="mb-3 font-mono text-3xl text-primary-foreground">File not found</h1>
                <p className="mb-8 text-slate-400">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="font-mono text-sm tracking-wider text-slate-500 uppercase transition-colors hover:text-primary-foreground"
                >
                    ← Back home
                </Link>
            </div>
        </Container>
    )
}
