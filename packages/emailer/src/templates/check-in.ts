export function renderCheckInReminder(args: { link?: string }): { subject: string; html: string } {
  const subject = 'Please check in'
  const html = `
    <h2>Quick check-in</h2>
    <p>How did this week go? ${args.link ? `<a href="${args.link}">Submit check-in</a>` : ''}</p>
  `
  return { subject, html }
}

