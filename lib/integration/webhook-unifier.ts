import { NextRequest, NextResponse } from 'next/server';
import {
  WebhookContext,
  WebhookHandler,
  withVerifiedWebhook,
  WebhookConfig
} from '@/lib/webhooks';
import { WebhookRouter, RouteMatch } from './webhook-router';

export interface UnifiedWebhookConfig {
  hmac?: {
    headerName: string;
    secretEnv: string;
    signaturePrefix?: string;
  };
  idempotency?: {
    namespace: string;
    ttlSeconds?: number;
  };
  isStripe?: boolean;
  router?: WebhookRouter;
}

export interface UnifiedWebhookContext extends WebhookContext {
  route?: RouteMatch;
  metadata: {
    receivedAt: Date;
    processingStarted: Date;
    path: string;
    method: string;
    sourceIp: string;
    userAgent: string;
  };
}

export class WebhookUnifier {
  private router: WebhookRouter;

  constructor(router?: WebhookRouter) {
    this.router = router || new WebhookRouter();
  }

  createUnifiedHandler(config?: UnifiedWebhookConfig): (request: NextRequest) => Promise<NextResponse> {
    const webhookConfig: WebhookConfig = {
      hmac: config?.hmac || {
        headerName: 'X-Webhook-Signature',
        secretEnv: 'WEBHOOK_SECRET'
      },
      idempotency: config?.idempotency || {
        namespace: 'unified-webhook',
        ttlSeconds: 86400
      },
      isStripe: config?.isStripe || false
    };

    const handler: WebhookHandler = async (context: WebhookContext, request: NextRequest) => {
      const receivedAt = new Date();
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      const sourceIp = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const unifiedContext: UnifiedWebhookContext = {
        ...context,
        metadata: {
          receivedAt,
          processingStarted: new Date(),
          path,
          method,
          sourceIp,
          userAgent
        }
      };

      const route = this.router.findRoute(path, method, context.json);

      if (!route) {
        console.warn(`[WebhookUnifier] No route found for ${method} ${path}`);
        return NextResponse.json({
          success: false,
          error: 'No webhook handler configured for this endpoint',
          path,
          method
        }, { status: 404 });
      }

      unifiedContext.route = route;

      console.log(`[WebhookUnifier] Routing ${method} ${path} to ${route.handler.name}`, {
        eventId: context.eventId,
        handlerType: route.type,
        priority: route.priority
      });

      try {
        const result = await route.handler(unifiedContext, request);

        console.log(`[WebhookUnifier] Successfully processed webhook`, {
          eventId: context.eventId,
          path,
          handlerType: route.type,
          processingTime: new Date().getTime() - receivedAt.getTime()
        });

        return result;

      } catch (error) {
        console.error(`[WebhookUnifier] Webhook processing failed:`, {
          eventId: context.eventId,
          path,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
          success: false,
          error: 'Webhook processing failed',
          eventId: context.eventId,
          message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    };

    return withVerifiedWebhook(handler, webhookConfig);
  }

  async processUnifiedWebhook(
    request: NextRequest,
    config?: UnifiedWebhookConfig
  ): Promise<NextResponse> {
    const handler = this.createUnifiedHandler(config);
    return handler(request);
  }

  registerRoute(
    path: string,
    method: string,
    handler: (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>,
    options?: {
      type?: string;
      priority?: number;
      eventMatcher?: (payload: any) => boolean;
    }
  ): void {
    this.router.registerRoute({
      path,
      method,
      handler,
      type: options?.type || 'generic',
      priority: options?.priority || 0,
      eventMatcher: options?.eventMatcher
    });
  }

  getRouter(): WebhookRouter {
    return this.router;
  }
}

export const globalUnifier = new WebhookUnifier();

export function createUnifiedWebhookHandler(config?: UnifiedWebhookConfig) {
  return globalUnifier.createUnifiedHandler(config);
}

export function registerUnifiedRoute(
  path: string,
  method: string,
  handler: (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>,
  options?: {
    type?: string;
    priority?: number;
    eventMatcher?: (payload: any) => boolean;
  }
) {
  globalUnifier.registerRoute(path, method, handler, options);
}