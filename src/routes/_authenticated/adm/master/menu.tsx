import { createFileRoute } from '@tanstack/react-router'
import MenuPage from '../../../../pages/admin/master/Menu'

export const Route = createFileRoute('/_authenticated/adm/master/menu')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuPage />
}
