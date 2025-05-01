import type React from "react"
import { useI18n } from "@/lib/i18n"

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer component
 */
const Footer: React.FC = () => {
  const { t } = useI18n()
  return (
    <footer className="bg-gray-100 p-4 text-center text-gray-600 mt-auto">
      <div className="container mx-auto">
        <p>© {new Date().getFullYear()} OpenFisca Editor. All rights reserved.</p>
        <p className="text-sm mt-1 flex items-center justify-center gap-2">
          <a
            href="https://openfisca.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Powered by OpenFisca
          </a>
          <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md text-xs font-medium ml-2">
            {t.common.demo}
          </span>
        </p>
      </div>
    </footer>
  )
}

export default Footer

