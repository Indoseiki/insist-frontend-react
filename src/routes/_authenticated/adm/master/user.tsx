import { createFileRoute } from '@tanstack/react-router'
import UserPage from '../../../../pages/admin/master/User'

export const Route = createFileRoute('/_authenticated/adm/master/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserPage />
}
