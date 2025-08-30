export type { EmailResult, EmailProvider } from './service';
export {
  sendRaw,
  sendInvite,
  sendConfirmation,
  sendWelcome,
  sendWeeklyRecap,
  sendPlanReady,
  sendCheckInReminder,
} from './service';

export {
  wrapHtml,
} from './templates/base';

export {
  renderInvite,
} from './templates/invite';

export {
  renderConfirmation,
} from './templates/confirmation';

export {
  renderWelcome,
} from './templates/welcome';

export {
  renderWeeklyRecap,
} from './templates/weekly-recap';

export {
  renderPlanReady,
} from './templates/plan-ready';

export {
  renderCheckInReminder,
} from './templates/check-in';

