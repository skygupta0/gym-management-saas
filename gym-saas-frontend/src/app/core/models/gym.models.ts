export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'EXPIRED' | 'PENDING';

export interface Member {
  id: string;
  tenantId: string;
  memberCode: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  mobile: string;
  gender?: string;
  dateOfBirth?: string;
  joiningDate: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  address?: string;
  photoUrl?: string;
  status: MemberStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberCreateRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  mobile: string;
  gender?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  address?: string;
  photoUrl?: string;
  notes?: string;
  planId?: string;
}

export interface MemberUpdateRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  gender?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  address?: string;
  photoUrl?: string;
  status?: MemberStatus;
  notes?: string;
}

export interface MembershipPlan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  registrationFee: number;
  taxPercentage: number;
  maxFreezeDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface MembershipPlanCreateRequest {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  registrationFee?: number;
  taxPercentage?: number;
  maxFreezeDays?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Membership {
  id: string;
  tenantId: string;
  memberId: string;
  planId?: string;
  planName: string;
  planDurationDays: number;
  startDate: string;
  endDate: string;
  originalEndDate: string;
  price: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  totalFrozenDays: number;
  notes?: string;
  createdAt: string;
}

export interface MembershipPurchaseRequest {
  memberId: string;
  planId: string;
  startDate?: string;
  discountAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInSource: string;
}

export interface CheckInRequest {
  memberId?: string;
  memberCode?: string;
  source?: string;
}

export interface OccupancyResponse {
  currentCount: number;
  totalCapacity: number;
  occupancyPercentage: number;
  todayTotalCheckIns: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  membershipId?: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}

export interface PaymentCollectRequest {
  memberId: string;
  membershipId?: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface ActivityStreamItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

export interface DashboardStats {
  activeMembers: number;
  todayCheckIns: number;
  monthlyRevenue: number;
  expiringSoon: number;
  liveFloorCount: number;
  liveFloorCapacity: number;
  liveFloorPercentage: number;
  recentActivity: ActivityStreamItem[];
}
