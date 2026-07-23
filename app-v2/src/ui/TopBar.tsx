import { Atom, Camera, CircleDot, Expand, Globe, HelpCircle, Infinity as InfinityIcon, Settings, Star, Sun } from 'lucide-react'
import { VIEW_SCALES } from '@/data/universe'
import type { ViewScaleId } from '@/data/types'
import { useUniverseStore } from '@/store/useUniverseStore'
import { IconButton } from './primitives'

const SCALES: Array<{ id: ViewScaleId; icon: typeof Sun }> = [
  { id: 'solarSystem', icon: Sun },
  { id: 'interstellar', icon: Star },
  { id: 'galactic', icon: CircleDot },
  { id: 'intergalactic', icon: Atom },
  { id: 'cosmic', icon: InfinityIcon },
]

interface TopBarProps {
  onScreenshot: () => void
  onOpenModal: (modal: 'settings' | 'help') => void
}

export function TopBar({ onScreenshot, onOpenModal }: TopBarProps) {
  const currentView = useUniverseStore((s) => s.currentView)
  const setView = useUniverseStore((s) => s.setView)

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  }

  return (
    <header className="panel pointer-events-auto absolute inset-x-2 top-2 z-30 flex h-[var(--spacing-header)] items-center gap-3 px-3 md:inset-x-3 md:top-3 md:px-4">
      <div className="flex shrink-0 items-center gap-2 font-semibold">
        <Globe className="h-5 w-5 text-[var(--panel-accent)]" />
        <span className="hidden sm:inline">Universe Explorer</span>
      </div>

      <nav
        aria-label="Universe scale"
        className="mx-auto flex items-center gap-1 overflow-x-auto rounded-[var(--radius-control)] bg-black/30 p-1"
      >
        {SCALES.map(({ id, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={active}
              title={VIEW_SCALES[id].description}
              className={`flex shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors ${
                active
                  ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-accent)]'
                  : 'text-[var(--panel-text-dim)] hover:bg-white/10 hover:text-[var(--panel-text)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{VIEW_SCALES[id].name}</span>
            </button>
          )
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton label="Take screenshot" onClick={onScreenshot}>
          <Camera className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton label="Fullscreen" onClick={toggleFullscreen}>
          <Expand className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton label="Settings" onClick={() => onOpenModal('settings')}>
          <Settings className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton label="Help" onClick={() => onOpenModal('help')}>
          <HelpCircle className="h-4.5 w-4.5" />
        </IconButton>
      </div>
    </header>
  )
}
