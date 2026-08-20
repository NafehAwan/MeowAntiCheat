export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Incidents" value="—" icon="🚨" color="red" />
        <StatCard title="Players Tracked" value="—" icon="👤" color="purple" />
        <StatCard title="Servers Online" value="—" icon="🖥️" color="green" />
        <StatCard title="Avg Confidence" value="—" icon="📊" color="yellow" />
      </div>

      {/* Recent Incidents */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Incidents</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🐱</p>
          <p>No incidents yet. Link your server to get started!</p>
          <a href="/servers" className="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition text-sm">
            Add Server
          </a>
        </div>
      </div>

      {/* Server Status */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Server Status</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🖥️</p>
          <p>No servers linked yet.</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    red: 'border-red-500/20 bg-red-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
  }

  return (
    <div className={`p-5 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}
