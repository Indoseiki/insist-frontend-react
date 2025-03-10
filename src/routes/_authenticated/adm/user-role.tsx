import { createFileRoute } from '@tanstack/react-router'
import UserRolePage from '../../../pages/admin/UserRole'

export const Route = createFileRoute('/_authenticated/adm/user-role')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserRolePage />
}
