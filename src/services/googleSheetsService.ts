/**
 * GOOGLE SHEETS SERVICE FOR "ENGLISH 9 - MISS HIEN"
 * Synchronizes student profiles, learning logs, and word review with Google Apps Script Web App.
 */

import { SyncStatus, SyncQueueItem } from '../types';

// Web App Executable URL configuration
// Note: Replace this placeholder with the actual /exec URL once deployed from Google Apps Script.
export const GOOGLE_SCRIPT_WEB_APP_URL = "PASTE_DEPLOYED_WEB_APP_EXEC_URL_HERE";

export interface LoginPayload {
  action: 'login';
  studentId: string;
  name: string;
  className?: string;
}

export interface GetStudentPayload {
  action: 'getStudent';
  studentId: string;
}

export interface SaveProgressPayload {
  action: 'saveProgress';
  studentId: string;
  name: string;
  className?: string;
  overallProgress?: number;
  xp?: number;
  streak?: number;
  vocabularyScore?: number;
  grammarScore?: number;
  pronunciationScore?: number;
  listeningScore?: number;
  vocabularyProgress?: number;
  grammarProgress?: number;
  pronunciationProgress?: number;
  listeningProgress?: number;
  lastActivity?: string;
}

export interface SaveResultPayload {
  action: 'saveResult';
  studentId: string;
  name: string;
  className?: string;
  unit: number | string;
  skill: string;
  exercise: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  attempt: number;
}

export interface SaveWordReviewPayload {
  action: 'saveWordReview';
  studentId: string;
  name: string;
  unit: number;
  word: string;
  correctCount: number;
  wrongCount: number;
  needsReview: boolean;
  mastered: boolean;
}

class GoogleSheetsService {
  private syncStatus: SyncStatus = 'synced';
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private isProcessingQueue = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public getScriptUrl(): string {
    if (typeof window === 'undefined') return GOOGLE_SCRIPT_WEB_APP_URL;
    const customUrl = localStorage.getItem('english9_apps_script_url');
    if (customUrl && customUrl.trim().length > 10) {
      return customUrl.trim();
    }
    return GOOGLE_SCRIPT_WEB_APP_URL;
  }

  public setScriptUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('english9_apps_script_url', url.trim());
      if (url.includes('/exec')) {
        this.processQueue();
      }
    }
  }

  public isConfigured(): boolean {
    const url = this.getScriptUrl();
    return Boolean(url && url.includes('/exec') && !url.includes('PASTE_DEPLOYED'));
  }

  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.syncStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.syncStatus = status;
    this.statusListeners.forEach(l => l(status));
  }

  // Generic poster to Apps Script
  private async sendRequest<T = any>(payload: any): Promise<{ success: boolean; data?: T; error?: string; isOffline?: boolean }> {
    const url = this.getScriptUrl();

    if (!this.isConfigured()) {
      // Local fallback mode when script is not yet deployed
      return { success: false, isOffline: true, error: 'Web App URL not configured yet' };
    }

    try {
      this.setStatus('syncing');

      // Use text/plain header to avoid CORS preflight issues with Google Apps Script Web App redirects
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result && result.success) {
        this.setStatus('synced');
        return { success: true, data: result };
      } else {
        this.setStatus('pending');
        return { success: false, error: result?.error || 'Server error' };
      }
    } catch (err: any) {
      this.setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'pending');
      return { success: false, isOffline: true, error: err?.message || 'Network error' };
    }
  }

  // 1. LOGIN API
  public async login(studentId: string, name: string, className: string = '9A') {
    const payload: LoginPayload = {
      action: 'login',
      studentId,
      name,
      className,
    };

    const res = await this.sendRequest(payload);
    if (!res.success) {
      // Queue for background sync
      this.enqueueItem('login', payload);
    }
    return res;
  }

  // 2. GET STUDENT API
  public async getStudent(studentId: string) {
    const payload: GetStudentPayload = {
      action: 'getStudent',
      studentId,
    };
    return await this.sendRequest(payload);
  }

  // 3. SAVE PROGRESS API
  public async saveProgress(payload: Omit<SaveProgressPayload, 'action'>) {
    const fullPayload: SaveProgressPayload = {
      action: 'saveProgress',
      ...payload,
    };

    const res = await this.sendRequest(fullPayload);
    if (!res.success) {
      this.enqueueItem('progress', fullPayload);
    }
    return res;
  }

  // 4. SAVE RESULT (LEARNING LOG) API
  public async saveResult(payload: Omit<SaveResultPayload, 'action'>) {
    const fullPayload: SaveResultPayload = {
      action: 'saveResult',
      ...payload,
    };

    const res = await this.sendRequest(fullPayload);
    if (!res.success) {
      this.enqueueItem('result', fullPayload);
    }
    return res;
  }

  // 5. SAVE WORD REVIEW API
  public async saveWordReview(payload: Omit<SaveWordReviewPayload, 'action'>) {
    const fullPayload: SaveWordReviewPayload = {
      action: 'saveWordReview',
      ...payload,
    };

    const res = await this.sendRequest(fullPayload);
    if (!res.success) {
      this.enqueueItem('word_review', fullPayload);
    }
    return res;
  }

  // --- OFFLINE QUEUE SYSTEM ---

  private getQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem('english9_sync_queue');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setQueue(queue: SyncQueueItem[]): void {
    try {
      localStorage.setItem('english9_sync_queue', JSON.stringify(queue));
    } catch {
      // ignore
    }
  }

  private enqueueItem(type: SyncQueueItem['type'], payload: any) {
    const queue = this.getQueue();
    // Prevent duplicate logins or latest progress overwrite
    if (type === 'progress') {
      const existingIdx = queue.findIndex(q => q.type === 'progress' && q.payload.studentId === payload.studentId);
      if (existingIdx >= 0) {
        queue[existingIdx].payload = payload;
        queue[existingIdx].createdAt = new Date().toISOString();
        this.setQueue(queue);
        return;
      }
    }

    queue.push({
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    this.setQueue(queue);
    this.setStatus('pending');
  }

  public async processQueue(): Promise<number> {
    if (this.isProcessingQueue || !this.isConfigured()) {
      return 0;
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      this.setStatus('synced');
      return 0;
    }

    this.isProcessingQueue = true;
    this.setStatus('syncing');
    let syncedCount = 0;
    const remainingQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        const res = await this.sendRequest(item.payload);
        if (res.success) {
          syncedCount++;
        } else {
          item.retryCount += 1;
          if (item.retryCount < 5) {
            remainingQueue.push(item);
          }
        }
      } catch {
        item.retryCount += 1;
        if (item.retryCount < 5) {
          remainingQueue.push(item);
        }
      }
    }

    this.setQueue(remainingQueue);
    this.isProcessingQueue = false;
    this.setStatus(remainingQueue.length === 0 ? 'synced' : 'pending');
    return syncedCount;
  }
}

export const googleSheetsService = new GoogleSheetsService();
