'use client'

import { useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface UsePdfExportOptions {
  filename?: string
  onSuccess?: (blob: Blob) => void
  onError?: (error: Error) => void
  onEmailRequest?: (blob: Blob) => void
}

export function usePdfExport(options: UsePdfExportOptions = {}) {
  const {
    filename = 'consultation-report.pdf',
    onSuccess,
    onError,
    onEmailRequest
  } = options

  const generatePdf = useCallback(async (elementId: string) => {
    const toastId = toast.loading('Preparing PDF...', {
      description: 'This may take a moment for complex layouts'
    })

    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`)
      }

      // Pre-load fonts and wait for images to load
      await document.fonts.ready
      const images = element.querySelectorAll('img')
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => {
          img.onload = img.onerror = resolve
        })
      }))

      // Create canvas from DOM element with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for better quality
        useCORS: true,
        allowTaint: false, // Changed to false for better security
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        // Ensure fonts are loaded and styles are preserved
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement) {
            // Ensure all text is rendered with proper fonts
            clonedElement.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            clonedElement.style.fontSize = '16px'
            clonedElement.style.lineHeight = '1.5'
            
            // Fix hairline borders by ensuring they're at least 1px
            const allElements = clonedElement.querySelectorAll('*')
            allElements.forEach(el => {
              const htmlEl = el as HTMLElement
              const computedStyle = window.getComputedStyle(el)
              
              // Fix hairline borders
              if (computedStyle.borderWidth && computedStyle.borderWidth.includes('0.5px')) {
                htmlEl.style.borderWidth = '1px'
              }
              
              // Ensure consistent font rendering
              if (!htmlEl.style.fontFamily) {
                htmlEl.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }
              
              // Fix potential color contrast issues
              if (computedStyle.color === 'rgb(0, 0, 0)' && computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
                htmlEl.style.color = '#111111'
              }
            })
          }
        }
      })

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to generate canvas from element')
      }

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if content is longer
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Convert to blob
      const pdfBlob = pdf.output('blob')

      // Success notification
      toast.success('PDF ready for download!', {
        id: toastId,
        description: `${filename} has been generated successfully`
      })

      // Trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Call success callback
      onSuccess?.(pdfBlob)

      return pdfBlob
    } catch (error) {
      console.error('PDF generation error:', error)
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to generate PDF'
      let errorDescription = 'Please try again or contact support if the issue persists'
      
      if (error instanceof Error) {
        if (error.message.includes('Element with ID') && error.message.includes('not found')) {
          errorMessage = 'Content not ready'
          errorDescription = 'Please wait for the page to fully load before generating PDF'
        } else if (error.message.includes('Failed to generate canvas')) {
          errorMessage = 'Canvas generation failed'
          errorDescription = 'The content may be too complex. Try refreshing the page and try again'
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error'
          errorDescription = 'Check your internet connection and try again'
        }
      }
      
      toast.error(errorMessage, {
        id: toastId,
        description: errorDescription
      })

      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred during PDF generation')
      onError?.(errorObj)
      
      throw errorObj
    }
  }, [filename, onSuccess, onError])

  const requestEmail = useCallback(async (elementId: string) => {
    try {
      const blob = await generatePdf(elementId)
      
      // Emit event for email request
      const emailEvent = new CustomEvent('pdf:emailRequest', {
        detail: { blob, filename }
      })
      window.dispatchEvent(emailEvent)
      
      toast.success('Email request submitted', {
        description: 'You will receive your PDF via email shortly'
      })

      onEmailRequest?.(blob)
    } catch (error) {
      // Error already handled in generatePdf
      console.error('Email request failed:', error)
    }
  }, [generatePdf, filename, onEmailRequest])

  return {
    generatePdf,
    requestEmail
  }
}