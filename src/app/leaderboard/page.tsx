export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suspicion Leaderboard</h2>
        <div className="text-sm text-gray-500">
          🏆 Players ranked by current suspicion score
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 w-16">#</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Player</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Incidents</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <p className="text-4xl mb-4">🏆</p>
                <p>No players to rank yet.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">About Suspicion Scores</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>• Scores are based on weighted evidence, not violation counts</p>
          <p>• Minor anomaly: +2 | Repeated anomaly: +5 | Strong evidence: +12 | Correlated events: +20</p>
          <p>• Scores decay over time when behavior returns to normal</p>
          <p>• A high score is evidence for investigation, not proof of cheating</p>
        </div>
      </div>
    </div>
  )
}
