export function renderWelcome(args: { coachName?: string }) {
  const subject = 'Welcome to Your Micro App'
  const html = `
    <h2>Welcome to Your Micro App</h2>
    <p>${args.coachName ? `${args.coachName} ` : ''}will follow up with your next steps shortly.</p>
  `
  return { subject, html }
}

