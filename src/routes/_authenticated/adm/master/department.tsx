import { createFileRoute } from '@tanstack/react-router'
import DepartmentPage from '../../../../pages/admin/master/Department'

export const Route = createFileRoute('/_authenticated/adm/master/department')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DepartmentPage />
}
