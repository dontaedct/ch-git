import { Metadata } from 'next'
import { FramerTestPage } from './components/FramerTestPage'
import './styles/framer-test.css'

export const metadata: Metadata = {
  title: 'Framer-Inspired Test Page | My App',
  description: 'A high-quality test page inspired by Framer.com design patterns and aesthetics.',
  keywords: ['test', 'framer', 'design', 'ui', 'ux'],
}

export default function Page() {
  return <FramerTestPage />
}
