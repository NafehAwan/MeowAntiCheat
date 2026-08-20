import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MeowAntiCheat
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition">
              Login
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Observe. Detect. Prove.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Advanced Minecraft anti-cheat with automatic evidence recording, replay system, and web dashboard.
            Don&apos;t just tell moderators something happened — show them.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-lg font-semibold transition">
              Open Dashboard
            </Link>
            <a href="https://github.com/meow-anticheat" className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg text-lg transition">
              View Docs
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon="🔍"
            title="Detection Engine"
            description="16+ checks across combat, movement, and world categories. TriggerBot, KillAura, Reach, Fly, Speed, and more."
          />
          <FeatureCard
            icon="🎥"
            title="Evidence Recording"
            description="Automatic rolling buffer captures 20 seconds before and 10 seconds after every detection event."
          />
          <FeatureCard
            icon="📊"
            title="Suspicion Scoring"
            description="Dynamic player scoring based on weighted evidence. Not violation levels — confidence percentages."
          />
          <FeatureCard
            icon="🎮"
            title="Replay System"
            description="Every incident includes a reconstructable replay. See exactly what happened, when, and why."
          />
          <FeatureCard
            icon="🌐"
            title="Web Dashboard"
            description="Manage servers, review incidents, watch replays, and track player profiles from anywhere."
          />
          <FeatureCard
            icon="⚡"
            title="Zero TPS Impact"
            description="All detection runs on Netty threads. Packet-level analysis, async processing, zero lag."
          />
        </div>

        {/* How it works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
            <Step num="1" text="Player Joins" />
            <Arrow />
            <Step num="2" text="Meow Observes" />
            <Arrow />
            <Step num="3" text="Suspicious Behavior" />
            <Arrow />
            <Step num="4" text="Evidence Captured" />
            <Arrow />
            <Step num="5" text="Staff Reviews" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mt-20 border-t border-gray-800 pt-12">
          <Stat value="16+" label="Detection Checks" />
          <Stat value="20s" label="Evidence Buffer" />
          <Stat value="0" label="TPS Impact" />
          <Stat value="1.21" label="MC Version" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
          <p>🐱 MeowAntiCheat — Observe. Detect. Prove.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition bg-gray-900/50">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function Step({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg">
      <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">{num}</span>
      <span className="text-gray-300">{text}</span>
    </div>
  )
}

function Arrow() {
  return <span className="text-gray-600">→</span>
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-purple-400 mb-1">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}
