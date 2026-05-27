
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { updateProject } from '../actions'

interface EditProjectPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProjectPage(props: EditProjectPageProps) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!project) {
        notFound()
    }

    return <ProjectForm initialData={project} action={updateProject} />
}
