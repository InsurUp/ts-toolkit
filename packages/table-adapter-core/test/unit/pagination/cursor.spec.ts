/**
 * @fileoverview Cursor Pagination Tests
 * @description Unit tests for the cursor pagination manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createCursorPagination } from '../../../src/lib/pagination/cursor.js';
import type { CursorPaginationManager } from '../../../src/lib/pagination/types.js';

describe('createCursorPagination', () => {
  let pagination: CursorPaginationManager;

  beforeEach(() => {
    pagination = createCursorPagination({ pageSize: 20 });
  });

  describe('initial state', () => {
    it('should start with pageIndex 0', () => {
      const state = pagination.getState();
      expect(state.pageIndex).toBe(0);
    });

    it('should use provided pageSize', () => {
      const state = pagination.getState();
      expect(state.pageSize).toBe(20);
    });

    it('should have undefined cursor initially', () => {
      const state = pagination.getState();
      expect(state.cursor).toBeUndefined();
    });

    it('should use default pageSize of 20 when not provided', () => {
      const defaultPagination = createCursorPagination();
      const state = defaultPagination.getState();
      expect(state.pageSize).toBe(20);
    });
  });

  describe('canGoNext / canGoPrevious', () => {
    it('should not be able to go next without hasNextPage', () => {
      expect(pagination.canGoNext()).toBe(false);
    });

    it('should not be able to go previous on first page', () => {
      expect(pagination.canGoPrevious()).toBe(false);
    });

    it('should be able to go next after update with hasNextPage', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      expect(pagination.canGoNext()).toBe(true);
    });

    it('should be able to go previous after navigating forward', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();
      expect(pagination.canGoPrevious()).toBe(true);
    });
  });

  describe('next', () => {
    it('should increment pageIndex when hasNextPage is true', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });

      const state = pagination.next();
      expect(state.pageIndex).toBe(1);
    });

    it('should not increment pageIndex when hasNextPage is false', () => {
      pagination.update({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });

      const state = pagination.next();
      expect(state.pageIndex).toBe(0);
    });

    it('should return the cursor for the current page', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-page-0',
      });

      const state = pagination.next();
      expect(state.cursor).toBe('cursor-page-0');
    });
  });

  describe('previous', () => {
    it('should decrement pageIndex when greater than 0', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();

      const state = pagination.previous();
      expect(state.pageIndex).toBe(0);
    });

    it('should not decrement pageIndex below 0', () => {
      const state = pagination.previous();
      expect(state.pageIndex).toBe(0);
    });

    it('should return undefined cursor when back on first page', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();
      pagination.previous();

      const state = pagination.getState();
      expect(state.cursor).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should store endCursor for next page', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-for-page-1',
      });

      pagination.next();
      const state = pagination.getState();
      expect(state.cursor).toBe('cursor-for-page-1');
    });

    it('should update hasNextPage flag', () => {
      expect(pagination.canGoNext()).toBe(false);

      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });

      expect(pagination.canGoNext()).toBe(true);
    });

    it('should handle null endCursor', () => {
      pagination.update({
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      });

      const state = pagination.getState();
      expect(state.cursor).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset pageIndex to 0', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();
      pagination.next();

      const state = pagination.reset();
      expect(state.pageIndex).toBe(0);
    });

    it('should clear cursor', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();

      const state = pagination.reset();
      expect(state.cursor).toBeUndefined();
    });

    it('should reset canGoNext to false', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });

      pagination.reset();
      expect(pagination.canGoNext()).toBe(false);
    });

    it('should preserve pageSize', () => {
      const state = pagination.reset();
      expect(state.pageSize).toBe(20);
    });
  });

  describe('setPageSize', () => {
    it('should update pageSize', () => {
      const state = pagination.setPageSize(50);
      expect(state.pageSize).toBe(50);
    });

    it('should reset pagination when changing pageSize', () => {
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor: 'cursor-1',
      });
      pagination.next();

      const state = pagination.setPageSize(50);
      expect(state.pageIndex).toBe(0);
      expect(state.cursor).toBeUndefined();
    });

    it('should throw error for zero pageSize', () => {
      expect(() => pagination.setPageSize(0)).toThrow('pageSize must be greater than 0');
    });

    it('should throw error for negative pageSize', () => {
      expect(() => pagination.setPageSize(-10)).toThrow('pageSize must be greater than 0');
    });
  });

  describe('navigation through multiple pages', () => {
    it('should navigate forward through multiple pages', () => {
      // Page 0
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start-0',
        endCursor: 'end-0',
      });

      // Go to page 1
      pagination.next();
      expect(pagination.getState().pageIndex).toBe(1);
      expect(pagination.getState().cursor).toBe('end-0');

      // Update with page 1 data
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'start-1',
        endCursor: 'end-1',
      });

      // Go to page 2
      pagination.next();
      expect(pagination.getState().pageIndex).toBe(2);
      expect(pagination.getState().cursor).toBe('end-1');
    });

    it('should navigate backward and use stored cursors', () => {
      // Navigate forward
      pagination.update({
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'start-0',
        endCursor: 'cursor-for-page-1',
      });
      pagination.next();

      pagination.update({
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'start-1',
        endCursor: 'cursor-for-page-2',
      });
      pagination.next();

      // Navigate backward
      pagination.previous();
      expect(pagination.getState().pageIndex).toBe(1);
      expect(pagination.getState().cursor).toBe('cursor-for-page-1');

      pagination.previous();
      expect(pagination.getState().pageIndex).toBe(0);
      expect(pagination.getState().cursor).toBeUndefined();
    });
  });

  describe('cursor history trimming', () => {
    it('should handle many pages without issues', () => {
      // Simulate navigating through many pages
      for (let i = 0; i < 100; i++) {
        pagination.update({
          hasNextPage: true,
          hasPreviousPage: i > 0,
          startCursor: `start-${i}`,
          endCursor: `end-${i}`,
        });
        pagination.next();
      }

      expect(pagination.getState().pageIndex).toBe(100);
      expect(pagination.canGoPrevious()).toBe(true);
    });
  });
});
