import type React from "react"

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer component
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 p-4 text-center text-gray-600 mt-auto">
      <div className="container mx-auto">
        <p>© {new Date().getFullYear()} OpenFisca Editor. All rights reserved.</p>
        <p className="text-sm mt-1">
          <a
            href="https://openfisca.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Powered by OpenFisca
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

