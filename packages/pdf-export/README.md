# @dct/pdf-export

Reusable PDF export block for DCT Micro-Apps. Generates a high‑quality, DOM‑consistent PDF from any section of your page and provides optional server‑side storage.

## Features

- Export any DOM section to A4 PDF with proper pagination
- High‑quality rendering via html2canvas + jsPDF
- Simple React block that wraps your content
- Print‑friendly classes interop (e.g. `print-hidden`, `print-keep-together`)
- Optional server action to persist PDFs to `artifacts/pdf`

## Installation

```bash
npm install @dct/pdf-export
```

Peer deps:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import { PdfExportBlock } from '@dct/pdf-export'

export default function Example() {
  return (
    <PdfExportBlock title="Proposal Preview" filename="proposal.pdf">
      <article className="bg-white p-6">
        <h1 className="text-2xl font-semibold">My Proposal</h1>
        <p className="mt-3 text-gray-700">High‑quality content…</p>
      </article>
    </PdfExportBlock>
  )
}
```

## API

- `PdfExportBlock`
  - `title?: string` — Header label for the block
  - `filename?: string` — Download filename (default `export.pdf`)
  - `targetId?: string` — Use an explicit DOM id instead of auto one
  - `onSuccess?: (blob: Blob) => void` — Called after successful export
  - `onError?: (error: Error) => void` — Called on export failure
  - `actions?.extraActions?: React.ReactNode` — Mount extra action buttons

- `generatePdfFromElement(elementOrId, { filename })` — Low‑level helper

- `storePdfBase64(base64, filename)` — Server action to persist PDFs to `artifacts/pdf` (returns `{ ok, filepath }`).

## Notes

- For best results, ensure your page includes print utilities as in `app/globals.tailwind.css` (e.g., hide buttons with `print-hidden`).
- For very long content, the block adds additional pages automatically.
- If you already use a custom export hook, you can ignore the helper and call yours inside `onSuccess`.
