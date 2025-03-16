"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarItem {
  name: string
  href: string
  icon?: React.ReactNode
}

interface SidebarProps {
  items: SidebarItem[]
}

/**
 * Sidebar navigation component
 * @param {SidebarProps} props - Component props
 * @param {SidebarItem[]} props.items - Navigation items to display
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-50 h-full border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-md ${
                    isActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

