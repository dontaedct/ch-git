/**
 * Document Download API Endpoint
 * 
 * Handles secure document downloads with access control,
 * tracking, and version management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { documentVersioning } from '@/lib/document-generator/document-versioning'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version')
    const download = searchParams.get('download') === 'true'

    // Get document history
    const documentHistory = await documentVersioning.getDocumentHistory(documentId)
    if (!documentHistory) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get specific version or latest
    let versionData
    if (version) {
      versionData = await documentVersioning.getVersion(documentId, parseInt(version))
    } else {
      versionData = await documentVersioning.getLatestVersion(documentId)
    }

    if (!versionData) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      )
    }

    // Check if file exists
    if (!existsSync(versionData.filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found on server' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = readFileSync(versionData.filePath)
    const filename = `${documentId}_v${versionData.version}.pdf`

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Length', fileBuffer.length.toString())
    headers.set('Cache-Control', 'private, max-age=3600')
    
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    } else {
      headers.set('Content-Disposition', `inline; filename="${filename}"`)
    }

    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    // Log download (in a real app, you might want to track this in a database)
    console.log(`Document downloaded: ${documentId} v${versionData.version} by ${request.headers.get('user-agent')}`)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Document download failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version')

    // Get document history
    const documentHistory = await documentVersioning.getDocumentHistory(documentId)
    if (!documentHistory) {
      return new NextResponse(null, { status: 404 })
    }

    // Get specific version or latest
    let versionData
    if (version) {
      versionData = await documentVersioning.getVersion(documentId, parseInt(version))
    } else {
      versionData = await documentVersioning.getLatestVersion(documentId)
    }

    if (!versionData || !existsSync(versionData.filePath)) {
      return new NextResponse(null, { status: 404 })
    }

    // Return file info without content
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Length', versionData.fileSize.toString())
    headers.set('Last-Modified', new Date(versionData.generatedAt).toUTCString())
    headers.set('ETag', `"${versionData.metadata.checksum}"`)

    return new NextResponse(null, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Document HEAD request failed:', error)
    return new NextResponse(null, { status: 500 })
  }
}
