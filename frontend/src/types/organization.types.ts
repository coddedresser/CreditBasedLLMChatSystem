export interface Organization {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  role?: string;
  is_active?: boolean;
}

export interface Member {
  id: number;
  username: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface Invitation {
  id: number;
  organization_id: number;
  email: string;
  invited_by: number;
  invited_by_username: string;
  status: string;
  created_at: string;
}