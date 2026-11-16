export type Language = 'en' | 'bn' | 'hi';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency?: string;
}

export interface MedicalProfile {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  blood_group: string | null;
  medical_conditions: string[];
  allergies: string[];
  no_known_allergies: boolean;
  current_medications: MedicationItem[];
  doctor_name?: string | null;
  doctor_contact?: string | null;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  emergency_contact_email?: string | null;
  emergency_notification_email?: string | null;
  emergency_email_verified?: boolean;
  pending_emergency_notification_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyVisibility {
  show_name: boolean;
  show_age: boolean;
  show_blood_group: boolean;
  show_allergies: boolean;
  show_medications: boolean;
  show_conditions: boolean;
  show_doctor_details: boolean;
  show_emergency_contact: boolean;
}

export interface QRToken {
  id: string;
  profile_id?: string;
  token_hash?: string;
  raw_token?: string;
  emergency_url?: string;
  created_at: string;
  revoked_at?: string | null;
  last_accessed_at?: string | null;
  status: 'active' | 'revoked';
}

export interface AccessLog {
  id: string;
  accessed_at: string;
  device_type: string;
  browser: string;
  access_status: 'success' | 'revoked_attempt' | 'invalid_token';
}

export interface NotificationItem {
  id: string;
  notification_type: string;
  recipient: string;
  delivery_status: string;
  error_message?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface EmergencyPublicData {
  status: 'active' | 'revoked' | 'invalid';
  message?: string;
  full_name?: string;
  age?: number;
  blood_group?: string;
  medical_conditions?: string[];
  allergies?: string[];
  no_known_allergies?: boolean;
  current_medications?: MedicationItem[];
  doctor_name?: string | null;
  doctor_contact?: string | null;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  last_updated?: string;
  scan_timestamp?: string;
}

