import { getAllEntries, getCategories } from '@/core/content/library'
import { LibraryIndexUI } from './library-index.ui'

export function LibraryIndexModule() {
    return <LibraryIndexUI categories={getCategories()} entries={getAllEntries()} />
}
