export function renderWeeklyRecap(args: { summaryHtml: string }): { subject: string; html: string } {
  const subject = 'Your weekly recap'
  const html = `<h2>Your weekly recap</h2>${args.summaryHtml}`
  return { subject, html }
}

