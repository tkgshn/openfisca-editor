import type React from "react"
import type { Institution } from "@/types/types"
import Header from "@/components/layout/Header"

interface InstitutionHeaderProps {
  institution: Institution
}

/**
 * Header component specific to institution pages
 * @param {InstitutionHeaderProps} props - Component props
 * @param {Institution} props.institution - The institution data
 * @returns {JSX.Element} Institution header component
 */
const InstitutionHeader: React.FC<InstitutionHeaderProps> = ({ institution }) => {
  return <Header title={institution.name} />
}

export default InstitutionHeader

