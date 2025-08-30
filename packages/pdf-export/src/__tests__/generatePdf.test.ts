/**
 * Mocked performance test for generatePdfFromElement
 * Ensures pagination logic executes and export completes quickly.
 */
import { generatePdfFromElement } from '../utils/generatePdf'

// Mock html2canvas to return a large canvas to force multiple pages
jest.mock('html2canvas', () => {
  return {
    __esModule: true,
    default: jest.fn(async () => {
      const canvas = Object.assign(document.createElement('canvas'), { width: 2000, height: 6000 })
      const ctx = canvas.getContext('2d')
      ctx?.fillRect(0, 0, 10, 10)
      return canvas
    })
  }
})

// Mock jsPDF to track calls but return a real Blob
const addImage = jest.fn()
const addPage = jest.fn()
const output = jest.fn(() => new Blob(["%PDF-1.4"], { type: 'application/pdf' }))

jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: function MockJsPDF(this: any) {
      this.addImage = addImage
      this.addPage = addPage
      this.output = output
      return this
    }
  }
})

beforeAll(() => {
  // JSDOM stubs for URL APIs used by generatePdfFromElement
  // @ts-ignore
  global.URL.createObjectURL = jest.fn(() => 'blob:mock')
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
  document.body.innerHTML = ''
})

test('exports multi-page content quickly with pagination', async () => {
  const host = document.createElement('div')
  host.id = 'pdf-host'
  host.style.width = '1000px'
  host.style.height = '5000px'
  document.body.appendChild(host)

  const start = Date.now()
  const blob = await generatePdfFromElement('pdf-host', { filename: 'test.pdf' })
  const elapsed = Date.now() - start

  expect(blob).toBeInstanceOf(Blob)
  expect(addImage).toHaveBeenCalled()
  // Expect at least one extra page for tall content
  expect(addPage.mock.calls.length).toBeGreaterThan(0)
  // Soft performance budget: should complete under 1500ms in mocked env
  expect(elapsed).toBeLessThan(1500)
})

test('throws when element not found', async () => {
  await expect(generatePdfFromElement('missing')).rejects.toThrow('Element not found')
})

