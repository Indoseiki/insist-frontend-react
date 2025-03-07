import { createFileRoute } from '@tanstack/react-router'
import KeyValuePage from '../../../../pages/admin/master/KeyValue'

export const Route = createFileRoute('/_authenticated/adm/master/key-value')({
  component: RouteComponent,
})

function RouteComponent() {
  return <KeyValuePage />
}
