export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Players</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search players..."
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500 w-64"
          />
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500">
            <option value="suspicion_score">Sort by Suspicion</option>
            <option value="total_incidents">Sort by Incidents</option>
            <option value="last_seen">Sort by Last Seen</option>
            <option value="username">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Player List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Player</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Suspicion</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Incidents</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Last Seen</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <p className="text-4xl mb-4">👤</p>
                <p>No players tracked yet.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
