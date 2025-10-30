import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-194bf14c`;

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  url?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  createdByEmail: string;
  createdByName: string;
  assignedTo: string | null;
  assignedToName?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  id: string;
  action: 'created' | 'updated' | 'comment';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  byCategory: Record<string, number>;
}

export interface AISuggestion {
  category: string;
  priority: string;
  possibleSolutions: string[];
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token') || publicAnonKey;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(error.error || `Request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}

export const api = {
  // Auth
  async signup(email: string, password: string, name: string) {
    return fetchApi('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Admin: Create user with role
  async createUser(email: string, password: string, name: string, role: string) {
    return fetchApi('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  // Admin: Delete user
  async deleteUser(userId: string) {
    return fetchApi(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Get users (admin only)
  async getUsers() {
    return fetchApi('/users');
  },

  // Tickets
  async getTickets(filters?: { status?: string; priority?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/tickets${query}`);
  },

  async getTicket(id: string) {
    return fetchApi(`/tickets/${id}`);
  },

  async createTicket(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    attachments?: Attachment[];
  }) {
    return fetchApi('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Attachments
  async uploadAttachment(fileName: string, fileData: string, fileType: string) {
    return fetchApi('/attachments/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileData, fileType }),
    });
  },

  async getTicketAttachments(ticketId: string) {
    return fetchApi(`/tickets/${ticketId}/attachments`);
  },

  async downloadAttachment(userId: string, fileName: string) {
    return fetchApi(`/attachments/${userId}/${fileName}/download`);
  },

  async updateTicket(id: string, updates: Partial<Ticket>) {
    return fetchApi(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async addComment(ticketId: string, comment: string) {
    return fetchApi(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // AI
  async getAISuggestions(description: string) {
    return fetchApi('/ai-suggest', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  // Stats
  async getStats() {
    return fetchApi('/stats');
  },

  // Get technicians list
  async getTechnicians() {
    return fetchApi('/technicians');
  },
};
