import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PdfExportBlock } from '../components/PdfExportBlock'

// Mock the low-level exporter so we don't rely on html2canvas/jsPDF here
const mockGenerate = jest.fn(() => Promise.resolve(new Blob(["%PDF-1.4"], { type: 'application/pdf' })))
jest.mock('../utils/generatePdf', () => ({
  generatePdfFromElement: (...args: any[]) => (mockGenerate as any)(...args)
}))

test('renders and triggers PDF download on click', async () => {
  const onSuccess = jest.fn()
  render(
    <PdfExportBlock title="Preview" filename="demo.pdf" onSuccess={onSuccess}>
      <div>Printable content</div>
    </PdfExportBlock>
  )

  const button = screen.getByRole('button', { name: /download as pdf/i })
  fireEvent.click(button)

  await waitFor(() => expect(mockGenerate).toHaveBeenCalled())
  expect(onSuccess).toHaveBeenCalled()
})

