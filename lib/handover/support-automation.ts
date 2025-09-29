export interface SupportTicket {
  id: string;
  clientId: string;
  userId: string;
  title: string;
  description: string;
  category: 'technical' | 'training' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_response' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  attachments: string[];
  conversation: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'client' | 'support' | 'system';
  message: string;
  timestamp: Date;
  isInternal: boolean;
  attachments: string[];
}

export interface AutomatedResponse {
  id: string;
  trigger: string;
  conditions: any;
  responseTemplate: string;
  escalationRules?: EscalationRule[];
  followUpActions?: FollowUpAction[];
}

export interface EscalationRule {
  condition: string;
  delay: number; // in minutes
  escalateTo: 'manager' | 'technical_team' | 'billing_team';
  notificationTemplate: string;
}

export interface FollowUpAction {
  action: 'send_email' | 'create_task' | 'schedule_call' | 'update_status';
  delay: number; // in minutes
  parameters: any;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  averageResponseTime: number; // in minutes
  averageResolutionTime: number; // in minutes
  firstResponseRate: number; // percentage within SLA
  resolutionRate: number; // percentage within SLA
  customerSatisfaction: number; // 1-5 scale
  automationRate: number; // percentage of tickets handled automatically
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  searchKeywords: string[];
  popularity: number;
  lastUpdated: Date;
  clientSpecific: boolean;
  clientId?: string;
}

export class SupportAutomation {
  private tickets: Map<string, SupportTicket> = new Map();
  private automatedResponses: Map<string, AutomatedResponse> = new Map();
  private knowledgeBase: Map<string, KnowledgeBaseArticle> = new Map();
  private slaThresholds = {
    firstResponse: 60, // minutes
    resolution: 24 * 60 // minutes
  };

  constructor() {
    this.initializeAutomatedResponses();
    this.initializeKnowledgeBase();
  }

  async createSupportTicket(
    clientId: string,
    userId: string,
    title: string,
    description: string,
    category: string,
    priority: string = 'medium'
  ): Promise<SupportTicket> {
    const ticketId = `ticket_${Date.now()}`;

    const ticket: SupportTicket = {
      id: ticketId,
      clientId,
      userId,
      title,
      description,
      category: category as any,
      priority: priority as any,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      attachments: [],
      conversation: []
    };

    this.tickets.set(ticketId, ticket);

    // Auto-categorize and tag
    await this.autoCategorizeTicket(ticket);
    await this.autoTagTicket(ticket);

    // Check for automated responses
    await this.processAutomatedResponse(ticket);

    // Log ticket creation
    await this.logSupportEvent(ticketId, 'ticket_created', {
      clientId,
      userId,
      category,
      priority
    });

    return ticket;
  }

  private async autoCategorizeTicket(ticket: SupportTicket): Promise<void> {
    const description = ticket.description.toLowerCase();
    const title = ticket.title.toLowerCase();
    const text = `${title} ${description}`;

    // Simple keyword-based categorization
    const categoryKeywords = {
      technical: ['error', 'bug', 'crash', 'not working', 'broken', 'issue', 'problem'],
      training: ['how to', 'tutorial', 'learn', 'guide', 'help', 'explain', 'show me'],
      billing: ['invoice', 'payment', 'billing', 'subscription', 'refund', 'charge'],
      feature_request: ['feature', 'request', 'suggestion', 'improvement', 'add', 'new'],
      bug_report: ['bug', 'error', 'crash', 'exception', 'fault', 'defect']
    };

    let bestMatch = { category: 'general', score: 0 };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }

    if (bestMatch.score > 0) {
      ticket.category = bestMatch.category as any;
    }
  }

  private async autoTagTicket(ticket: SupportTicket): Promise<void> {
    const description = ticket.description.toLowerCase();
    const title = ticket.title.toLowerCase();
    const text = `${title} ${description}`;

    const tags = [];

    // Feature-specific tags
    const featureTags = {
      'authentication': ['login', 'password', 'auth', 'signin', 'logout'],
      'dashboard': ['dashboard', 'overview', 'summary', 'home'],
      'reports': ['report', 'analytics', 'data', 'export', 'chart'],
      'users': ['user', 'account', 'profile', 'team', 'member'],
      'settings': ['setting', 'config', 'preference', 'option'],
      'integration': ['api', 'webhook', 'sync', 'connect', 'import'],
      'mobile': ['mobile', 'phone', 'app', 'ios', 'android'],
      'performance': ['slow', 'loading', 'speed', 'performance', 'timeout']
    };

    for (const [tag, keywords] of Object.entries(featureTags)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    // Urgency indicators
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
      tags.push('urgent');
      ticket.priority = 'urgent';
    }

    ticket.tags = tags;
  }

  private async processAutomatedResponse(ticket: SupportTicket): Promise<void> {
    for (const [_, response] of this.automatedResponses) {
      if (await this.matchesConditions(ticket, response.conditions)) {
        await this.sendAutomatedResponse(ticket, response);
        break;
      }
    }
  }

  private async matchesConditions(ticket: SupportTicket, conditions: any): Promise<boolean> {
    if (conditions.category && ticket.category !== conditions.category) {
      return false;
    }

    if (conditions.keywords) {
      const text = `${ticket.title} ${ticket.description}`.toLowerCase();
      return conditions.keywords.some((keyword: string) => text.includes(keyword.toLowerCase()));
    }

    if (conditions.tags) {
      return conditions.tags.some((tag: string) => ticket.tags.includes(tag));
    }

    return true;
  }

  private async sendAutomatedResponse(
    ticket: SupportTicket,
    response: AutomatedResponse
  ): Promise<void> {
    const message = this.personalizeResponse(response.responseTemplate, ticket);

    const supportMessage: SupportMessage = {
      id: `msg_${Date.now()}`,
      ticketId: ticket.id,
      senderId: 'system',
      senderType: 'system',
      message,
      timestamp: new Date(),
      isInternal: false,
      attachments: []
    };

    ticket.conversation.push(supportMessage);
    ticket.updatedAt = new Date();

    // Process follow-up actions
    if (response.followUpActions) {
      for (const action of response.followUpActions) {
        setTimeout(() => {
          this.executeFollowUpAction(ticket, action);
        }, action.delay * 60 * 1000);
      }
    }

    // Check escalation rules
    if (response.escalationRules) {
      for (const rule of response.escalationRules) {
        setTimeout(() => {
          this.processEscalation(ticket, rule);
        }, rule.delay * 60 * 1000);
      }
    }

    await this.logSupportEvent(ticket.id, 'automated_response_sent', {
      responseId: response.id,
      message
    });
  }

  private personalizeResponse(template: string, ticket: SupportTicket): string {
    return template
      .replace(/\{ticketId\}/g, ticket.id)
      .replace(/\{clientId\}/g, ticket.clientId)
      .replace(/\{userId\}/g, ticket.userId)
      .replace(/\{title\}/g, ticket.title)
      .replace(/\{category\}/g, ticket.category);
  }

  private async executeFollowUpAction(
    ticket: SupportTicket,
    action: FollowUpAction
  ): Promise<void> {
    switch (action.action) {
      case 'send_email':
        await this.sendFollowUpEmail(ticket, action.parameters);
        break;
      case 'create_task':
        await this.createFollowUpTask(ticket, action.parameters);
        break;
      case 'schedule_call':
        await this.scheduleFollowUpCall(ticket, action.parameters);
        break;
      case 'update_status':
        ticket.status = action.parameters.status;
        ticket.updatedAt = new Date();
        break;
    }
  }

  private async processEscalation(
    ticket: SupportTicket,
    rule: EscalationRule
  ): Promise<void> {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return; // Don't escalate resolved tickets
    }

    const shouldEscalate = await this.shouldEscalate(ticket, rule.condition);

    if (shouldEscalate) {
      ticket.assignedTo = rule.escalateTo;
      ticket.priority = ticket.priority === 'urgent' ? 'urgent' : 'high';
      ticket.updatedAt = new Date();

      await this.sendEscalationNotification(ticket, rule);
      await this.logSupportEvent(ticket.id, 'escalated', {
        escalatedTo: rule.escalateTo,
        reason: rule.condition
      });
    }
  }

  private async shouldEscalate(ticket: SupportTicket, condition: string): Promise<boolean> {
    const now = Date.now();
    const created = ticket.createdAt.getTime();
    const ageInMinutes = (now - created) / (60 * 1000);

    switch (condition) {
      case 'no_response':
        return ageInMinutes > this.slaThresholds.firstResponse && ticket.conversation.length === 0;
      case 'unresolved':
        return ageInMinutes > this.slaThresholds.resolution && ticket.status !== 'resolved';
      case 'high_priority':
        return ticket.priority === 'urgent' && ageInMinutes > 30;
      default:
        return false;
    }
  }

  async searchKnowledgeBase(query: string, clientId?: string): Promise<KnowledgeBaseArticle[]> {
    const results: KnowledgeBaseArticle[] = [];
    const queryLower = query.toLowerCase();

    for (const article of this.knowledgeBase.values()) {
      // Skip client-specific articles if not for this client
      if (article.clientSpecific && article.clientId !== clientId) {
        continue;
      }

      const searchText = `${article.title} ${article.content} ${article.searchKeywords.join(' ')}`.toLowerCase();

      if (searchText.includes(queryLower)) {
        results.push(article);
      }
    }

    // Sort by popularity and relevance
    return results.sort((a, b) => b.popularity - a.popularity).slice(0, 10);
  }

  async suggestKnowledgeBaseArticles(ticket: SupportTicket): Promise<KnowledgeBaseArticle[]> {
    const searchQuery = `${ticket.title} ${ticket.description}`;
    return this.searchKnowledgeBase(searchQuery, ticket.clientId);
  }

  async updateTicketStatus(
    ticketId: string,
    status: string,
    message?: string
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = status as any;
    ticket.updatedAt = new Date();

    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }

    if (message) {
      const supportMessage: SupportMessage = {
        id: `msg_${Date.now()}`,
        ticketId,
        senderId: 'system',
        senderType: 'system',
        message,
        timestamp: new Date(),
        isInternal: false,
        attachments: []
      };

      ticket.conversation.push(supportMessage);
    }

    await this.logSupportEvent(ticketId, 'status_updated', {
      newStatus: status,
      message
    });
  }

  async addMessageToTicket(
    ticketId: string,
    senderId: string,
    senderType: 'client' | 'support' | 'system',
    message: string,
    isInternal: boolean = false,
    attachments: string[] = []
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const supportMessage: SupportMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId,
      senderType,
      message,
      timestamp: new Date(),
      isInternal,
      attachments
    };

    ticket.conversation.push(supportMessage);
    ticket.updatedAt = new Date();

    if (senderType === 'client') {
      ticket.status = 'open'; // Reopen if client responds
    }

    await this.logSupportEvent(ticketId, 'message_added', {
      senderId,
      senderType,
      messageLength: message.length
    });
  }

  async getSupportMetrics(clientId?: string): Promise<SupportMetrics> {
    const tickets = Array.from(this.tickets.values())
      .filter(ticket => !clientId || ticket.clientId === clientId);

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    const responseTimes = tickets
      .filter(t => t.conversation.length > 0)
      .map(t => {
        const firstResponse = t.conversation.find(m => m.senderType === 'support' || m.senderType === 'system');
        if (firstResponse) {
          return firstResponse.timestamp.getTime() - t.createdAt.getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    const averageResponseTime = responseTimes.length > 0 ?
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (60 * 1000) : 0;

    const resolutionTimes = tickets
      .filter(t => t.resolvedAt)
      .map(t => t.resolvedAt!.getTime() - t.createdAt.getTime());

    const averageResolutionTime = resolutionTimes.length > 0 ?
      resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / (60 * 1000) : 0;

    const firstResponseRate = responseTimes.length > 0 ?
      (responseTimes.filter(time => time <= this.slaThresholds.firstResponse * 60 * 1000).length / responseTimes.length) * 100 : 0;

    const resolutionRate = resolutionTimes.length > 0 ?
      (resolutionTimes.filter(time => time <= this.slaThresholds.resolution * 60 * 1000).length / resolutionTimes.length) * 100 : 0;

    const automatedTickets = tickets.filter(t =>
      t.conversation.some(m => m.senderType === 'system')
    ).length;

    const automationRate = totalTickets > 0 ? (automatedTickets / totalTickets) * 100 : 0;

    return {
      totalTickets,
      openTickets,
      averageResponseTime,
      averageResolutionTime,
      firstResponseRate,
      resolutionRate,
      customerSatisfaction: 4.2, // This would come from surveys
      automationRate
    };
  }

  private async sendFollowUpEmail(ticket: SupportTicket, parameters: any): Promise<void> {
    console.log(`Sending follow-up email for ticket ${ticket.id}`, parameters);
    // Implementation would integrate with email service
  }

  private async createFollowUpTask(ticket: SupportTicket, parameters: any): Promise<void> {
    console.log(`Creating follow-up task for ticket ${ticket.id}`, parameters);
    // Implementation would integrate with task management system
  }

  private async scheduleFollowUpCall(ticket: SupportTicket, parameters: any): Promise<void> {
    console.log(`Scheduling follow-up call for ticket ${ticket.id}`, parameters);
    // Implementation would integrate with calendar system
  }

  private async sendEscalationNotification(ticket: SupportTicket, rule: EscalationRule): Promise<void> {
    console.log(`Sending escalation notification for ticket ${ticket.id}`, rule);
    // Implementation would integrate with notification system
  }

  private async logSupportEvent(ticketId: string, event: string, data: any): Promise<void> {
    console.log(`Support event: ${event} for ticket ${ticketId}`, data);
    // Implementation would integrate with logging service
  }

  private initializeAutomatedResponses(): void {
    this.automatedResponses.set('login-help', {
      id: 'login-help',
      trigger: 'login_issues',
      conditions: {
        keywords: ['login', 'password', 'signin', 'authentication']
      },
      responseTemplate: `Hello! I see you're having trouble with login. Here are some quick steps to try:

1. Clear your browser cache and cookies
2. Try resetting your password using the "Forgot Password" link
3. Make sure you're using the correct email address
4. Check if Caps Lock is on

If these steps don't help, our support team will assist you further within 1 hour.

Ticket ID: {ticketId}`,
      followUpActions: [
        {
          action: 'send_email',
          delay: 60,
          parameters: {
            template: 'login_troubleshooting_guide'
          }
        }
      ]
    });

    this.automatedResponses.set('billing-inquiry', {
      id: 'billing-inquiry',
      trigger: 'billing_questions',
      conditions: {
        category: 'billing'
      },
      responseTemplate: `Thank you for contacting us about billing. Your inquiry has been forwarded to our billing team.

You can expect a response within 24 hours. In the meantime, you can:
- View your billing history in your account settings
- Download invoices from the billing section
- Review our pricing plans at [pricing page]

Ticket ID: {ticketId}`,
      escalationRules: [
        {
          condition: 'no_response',
          delay: 120,
          escalateTo: 'billing_team',
          notificationTemplate: 'billing_escalation'
        }
      ]
    });
  }

  private initializeKnowledgeBase(): void {
    this.knowledgeBase.set('password-reset', {
      id: 'password-reset',
      title: 'How to Reset Your Password',
      content: `To reset your password:
      1. Go to the login page
      2. Click "Forgot Password"
      3. Enter your email address
      4. Check your email for reset link
      5. Follow the link and create a new password`,
      category: 'authentication',
      tags: ['password', 'reset', 'login'],
      searchKeywords: ['forgot password', 'reset password', 'can\'t login'],
      popularity: 100,
      lastUpdated: new Date(),
      clientSpecific: false
    });

    this.knowledgeBase.set('dashboard-overview', {
      id: 'dashboard-overview',
      title: 'Understanding Your Dashboard',
      content: `Your dashboard provides an overview of:
      - Recent activity
      - Key metrics
      - Quick actions
      - Notifications

      Navigate using the sidebar menu to access different sections.`,
      category: 'general',
      tags: ['dashboard', 'overview', 'navigation'],
      searchKeywords: ['dashboard', 'home page', 'overview'],
      popularity: 85,
      lastUpdated: new Date(),
      clientSpecific: false
    });
  }
}

export default SupportAutomation;