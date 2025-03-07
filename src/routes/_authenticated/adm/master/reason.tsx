import { createFileRoute } from '@tanstack/react-router'
import ReasonPage from '../../../../pages/admin/master/Reason'

export const Route = createFileRoute('/_authenticated/adm/master/reason')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ReasonPage />
}
