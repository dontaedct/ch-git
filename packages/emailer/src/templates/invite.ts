function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString()
}

export function renderInvite(args: { session: { title: string; starts_at: string; location?: string }; stripe_link?: string }) {
  const when = fmtWhen(args.session.starts_at)
  const subject = `You're invited: ${args.session.title}`
  const html = `
    <h2>You're invited: ${args.session.title}</h2>
    <p><strong>When:</strong> ${when}</p>
    ${args.session.location ? `<p><strong>Where:</strong> ${args.session.location}</p>` : ''}
    ${args.stripe_link ? `<p><a href="${args.stripe_link}">Pay to reserve your spot</a></p>` : ''}
  `
  return { subject, html }
}

