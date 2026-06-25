// User Roles
export enum UserRole {
  SYS = 'sys',      // Super Admin - Full system access
  DOC = 'doc',      // Document Manager - Can upload docs directly and manage requests
  DIR = 'dir',      // Direction User - Can create document requests
  PUBLIC = 'public' // Public User - Read-only access, no authentication needed
}

// User Interface
export interface User {
  id: string;
  matricule: string;
  name: string;
  email: string;
  role: UserRole;
  directionId?: string;
  direction?: Direction;
  isActive: boolean;
  lastLogin?: string;
  phoneNumber?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Direction Interface
export interface Direction {
  id: string;
  name: string;
  code: string;
  description?: string;
  head?: string | User;
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// Document Status
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Document Category
export enum DocumentCategory {
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  REPORT = 'report',
  POLICY = 'policy',
  PROCEDURE = 'procedure',
  LETTER = 'letter',
  MEMO = 'memo',
  OTHER = 'other',
}

// Document Type
export enum DocumentType {
  REQUEST = 'request',
  OFFICIAL = 'official',
}

// Document Interface
export interface Document {
  id: string;
  title: string;
  description?: string;
  reference?: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  status: DocumentStatus;
  tags: string[];
  directionId?: string;
  direction?: Direction;
  createdBy: string | User;
  updatedBy?: string | User;
  reviewedBy?: string | User;
  reviewedAt?: string;
  reviewComments?: string;
  publishedAt?: string;
  downloadCount: number;
  viewCount: number;
  isPublic: boolean;
  currentVersion: number;
  replacementCount: number;
  lastReplacedAt?: string;
  lastReplacedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

// Document Log Action
export enum LogAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DOWNLOADED = 'downloaded',
  VIEWED = 'viewed',
  FILE_REPLACED = 'file_replaced',
  VERSION_RESTORED = 'version_restored',
}

// Document Log Interface
export interface DocumentLog {
  id: string;
  documentId: string;
  action: LogAction;
  performedBy?: string | User;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// File Version Interface
export interface FileVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string | User;
  replacementReason?: string;
  isCurrent: boolean;
  checksum?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// Permission Helper
export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Role Display Names
export const RoleDisplayNames: Record<UserRole, string> = {
  [UserRole.SYS]: 'Super Administrateur',
  [UserRole.DOC]: 'Gestionnaire de Documents',
  [UserRole.DIR]: 'Utilisateur Direction',
  [UserRole.PUBLIC]: 'Public',
};

// Status Display Names
export const StatusDisplayNames: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Brouillon',
  [DocumentStatus.PENDING]: 'En attente',
  [DocumentStatus.APPROVED]: 'Approuvé',
  [DocumentStatus.REJECTED]: 'Rejeté',
  [DocumentStatus.PUBLISHED]: 'Publié',
  [DocumentStatus.ARCHIVED]: 'Archivé',
};

// Category Display Names
export const CategoryDisplayNames: Record<DocumentCategory, string> = {
  [DocumentCategory.CONTRACT]: 'Contrat',
  [DocumentCategory.INVOICE]: 'Facture',
  [DocumentCategory.REPORT]: 'Rapport',
  [DocumentCategory.POLICY]: 'Politique',
  [DocumentCategory.PROCEDURE]: 'Procédure',
  [DocumentCategory.LETTER]: 'Lettre',
  [DocumentCategory.MEMO]: 'Mémo',
  [DocumentCategory.OTHER]: 'Autre',
};
