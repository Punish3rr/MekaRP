export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MIDDLE_MANAGER = "MIDDLE_MANAGER",
  PERSONNEL = "PERSONNEL",
}

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
