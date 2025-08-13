export function SessionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <p className="text-sm font-medium text-gray-800">No upcoming sessions</p>
      <p className="text-xs text-gray-600">Create your first session above to get started.</p>
    </div>
  )
}

export function RSVPsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <p className="text-sm font-medium text-gray-800">No RSVPs yet</p>
      <p className="text-xs text-gray-600">Invite clients to this session to manage RSVPs here.</p>
    </div>
  )
}
