"use server"

import { promises as fs } from 'node:fs'
import path from 'node:path'

export interface StorePdfResult {
  ok: boolean
  filepath?: string
  error?: string
}

export async function storePdfBase64(base64: string, filename = `export-${Date.now()}.pdf`): Promise<StorePdfResult> {
  try {
    const buffer = Buffer.from(base64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
    const outDir = path.join(process.cwd(), 'artifacts', 'pdf')
    await fs.mkdir(outDir, { recursive: true })
    const file = path.join(outDir, filename)
    await fs.writeFile(file, buffer)
    return { ok: true, filepath: file }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return { ok: false, error: msg }
  }
}

