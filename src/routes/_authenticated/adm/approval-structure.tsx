import { createFileRoute } from '@tanstack/react-router'
import ApprovalStructurePage from '../../../pages/admin/ApprovalStructure'

export const Route = createFileRoute('/_authenticated/adm/approval-structure')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ApprovalStructurePage />
}
