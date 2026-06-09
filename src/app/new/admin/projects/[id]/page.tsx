
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { updateProject } from '../actions'
import localProjects from '@/data/projects.json'

interface EditProjectPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProjectPage(props: EditProjectPageProps) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: dbProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

    let project = dbProject

    if (!project) {
        const local = localProjects.find(p => p.id === params.id)
        if (local) {
            project = {
                ...local,
                status: (local as any).status || 'published',
                source: (local as any).source || 'local'
            } as any
        }
    }

    if (!project) {
        notFound()
    }

    return <ProjectForm initialData={project} action={updateProject} />
}
