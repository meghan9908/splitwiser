// User related types
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  currency: string;
  created_at: string;
  auth_provider: 'email' | 'google';
  firebase_uid?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  firebaseUser: FirebaseUser | null;
   
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface GoogleLoginRequest {
  id_token: string;
  
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  firebaseUser?: FirebaseUser;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// Group related types
export interface Group {
  _id: string;
  name: string;
  currency: string;
  joinCode: string;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  members: GroupMember[];
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  name?: string;
  avatar?: string;
}

export interface CreateGroupRequest {
  name: string;
  currency?: string;
}

// Expense related types
export interface Expense {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  createdBy: string;
  createdAt: string;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
}

export interface ExpensePayer {
  userId: string;
  amount: number;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  category: string;
  date: string;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
}

export type SplitMethod = 'equal' | 'unequal' | 'percentage' | 'shares';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Friends: undefined;
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  JoinGroup: undefined;
  GroupSettings: { groupId: string };
  AddExpense: { groupId: string };
};

// API Error types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class ApiErrorClass extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Component prop types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
export interface GoogleSignInRequest {
  idToken: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
}