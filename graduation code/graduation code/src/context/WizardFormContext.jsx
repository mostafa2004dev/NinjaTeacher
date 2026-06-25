
import { createContext, useContext, useState } from 'react'

const WizardFormContext = createContext(null)

const initialJobDetails = {
  schoolName: '',
  location: '',
  // deadline: '', // شيلتها عشان مش محتاجاها دلوقتي
  positionTitle: '',
  subjects: [],
  required_stage: '',
  requiredExperience: '',
    startDate: '',
  qualifications: '',
  salaryRange: '',
  additionalInfo: '',
}

const initialSelections = {
  teachingStyle: [],
  classroomEnergy: [],
  leadershipStyle: [],
  communicationStyle: [],
  problemSolving: [],
}

export function WizardFormProvider({ children }) {
  const [jobDetails, setJobDetails] = useState(initialJobDetails)
  const [selections, setSelections] = useState(initialSelections)

  function setJobField(field, value) {
    setJobDetails((current) => ({ ...current, [field]: value }))
  }

  function setSelection(key, value) {
    setSelections((current) => ({ ...current, [key]: value }))
  }

  const value = {
      jobDetails,
      selections,
      setJobField,
      setSelection,
    };
   // [jobDetails, selections],
  

  return <WizardFormContext.Provider value={value}>{children}</WizardFormContext.Provider>
}

export function useWizardForm() {
  const context = useContext(WizardFormContext)
  if (!context) {
    throw new Error('useWizardForm must be used within WizardFormProvider')
  }
  return context
}
