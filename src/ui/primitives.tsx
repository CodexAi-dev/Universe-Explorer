import type { ReactNode } from 'react'

/** Small shared building blocks so panels stay declarative and consistent. */

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-[var(--panel-text)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[var(--panel-accent)]' : 'bg-white/15'
        }`}
      >
        {/*
          `left-0` is required: a button's UA `text-align: center` would
          otherwise place the knob's static origin at the track's centre.
          Track 36px − knob 16px − 2px inset = 18px of travel.
        */}
        <span
          className={`absolute top-0.5 left-0 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
    </label>
  )
}

export function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-[var(--panel-border)] px-4 py-3 last:border-b-0">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--panel-text-dim)] uppercase">
        {icon}
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  active = false,
  className = '',
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  active?: boolean
  className?: string
  title?: string
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40'
  const styles =
    variant === 'primary'
      ? 'bg-[var(--panel-accent)] text-black hover:brightness-110'
      : active
        ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-text)] ring-1 ring-[var(--panel-accent)]'
        : 'bg-white/8 text-[var(--panel-text)] hover:bg-white/15'

  return (
    <button type="button" title={title} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  active = false,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`grid h-9 w-9 place-items-center rounded-[var(--radius-control)] transition-colors ${
        active
          ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-accent)]'
          : 'text-[var(--panel-text-dim)] hover:bg-white/10 hover:text-[var(--panel-text)]'
      }`}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--panel-border)] py-1.5 text-sm last:border-b-0">
      <span className="text-[var(--panel-text-dim)]">{label}</span>
      <span className="text-right font-medium text-[var(--panel-text)]">{value}</span>
    </div>
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
  label: string
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-[var(--panel-text-dim)]">{label}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-[var(--radius-control)] border border-[var(--panel-border)] bg-black/40 px-2 py-1 text-[var(--panel-text)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0a0a1f]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`panel max-h-[85vh] w-full overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-5 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--panel-text-dim)] hover:bg-white/10 hover:text-[var(--panel-text)]"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
