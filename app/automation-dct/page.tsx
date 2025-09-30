import { Metadata } from 'next'
import { AutomationDCTHomepage } from './components/AutomationDCTHomepage'
import './styles/automation-dct.css'

export const metadata: Metadata = {
  title: 'Automation DCT - Custom Web App Automations for Small Business',
  description: 'Automation DCT specializes in creating custom web app automations to streamline business operations for small businesses. Get your automation solution in 7 days or less.',
  keywords: ['automation', 'web apps', 'small business', 'business operations', 'custom software', 'workflow automation'],
}

export default function Page() {
  return <AutomationDCTHomepage />
}
