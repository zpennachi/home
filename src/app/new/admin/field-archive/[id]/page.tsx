import { getArchiveEntry } from '../actions'
import { FieldArchiveEditor } from '@/components/admin/FieldArchiveEditor'
import { notFound } from 'next/navigation'

export default async function FieldArchiveDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const entry = await getArchiveEntry(params.id)

    if (!entry) {
        notFound()
    }

    return <FieldArchiveEditor entry={entry} />
}
