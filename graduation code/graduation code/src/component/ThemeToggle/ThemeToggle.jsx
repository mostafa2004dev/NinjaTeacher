import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext/ThemeContext'

const OPTIONS = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
]

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/10 rounded-full p-0.5 transition-colors duration-300">
            {OPTIONS.map(({ value, icon: Icon, label }) => {
                const active = theme === value
                return (
                    <button
                        key={value}
                        onClick={() => setTheme(value)}
                        title={label}
                        aria-label={`Switch to ${label} mode`}
                        className={`
              relative flex items-center justify-center w-7 h-7 rounded-full
              transition-all duration-300 ease-in-out
              ${active
                                ? 'bg-white dark:bg-white/20 text-[#6d4cff] dark:text-white shadow-sm scale-100'
                                : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 scale-90'
                            }
            `}
                    >
                        <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
                    </button>
                )
            })}
        </div>
    )
}