
import { ProjectForm } from '@/components/admin/ProjectForm'
import { createProject } from '../actions'

export default function NewProjectPage() {
    return <ProjectForm action={createProject} />
}
