export function renderPlanReady(args: { weekStartISO: string; viewUrl?: string }) {
  const day = new Date(args.weekStartISO).toLocaleDateString()
  const subject = 'Your plan is ready'
  const html = `
    <h2>Your plan is ready</h2>
    <p>Week starting ${day}.</p>
    ${args.viewUrl ? `<p><a href="${args.viewUrl}">View your plan</a></p>` : ''}
  `
  return { subject, html }
}

