import { useCallback, useState } from 'react'
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react'
import { UniverseCanvas } from '@/scene/UniverseCanvas'
import { useAutoPauseWhenHidden, usePreferences } from '@/hooks/usePreferences'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ControlPanel } from '@/ui/ControlPanel'
import { InfoPanel } from '@/ui/InfoPanel'
import { LoadingScreen } from '@/ui/LoadingScreen'
import { QuickSelect } from '@/ui/QuickSelect'
import { TimeControls } from '@/ui/TimeControls'
import { TopBar } from '@/ui/TopBar'
import { Tooltip } from '@/ui/Tooltip'
import { CompareModal, HelpModal, SettingsModal } from '@/ui/modals'

type ModalId = 'settings' | 'help' | 'compare' | null

export default function App() {
  const [modal, setModal] = useState<ModalId>(null)
  const [loading, setLoading] = useState(true)
  // Panels start open on desktop and closed on narrow screens.
  const [leftCollapsed, setLeftCollapsed] = useState(() => window.innerWidth < 1024)
  const [rightCollapsed, setRightCollapsed] = useState(() => window.innerWidth < 1024)

  usePreferences()
  useAutoPauseWhenHidden()
  useKeyboardShortcuts({
    onToggleHelp: useCallback(() => setModal((m) => (m === 'help' ? null : 'help')), []),
    onCloseModals: useCallback(() => setModal(null), []),
  })

  /** Grabs the WebGL canvas directly — R3F renders on demand, so read after a frame. */
  const takeScreenshot = useCallback(() => {
    requestAnimationFrame(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return
      const link = document.createElement('a')
      link.download = `universe-explorer-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <UniverseCanvas />

      {/* Chrome sits above the canvas but lets pointer events through the gaps. */}
      <div className="pointer-events-none absolute inset-0">
        <TopBar onScreenshot={takeScreenshot} onOpenModal={setModal} />

        <ControlPanel
          collapsed={leftCollapsed}
          onToggleCollapsed={() => setLeftCollapsed((c) => !c)}
        />
        <InfoPanel
          collapsed={rightCollapsed}
          onToggleCollapsed={() => setRightCollapsed((c) => !c)}
          onCompare={() => setModal('compare')}
        />

        <QuickSelect />
        <TimeControls />

        {leftCollapsed && (
          <button
            type="button"
            onClick={() => setLeftCollapsed(false)}
            aria-label="Open controls panel"
            className="panel pointer-events-auto absolute top-[calc(var(--spacing-header)+1rem)] left-2 z-20 grid h-10 w-10 place-items-center md:left-3"
          >
            <PanelLeftOpen className="h-4.5 w-4.5" />
          </button>
        )}

        {rightCollapsed && (
          <button
            type="button"
            onClick={() => setRightCollapsed(false)}
            aria-label="Open information panel"
            className="panel pointer-events-auto absolute top-[calc(var(--spacing-header)+1rem)] right-2 z-20 grid h-10 w-10 place-items-center md:right-3"
          >
            <PanelRightOpen className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      <Tooltip />

      <SettingsModal open={modal === 'settings'} onClose={() => setModal(null)} />
      <HelpModal open={modal === 'help'} onClose={() => setModal(null)} />
      <CompareModal open={modal === 'compare'} onClose={() => setModal(null)} />

      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
    </div>
  )
}
