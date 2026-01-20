'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme()

  if (!resolvedTheme) {
    return (
      <Image
        src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
        width={36}
        height={36}
        alt="Loading theme toggle"
      />
    )
  }

  if (resolvedTheme === 'dark') {
    return (
      <Sun
        className="cursor-pointer text-yellow-400 hover:rotate-180 transition-transform"
        onClick={() => setTheme('light')}
      />
    )
  }

  return (
    <Moon
      className="cursor-pointer text-slate-300 hover:rotate-180 transition-transform"
      onClick={() => setTheme('dark')}
    />
  )
}
