import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Institution } from "@/types/types"

interface InstitutionCardProps {
  institution: Institution
}

/**
 * Card component for displaying institution information
 * @param {InstitutionCardProps} props - Component props
 * @param {Institution} props.institution - The institution data to display
 * @returns {JSX.Element} Institution card component
 */
const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{institution.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600">{institution.description}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Variables:</span> {institution.stats?.variables || 0}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Parameters:</span> {institution.stats?.parameters || 0}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Tests:</span> {institution.stats?.tests || 0}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/institutions/${institution.id}`} passHref>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default InstitutionCard

