"use client"

import type React from "react"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Institution } from "@/types/types"
import InstitutionHeader from "./InstitutionHeader"
import TestRunnerPanel from "@/components/test/TestRunnerPanel"
import SimulationPanel from "@/components/simulation/SimulationPanel"
import { useTestContext } from "@/contexts/TestContext"

interface InstitutionDetailsProps {
  institution: Institution
}

/**
 * Component for displaying detailed institution information and tabs
 * @param {InstitutionDetailsProps} props - Component props
 * @param {Institution} props.institution - The institution data
 * @returns {JSX.Element} Institution details component
 */
const InstitutionDetails: React.FC<InstitutionDetailsProps> = ({ institution }) => {
  const { runTests } = useTestContext()

  // Run tests automatically when the institution is loaded
  useEffect(() => {
    runTests(institution.id)
  }, [institution.id, runTests])

  return (
    <div className="flex flex-col h-screen">
      <InstitutionHeader institution={institution} />
      <div className="flex-grow p-4 overflow-auto">
        <Tabs defaultValue="variables" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
          </TabsList>
          <TabsContent value="variables">
            <h2 className="text-2xl font-bold mb-4">Variables</h2>
            {/* Variables content */}
          </TabsContent>
          <TabsContent value="parameters">
            <h2 className="text-2xl font-bold mb-4">Parameters</h2>
            {/* Parameters content */}
          </TabsContent>
          <TabsContent value="tests">
            <h2 className="text-2xl font-bold mb-4">Tests</h2>
            <TestRunnerPanel institutionId={institution.id} />
          </TabsContent>
          <TabsContent value="simulation">
            <h2 className="text-2xl font-bold mb-4">Simulation</h2>
            <SimulationPanel institutionId={institution.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default InstitutionDetails

