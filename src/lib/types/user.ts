import { BaseEntity } from './common';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
}

export interface UserType extends BaseEntity {
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateUserTypeRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateUserTypeRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface UserGroupData extends BaseEntity {
  name: string;
  description: string;
  type: 'department' | 'project' | 'role' | 'custom';
  permissions: string[];
  members: User[];
  projects: any[]; // Replace with proper project type
  parentGroupId?: number;
  isActive: boolean;
}

export interface CreateUserGroupRequest {
  name: string;
  description: string;
  type: 'department' | 'project' | 'role' | 'custom';
  permissions?: string[];
  parentGroupId?: number;
}

export interface UpdateUserGroupRequest {
  name?: string;
  description?: string;
  type?: 'department' | 'project' | 'role' | 'custom';
  permissions?: string[];
  parentGroupId?: number;
  isActive?: boolean;
}

export interface UserGroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  departmentGroups: number;
  projectGroups: number;
  roleGroups: number;
  customGroups: number;
}

export interface AddMembersDto {
  userIds: number[];
}