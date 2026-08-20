export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Incidents</h2>
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="confirmed">Confirmed</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500">
            <option value="">All Categories</option>
            <option value="COMBAT">Combat</option>
            <option value="MOVEMENT">Movement</option>
            <option value="WORLD">World</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🚨</p>
            <p className="mb-2">No incidents yet</p>
            <p className="text-sm">Incidents will appear here when cheats are detected.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
