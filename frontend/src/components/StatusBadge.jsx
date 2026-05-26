const colors = {
  applied: 'bg-blue-100 text-blue-800',
  under_verification: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  benefit_credited: 'bg-emerald-100 text-emerald-800',
  submitted: 'bg-gray-100 text-gray-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  escalated: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',
  card_generated: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function StatusBadge({ status }) {
  const cls = colors[status] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`badge ${cls}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
