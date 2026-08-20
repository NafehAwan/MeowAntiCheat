export default function ServersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Servers</h2>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition text-sm">
          + Add Server
        </button>
      </div>

      {/* Server List */}
      <div className="space-y-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🖥️</p>
            <p className="mb-2">No servers yet</p>
            <p className="text-sm">Add a server to start monitoring for cheats.</p>
          </div>
        </div>
      </div>

      {/* How to Link */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">How to Link Your Server</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <Step num={1} text="Add your server in the dashboard" />
          <Step num={2} text="Install the MeowAntiCheat plugin on your Paper server" />
          <Step num={3} text="Run /meowac link in-game to get a handle ID" />
          <Step num={4} text="Enter the handle ID in the dashboard" />
          <Step num={5} text="Copy the confirmation code and run /meowac confirm <code> in-game" />
        </div>
      </div>
    </div>
  )
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {num}
      </span>
      <span>{text}</span>
    </div>
  )
}
