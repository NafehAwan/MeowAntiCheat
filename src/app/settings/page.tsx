export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Account */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              placeholder="your@email.com"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm">Email alerts for critical incidents</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500" defaultChecked />
            <span className="text-sm">Discord webhook notifications</span>
          </label>
        </div>
      </div>

      {/* Discord Webhook */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Discord Webhook</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
            <input
              type="url"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition">
            Save Settings
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900/50 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-sm text-red-400 transition">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
