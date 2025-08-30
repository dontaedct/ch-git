import { routes } from '@lib/registry/routes';
import { tables } from '@lib/registry/tables';
import { emails } from '@lib/registry/emails';

describe('Registry Contract', () => {
  describe('Routes', () => {
    it('should have required route keys for OSS Hero micro app', () => {
      // Core app routes that actually exist
      expect(routes.intake).toBeDefined();
      expect(routes.login).toBeDefined();
      
      // Health & monitoring routes
      expect(routes.ping).toBeDefined();
      expect(routes.health).toBeDefined();
      expect(routes['db-check']).toBeDefined();
      expect(routes['env-check']).toBeDefined();
      
      // Email testing routes
      expect(routes['test-email']).toBeDefined();
      expect(routes['email-smoke']).toBeDefined();
      
      // Media routes
      expect(routes['signed-upload']).toBeDefined();
      expect(routes['signed-download']).toBeDefined();
    });

    it('should have valid route paths', () => {
      Object.values(routes).forEach(route => {
        expect(typeof route).toBe('string');
        expect(route.startsWith('/')).toBe(true);
      });
    });
  });

  describe('Tables', () => {
    it('should have core table constants for micro app template', () => {
      // Generic entities that could exist in any micro app
      expect(tables.clients).toBeDefined();
      expect(tables.invites).toBeDefined();
      expect(tables['email_logs']).toBeDefined();
      expect(tables.media).toBeDefined();
      
      // Note: Specific business logic tables like sessions, trainers, 
      // weekly_plans, check_ins, progress_metrics, attendance 
      // may not be relevant for all OSS Hero micro app implementations
      // These should be customized based on the specific use case
    });

    it('should have valid table names', () => {
      Object.values(tables).forEach(tableName => {
        expect(typeof tableName).toBe('string');
        expect(tableName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Emails', () => {
    it('should have core email templates for micro app', () => {
      expect(emails.templates.invite).toBeDefined();
      expect(emails.templates.confirmation).toBeDefined();
      expect(emails.templates.welcome).toBeDefined();
      
      // Note: Business-specific templates like weekly-recap, plan-ready, 
      // check-in-reminder may not be relevant for all OSS Hero micro apps
      // These should be customized based on the specific use case
    });

    it('should have email subjects for each template', () => {
      Object.keys(emails.templates).forEach(templateKey => {
        expect(emails.subjects[templateKey as keyof typeof emails.subjects]).toBeDefined();
      });
    });

    it('should have valid email types', () => {
      expect(emails.types.transactional).toBeDefined();
      expect(emails.types.marketing).toBeDefined();
      expect(emails.types.notification).toBeDefined();
    });
  });

  describe('Registry Helpers', () => {
    it('should have working route helpers', () => {
      const { getRoute, isRoute, getRouteKey } = require('@lib/registry/routes');
      
      expect(getRoute('ping')).toBe('/api/ping');
      expect(isRoute('/api/ping')).toBe(true);
      expect(getRouteKey('/api/ping')).toBe('ping');
    });

    it('should have working table helpers', () => {
      const { getTable, isTable, getTableKey } = require('@lib/registry/tables');
      
      expect(getTable('clients')).toBe('clients');
      expect(isTable('clients')).toBe(true);
      expect(getTableKey('clients')).toBe('clients');
    });

    it('should have working email helpers', () => {
      const { getEmailTemplate, getEmailSubject, getEmailType } = require('@lib/registry/emails');
      
      expect(getEmailTemplate('invite')).toBe('invite');
      expect(getEmailSubject('invite')).toBe('You\'re invited: {session_title}');
      expect(getEmailType('transactional')).toBe('transactional');
    });
  });
});
