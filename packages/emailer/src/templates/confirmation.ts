function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString()
}

export function renderConfirmation(args: { session: { title: string; starts_at: string; location?: string } }): { subject: string; html: string } {
  const when = fmtWhen(args.session.starts_at)
  const subject = `Confirmed: ${args.session.title}`
  const html = `
    <h2>Confirmed: ${args.session.title}</h2>
    <p><strong>When:</strong> ${when}</p>
    ${args.session.location ? `<p><strong>Where:</strong> ${args.session.location}</p>` : ''}
  `
  return { subject, html }
}

