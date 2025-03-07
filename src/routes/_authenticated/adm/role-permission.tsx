import { createFileRoute } from '@tanstack/react-router'
import RolePermissionPage from '../../../pages/admin/RolePermission'

export const Route = createFileRoute('/_authenticated/adm/role-permission')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RolePermissionPage />
}
