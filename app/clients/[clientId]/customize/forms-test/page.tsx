import { Metadata } from 'next'
import { FormsCustomizeTestPage } from './components/FormsCustomizeTestPage'
import '../../../../styles/dashboard-shared.css'

export const metadata: Metadata = {
  title: 'Form Builder Test - DCT Micro-Apps Platform | Client-Scoped Form Creation',
  description: 'Create and customize forms specifically for the selected client. Client-scoped form builder with 21 field types, validation, and real-time preview.',
  keywords: ['form builder', 'client forms', 'form customization', '21 field types', 'validation', 'real-time preview'],
}

export default function Page() {
  return <FormsCustomizeTestPage />
}
