import React from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

// ═══════════════════════════════
// COMPONENT 1: SettingsCard
// The outer wrapper for every settings card
// ═══════════════════════════════

interface SettingsCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  footer?: React.ReactNode
  badge?: string
  badgeColor?: 'blue'|'green'|'amber'|'red'
  className?: string
}

export const SettingsCard = ({
  title, description, icon: Icon, children, footer, badge, badgeColor, className
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 ${className || ''}`}>

    {/* Card header */}
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center
                          justify-center flex-shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-slate-500" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {title}
            </h3>
            {badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                badgeColor === 'green'  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                badgeColor === 'amber'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                badgeColor === 'red'    ? 'bg-red-50 text-red-700 border border-red-200' :
                                          'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Card body */}
    <div className="space-y-4">
      {children}
    </div>

    {/* Card footer (save buttons etc.) */}
    {footer && (
      <>
        <div className="border-t border-slate-100 mt-5 pt-4">
          {footer}
        </div>
      </>
    )}
  </div>
)

// ═══════════════════════════════
// COMPONENT 2: SettingsField
// Label + input + helper + error wrapper
// ═══════════════════════════════

interface SettingsFieldProps {
  label: string
  description?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  horizontal?: boolean
  className?: string
}

export const SettingsField = ({
  label, description, required, error, children, horizontal, className
}) => {
  if (horizontal) {
    return (
      <div className={`flex items-start justify-between gap-6 ${className || ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-600">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </p>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 w-48 lg:w-64">
          {children}
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className || ''}`}>
      <label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════
// COMPONENT 3: SettingsInput
// All text/number/email/password inputs
// ═══════════════════════════════

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: LucideIcon
  rightElement?: React.ReactNode
  error?: boolean
}

export const SettingsInput = React.forwardRef<HTMLInputElement, SettingsInputProps>(
  ({ leftIcon: LeftIcon, rightElement, error, className, ...props }, ref) => (
    <div className="relative flex items-center">
      {LeftIcon && (
        <LeftIcon className="absolute left-3 w-3.5 h-3.5 text-slate-400
                             pointer-events-none" />
      )}
      <input
        ref={ref}
        className={`
          w-full h-9 rounded-lg border text-sm text-slate-900
          bg-white placeholder:text-slate-400
          px-3 ${LeftIcon ? 'pl-8' : ''} ${rightElement ? 'pr-10' : ''}
          transition-colors duration-150 outline-none
          ${error
            ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            : 'border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          }
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          read-only:bg-slate-50 read-only:text-slate-500 read-only:cursor-default
          ${className || ''}
        `}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3">{rightElement}</div>
      )}
    </div>
  )
)

SettingsInput.displayName = 'SettingsInput'

// ═══════════════════════════════
// COMPONENT 4: SettingsSelect
// All dropdown selects
// ═══════════════════════════════

interface SettingsSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
}

export const SettingsSelect = React.forwardRef<HTMLSelectElement, SettingsSelectProps>(
  ({ error, options, placeholder, className, ...props }, ref) => (
    <select
      ref={ref}
      className={`
        w-full h-9 rounded-lg border text-sm text-slate-900
        bg-white px-3 pr-8 outline-none
        appearance-none bg-no-repeat bg-right
        bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")]
        bg-[right_10px_center]
        transition-colors duration-150
        ${error
          ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
          : 'border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
        }
        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
        ${className || ''}
      `}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )
)

SettingsSelect.displayName = 'SettingsSelect'

// ═══════════════════════════════
// COMPONENT 5: SettingsTextarea
// ═══════════════════════════════

interface SettingsTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const SettingsTextarea = React.forwardRef<
  HTMLTextAreaElement, SettingsTextareaProps
>(({ error, className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`
      w-full rounded-lg border text-sm text-slate-900
      bg-white placeholder:text-slate-400
      px-3 py-2 min-h-[80px] resize-y outline-none
      transition-colors duration-150
      ${error
        ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
        : 'border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
      }
      disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
      ${className || ''}
    `}
    {...props}
  />
))

SettingsTextarea.displayName = 'SettingsTextarea'

// ═══════════════════════════════
// COMPONENT 6: SettingsToggle
// ON/OFF switch — the ONLY toggle design used anywhere
// ═══════════════════════════════

interface SettingsToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export const SettingsToggle = ({
  checked, onChange, disabled, size = 'md'
}) => {
  const track = size === 'sm'
    ? 'w-8 h-4'
    : 'w-10 h-5'
  const thumb = size === 'sm'
    ? 'w-3 h-3 translate-x-0.5'
    : 'w-3.5 h-3.5 translate-x-0.5'
  const thumbOn = size === 'sm'
    ? 'translate-x-4'
    : 'translate-x-5'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center ${track} rounded-full
        transition-colors duration-200 flex-shrink-0
        focus:outline-none focus:ring-2 focus:ring-blue-500/30
        focus:ring-offset-1
        ${checked ? 'bg-blue-500' : 'bg-slate-200'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className={`
        inline-block ${thumb} rounded-full bg-white shadow-sm
        transition-transform duration-200
        ${checked ? thumbOn : ''}
      `} />
    </button>
  )
}

// ═══════════════════════════════
// COMPONENT 7: SettingsToggleRow
// Label + description + toggle in one horizontal row
// The most common pattern in settings pages
// ═══════════════════════════════

interface SettingsToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  badge?: string
  children?: React.ReactNode  // optional expanded content when ON
}

export const SettingsToggleRow = ({
  label, description, checked, onChange, disabled, badge, children
}) => (
  <div>
    <div className="flex items-start justify-between gap-4 py-0.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-700">
            {label}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5
                             rounded-full bg-blue-50 text-blue-600
                             border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <SettingsToggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size="md"
      />
    </div>

    {/* Expanded content (shown when toggle is ON) */}
    {children && checked && (
      <div className="mt-3 ml-0 pl-4 border-l-2 border-blue-100 space-y-3">
        {children}
      </div>
    )}
  </div>
)

// ═══════════════════════════════
// COMPONENT 8: SettingsDivider
// The only divider used between sections inside a card
// ═══════════════════════════════

export const SettingsDivider = () => (
  <div className="border-t border-slate-100" />
)

// ═══════════════════════════════
// COMPONENT 9: SettingsSaveBar
// The save/cancel button row — identical in every card
// ═══════════════════════════════

interface SettingsSaveBarProps {
  onSave: () => void
  onCancel?: () => void
  isSaving?: boolean
  isDirty?: boolean
  saveLabel?: string
  cancelLabel?: string
  danger?: boolean
  align?: 'left' | 'right'
}

export const SettingsSaveBar = ({
  onSave, onCancel, isSaving, isDirty, saveLabel = 'Save Changes',
  cancelLabel = 'Cancel', danger, align = 'right'
}) => (
  <div className={`flex items-center gap-2 ${
    align === 'right' ? 'justify-end' : 'justify-start'
  }`}>
    {/* Unsaved indicator */}
    {isDirty && !isSaving && (
      <span className="text-xs text-amber-500 mr-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Unsaved changes
      </span>
    )}

    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="h-9 px-4 rounded-lg border border-slate-200 text-sm
                   font-medium text-slate-600 bg-white hover:bg-slate-50
                   transition-colors duration-150 disabled:opacity-50"
      >
        {cancelLabel}
      </button>
    )}

    <button
      type="button"
      onClick={onSave}
      disabled={isSaving || (!isDirty && isDirty !== undefined)}
      className={`
        h-9 px-4 rounded-lg text-sm font-medium text-white
        flex items-center gap-2
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${danger
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
        }
      `}
    >
      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {isSaving ? 'Saving...' : saveLabel}
    </button>
  </div>
)

// ═══════════════════════════════
// COMPONENT 10: SettingsAlert
// Info/warning/error/success message boxes
// ═══════════════════════════════

interface SettingsAlertProps {
  type: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  children: React.ReactNode
  icon?: LucideIcon
}

export const SettingsAlert = ({ type, title, children, icon: CustomIcon }) => {
  const config = {
    info:    { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   Icon: Info },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',Icon: CheckCircle },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  Icon: AlertTriangle },
    danger:  { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    Icon: AlertCircle },
  }[type]

  const Icon = CustomIcon || config.Icon

  return (
    <div className={`flex gap-3 p-3.5 rounded-lg border
                     ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.text}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-xs font-semibold ${config.text} mb-0.5`}>
            {title}
          </p>
        )}
        <div className={`text-xs leading-relaxed ${config.text}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════
// COMPONENT 11: SettingsBadge
// Colored label tags used in tables and rows
// ═══════════════════════════════

interface SettingsBadgeProps {
  children: React.ReactNode
  color?: 'blue'|'green'|'amber'|'red'|'purple'|'slate'
}

export const SettingsBadge = ({ children, color = 'slate' }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
  }[color]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                      text-[11px] font-medium border ${colors}`}>
      {children}
    </span>
  )
}

// ═══════════════════════════════
// COMPONENT 12: SettingsTable
// Consistent table for all settings list views
// ═══════════════════════════════

interface SettingsTableColumn<T> {
  key: string
  header: string
  width?: string
  render: (row: T) => React.ReactNode
}

interface SettingsTableProps<T> {
  columns: SettingsTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  isLoading?: boolean
}

export const SettingsTable = <T,>({
  columns, data, keyExtractor, onRowClick, emptyState, isLoading
}) => (
  <div className="overflow-hidden rounded-lg border border-slate-200">
    <table className="w-full">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          {columns.map(col => (
            <th
              key={col.key}
              style={{ width: col.width }}
              className="px-4 py-2.5 text-left text-[11px] font-semibold
                         text-slate-500 uppercase tracking-wide
                         whitespace-nowrap"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {isLoading && (
          [...Array(3)].map((_, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">
                  <div className="h-3.5 bg-slate-100 rounded animate-pulse
                                  w-3/4" />
                </td>
              ))}
            </tr>
          ))
        )}
        {!isLoading && data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-10 text-center">
              {emptyState || (
                <p className="text-sm text-slate-400">No items found</p>
              )}
            </td>
          </tr>
        )}
        {!isLoading && data.map(row => (
          <tr
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            className={`
              transition-colors duration-100
              ${onRowClick
                ? 'cursor-pointer hover:bg-slate-50'
                : ''}
            `}
          >
            {columns.map(col => (
              <td key={col.key}
                className="px-4 py-3 text-sm text-slate-700
                           whitespace-nowrap">
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// ═══════════════════════════════
// COMPONENT 13: SettingsSectionHeader
// The group label above a set of cards in the main content area
// ═══════════════════════════════

export const SettingsSectionHeader = ({
  title, description
}: { title: string; description?: string }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    {description && (
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    )}
  </div>
)

// ═══════════════════════════════
// COMPONENT 14: SettingsColorInput
// Color picker with hex input — for brand settings
// ═══════════════════════════════

interface SettingsColorInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export const SettingsColorInput = ({ value, onChange, label }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex-shrink-0">
      <div
        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer
                   shadow-sm overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />
      </div>
    </div>
    <input
      type="text"
      value={value}
      onChange={e => {
        if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value)
      }}
      className="w-24 h-9 rounded-lg border border-slate-200 px-3 text-xs
                 font-mono text-slate-700 focus:ring-2 focus:ring-blue-500/20
                 focus:border-blue-500 outline-none bg-white"
      placeholder="#000000"
    />
    {label && <span className="text-xs text-slate-400">{label}</span>}
  </div>
)

// ═══════════════════════════════
// COMPONENT 15: SettingsNumberInput
// Stepper input for number settings
// ═══════════════════════════════

interface SettingsNumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string  // e.g., "days", "minutes", "%"
  prefix?: string  // e.g., "ETB"
}

export const SettingsNumberInput = ({
  value, onChange, min = 0, max, step = 1, suffix, prefix
}) => (
  <div className="flex items-center gap-0 h-9 w-fit">
    {prefix && (
      <span className="h-full px-2.5 flex items-center text-xs text-slate-500
                       bg-slate-50 border border-r-0 border-slate-200
                       rounded-l-lg">
        {prefix}
      </span>
    )}
    <input
      type="number"
      value={value}
      onChange={e => {
        const n = parseFloat(e.target.value)
        if (!isNaN(n) && n >= (min ?? -Infinity) && n <= (max ?? Infinity)) {
          onChange(n)
        }
      }}
      min={min}
      max={max}
      step={step}
      className={`
        h-9 w-20 border border-slate-200 text-sm text-slate-900 text-center
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none
        bg-white
        ${prefix ? '' : 'rounded-l-lg'}
        ${suffix ? '' : 'rounded-r-lg'}
      `}
    />
    {suffix && (
      <span className="h-full px-2.5 flex items-center text-xs text-slate-500
                       bg-slate-50 border border-l-0 border-slate-200
                       rounded-r-lg whitespace-nowrap">
        {suffix}
      </span>
    )}
  </div>
)
