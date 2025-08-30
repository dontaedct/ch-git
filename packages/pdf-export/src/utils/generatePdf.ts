import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface GeneratePdfOptions {
  filename?: string
}

export async function generatePdfFromElement(
  elementOrId: HTMLElement | string,
  options: GeneratePdfOptions = {}
): Promise<Blob> {
  const filename = options.filename ?? 'export.pdf'

  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId

  if (!element) {
    throw new Error('Element not found for PDF export')
  }

  await document.fonts?.ready?.catch(() => undefined)

  const imgs = element.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise<void>(resolve => { img.onload = img.onerror = () => resolve() })
  }))

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    onclone: (doc) => {
      const target = typeof elementOrId === 'string' ? doc.getElementById(elementOrId) : null
      const node = target ?? element
      if (!node) return
      const all = node.querySelectorAll('*')
      all.forEach(el => {
        const e = el as HTMLElement
        if (!e.style.fontFamily) e.style.fontFamily = 'Inter, system-ui, Segoe UI, Roboto, sans-serif'
      })
    }
  })

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Failed to render content for PDF')
  }

  const imgWidth = 210
  const pageHeight = 295
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0

  const pdf = new jsPDF('p', 'mm', 'a4')
  const dataUrl = canvas.toDataURL('image/png')
  pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  const blob = pdf.output('blob')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return blob
}

