'use client'

import { useState, useEffect } from 'react'

interface Server {
  id: string
  name: string
  ip: string
  plugin_bound: boolean
  created_at: string
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [serverName, setServerName] = useState('')
  const [serverIp, setServerIp] = useState('')
  const [linkCode, setLinkCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchServers()
  }, [])

  async function fetchServers() {
    try {
      const res = await fetch('/api/v1/servers')
      const data = await res.json()
      setServers(data.servers || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const res = await fetch('/api/v1/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: serverName, ip: serverIp }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create server')
        return
      }

      setServers(prev => [data.server, ...prev])
      setShowModal(false)
      setServerName('')
      setServerIp('')
      setSuccess('Server added! Now link it with the plugin.')
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  async function openLinkModal(server: Server) {
    setSelectedServer(server)
    setLinkCode('')
    setError('')
    setSuccess('')
    setCopied(false)
    setGenerating(true)
    setShowLinkModal(true)

    try {
      const res = await fetch('/api/v1/link/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: server.id }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to generate code')
        return
      }

      setLinkCode(data.code)
    } catch {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(linkCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleUnlink(serverId: string) {
    if (!confirm('Unlink this server? The plugin will stop reporting.')) return

    try {
      await fetch('/api/v1/servers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId }),
      })
      fetchServers()
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Servers</h2>
        <button
          onClick={() => { setShowModal(true); setError(''); setServerName(''); setServerIp(''); }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition text-sm"
        >
          + Add Server
        </button>
      </div>

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : servers.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🖥️</p>
            <p className="mb-2">No servers yet</p>
            <p className="text-sm">Add a server to start monitoring for cheats.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map(server => (
            <div key={server.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{server.name}</h3>
                  <p className="text-sm text-gray-400">{server.ip}</p>
                  <p className="text-xs text-gray-600 mt-1">Created {new Date(server.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {server.plugin_bound ? (
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                      Linked
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs">
                      Not Linked
                    </span>
                  )}
                  {!server.plugin_bound && (
                    <button
                      onClick={() => openLinkModal(server)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs transition"
                    >
                      Link Plugin
                    </button>
                  )}
                  {server.plugin_bound && (
                    <button
                      onClick={() => handleUnlink(server.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition"
                    >
                      Unlink
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">How to Link Your Server</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <Step num={1} text="Add your server in the dashboard" />
          <Step num={2} text="Install MeowAntiCheat plugin on your Paper server" />
          <Step num={3} text='Click "Link Plugin" — copy the code shown' />
          <Step num={4} text='Run /meowac confirm CODE in-game' />
          <Step num={5} text="Done! Plugin is now connected." />
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="text-lg font-semibold mb-4">Add Server</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="My SMP Server"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Server IP</label>
              <input
                type="text"
                value={serverIp}
                onChange={e => setServerIp(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="play.example.com"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-700 hover:border-gray-500 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-semibold transition"
              >
                {creating ? 'Creating...' : 'Add Server'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showLinkModal && selectedServer && (
        <Modal onClose={() => setShowLinkModal(false)}>
          <h3 className="text-lg font-semibold mb-2">Link Plugin — {selectedServer.name}</h3>
          <p className="text-sm text-gray-400 mb-4">
            Copy this code and run it in-game:
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {generating ? (
            <div className="text-center py-8 text-gray-500">Generating code...</div>
          ) : linkCode ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-2">Run this command in-game:</p>
                <p className="font-mono text-purple-400 text-xl tracking-wider">
                  /meowac confirm {linkCode}
                </p>
              </div>
              <button
                onClick={copyCode}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition"
              >
                {copied ? 'Copied!' : 'Copy Command'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Code expires in 10 minutes
              </p>
            </div>
          ) : null}
          <div className="mt-4">
            <button
              onClick={() => setShowLinkModal(false)}
              className="w-full py-3 border border-gray-700 hover:border-gray-500 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
        {children}
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
