import { LibraryIndexModule } from '@/modules/library/library-index.module'

export const dynamic = 'force-static'
export const runtime = 'nodejs'
export const metadata = { title: 'Library' }

export default function LibraryPage() {
    return <LibraryIndexModule />
}
