import { routes } from '@lib/registry/routes';
import { tables } from '@lib/registry/tables';
import { emails } from '@lib/registry/emails';

describe('Registry Contract', () => {
  describe('Routes', () => {
    it('should have required route keys', () => {
      // Core app routes
      expect(routes.intake).toBeDefined();
      expect(routes['client-portal']).toBeDefined();
      expect(routes['app-sessions']).toBeDefined();
      
      // API routes
      expect(routes.sessions).toBeDefined();
      expect(routes.clients).toBeDefined();
      expect(routes['weekly-plans']).toBeDefined();
      
      // Health routes
      expect(routes.ping).toBeDefined();
      expect(routes.health).toBeDefined();
    });

    it('should have valid route paths', () => {
      Object.values(routes).forEach(route => {
        expect(typeof route).toBe('string');
        expect(route.startsWith('/')).toBe(true);
      });
    });
  });

  describe('Tables', () => {
    it('should have required table constants', () => {
      // Core entities
      expect(tables.clients).toBeDefined();
      expect(tables.sessions).toBeDefined();
      expect(tables.trainers).toBeDefined();
      
      // Planning & Progress
      expect(tables['weekly_plans']).toBeDefined();
      expect(tables.check_ins).toBeDefined();
      expect(tables['progress_metrics']).toBeDefined();
      
      // Communication
      expect(tables.invites).toBeDefined();
      expect(tables.attendance).toBeDefined();
      expect(tables['email_logs']).toBeDefined();
      
      // Media
      expect(tables.media).toBeDefined();
    });

    it('should have valid table names', () => {
      Object.values(tables).forEach(tableName => {
        expect(typeof tableName).toBe('string');
        expect(tableName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Emails', () => {
    it('should have required email templates', () => {
      expect(emails.templates.invite).toBeDefined();
      expect(emails.templates.confirmation).toBeDefined();
      expect(emails.templates.welcome).toBeDefined();
      expect(emails.templates['weekly-recap']).toBeDefined();
      expect(emails.templates['plan-ready']).toBeDefined();
      expect(emails.templates['check-in-reminder']).toBeDefined();
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
