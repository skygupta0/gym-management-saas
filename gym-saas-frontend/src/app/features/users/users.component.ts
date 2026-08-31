import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, User, UserCreateRequest } from '../../core/models/auth.models';
import { FormErrorUtil } from '../../core/util/form-error.util';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="users-page animate-fade-in">
      <!-- Header -->
      <div class="users-header flex-between">
        <div>
          <h1 class="page-title">Staff & <span class="text-gradient">Trainers</span></h1>
          <p class="page-subtitle">Manage employee access, certified trainers, and gym administrator roles.</p>
        </div>

        <button class="btn btn-primary" (click)="openAddModal()">
          <span>+ Add Employee</span>
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="controls-bar glass-card">
        <div class="role-pills">
          <button
            class="pill-btn"
            [class.pill-active]="selectedRole() === null"
            (click)="setRoleFilter(null)"
          >
            All Staff
          </button>
          <button
            class="pill-btn"
            [class.pill-active]="selectedRole() === 'TRAINER'"
            (click)="setRoleFilter('TRAINER')"
          >
            🏋️ Trainers
          </button>
          <button
            class="pill-btn"
            [class.pill-active]="selectedRole() === 'STAFF'"
            (click)="setRoleFilter('STAFF')"
          >
            📋 Front Desk / Staff
          </button>
          <button
            class="pill-btn"
            [class.pill-active]="selectedRole() === 'GYM_ADMIN'"
            (click)="setRoleFilter('GYM_ADMIN')"
          >
            🛡️ Admins
          </button>
        </div>

        <div class="search-box">
          <input
            type="text"
            class="form-control form-control-sm search-input"
            placeholder="Search by name, email, phone..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-card glass-card">
        @if (isLoading()) {
          <div class="loading-state flex-center">
            <span class="spinner"></span>
            <span>Loading staff records...</span>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="empty-state flex-center">
            <div class="empty-icon">👥</div>
            <h3>No Staff Members Found</h3>
            <p>Add certified trainers and administrators to manage your gym floor.</p>
            <button class="btn btn-primary btn-sm" (click)="openAddModal()">+ Add Employee</button>
          </div>
        } @else {
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar-cell">
                          {{ user.firstName.charAt(0) }}
                        </div>
                        <div class="user-info-cell">
                          <span class="user-fullname">{{ user.fullName }}</span>
                          <span class="user-email-cell">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-chip" [ngClass]="user.role.toLowerCase()">
                        {{ formatRole(user.role) }}
                      </span>
                    </td>
                    <td>
                      <span class="phone-text">{{ user.phone || '—' }}</span>
                    </td>
                    <td>
                      <span class="badge" [class.badge-active]="user.status === 'ACTIVE'" [class.badge-danger]="user.status !== 'ACTIVE'">
                        <span class="badge-dot"></span>
                        {{ user.status }}
                      </span>
                    </td>
                    <td>
                      <span class="date-text">{{ formatDate(user.createdAt) }}</span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn-icon danger" (click)="deleteUser(user)" title="Remove user">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Add Employee Modal -->
      <app-modal [isOpen]="isModalOpen()" title="Add New Employee / Trainer" (close)="closeModal()">
        <form [formGroup]="userForm" (ngSubmit)="onSubmitUser()" class="user-form" novalidate>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">First Name *</label>
              <input
                type="text"
                class="form-control"
                placeholder="Vikram"
                formControlName="firstName"
                [class.is-invalid]="getFieldError('firstName')"
              />
              @if (getFieldError('firstName'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Last Name</label>
              <input type="text" class="form-control" placeholder="Rathore" formControlName="lastName" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input
              type="email"
              class="form-control"
              placeholder="vikram@gym.com"
              formControlName="email"
              [class.is-invalid]="getFieldError('email')"
            />
            @if (getFieldError('email'); as err) {
              <span class="form-error">{{ err }}</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Temporary Password * (min 6 characters)</label>
            <input
              type="password"
              class="form-control"
              placeholder="••••••••"
              formControlName="password"
              [class.is-invalid]="getFieldError('password')"
            />
            @if (getFieldError('password'); as err) {
              <span class="form-error">{{ err }}</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Mobile Phone</label>
              <input
                type="text"
                class="form-control"
                placeholder="9876543210"
                formControlName="phone"
                [class.is-invalid]="getFieldError('phone')"
              />
              @if (getFieldError('phone'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Assigned Role *</label>
              <select class="form-control" formControlName="role">
                <option value="TRAINER">Certified Trainer</option>
                <option value="STAFF">Front Desk Staff</option>
                <option value="GYM_ADMIN">Gym Administrator</option>
              </select>
            </div>
          </div>

          <div class="modal-footer flex-between">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>Saving...</span>
              } @else {
                <span>Create Staff Account</span>
              }
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    /* Controls Bar */
    .controls-bar {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .role-pills {
      display: flex;
      gap: 8px;
    }

    .pill-btn {
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 999px;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .pill-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .pill-active {
      background: var(--primary-cyan);
      color: #04101e;
      border-color: transparent;
      box-shadow: 0 0 12px rgba(0, 242, 254, 0.3);
    }

    .search-input {
      min-width: 240px;
      padding: 8px 12px;
      font-size: 0.85rem;
    }

    /* Table Card */
    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .loading-state, .empty-state {
      padding: 60px 20px;
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 4px;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: #ffffff;
    }

    .empty-state p {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    /* Cell Styles */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar-cell {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--accent-purple-gradient);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .user-info-cell {
      display: flex;
      flex-direction: column;
    }

    .user-fullname {
      font-weight: 600;
      color: #ffffff;
    }

    .user-email-cell {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .role-chip {
      display: inline-block;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .role-chip.gym_owner { background: rgba(0, 242, 254, 0.15); color: var(--primary-cyan); }
    .role-chip.gym_admin { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    .role-chip.trainer { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
    .role-chip.staff { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }

    .phone-text, .date-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .btn-icon {
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-icon.danger:hover {
      background: rgba(244, 63, 94, 0.15);
      border-color: rgba(244, 63, 94, 0.3);
      color: var(--color-danger);
    }

    .form-row {
      display: flex;
      gap: 14px;
    }

    .flex-1 { flex: 1; }

    .modal-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedRole = signal<Role | null>(null);
  readonly searchQuery = signal<string>('');

  readonly userForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    role: ['TRAINER' as Role, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  getFieldError(field: 'firstName' | 'email' | 'password' | 'phone'): string | null {
    const labels: Record<string, string> = {
      firstName: 'First name',
      email: 'Email address',
      password: 'Password',
      phone: 'Phone number'
    };
    return FormErrorUtil.getErrorMessage(this.userForm.get(field), labels[field]);
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers(0, 50).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data.content);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  setRoleFilter(role: Role | null): void {
    this.selectedRole.set(role);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  filteredUsers(): User[] {
    return this.users().filter(u => {
      const matchRole = !this.selectedRole() || u.role === this.selectedRole();
      const q = this.searchQuery().toLowerCase().trim();
      const matchSearch = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));
      return matchRole && matchSearch;
    });
  }

  openAddModal(): void {
    this.userForm.reset({ role: 'TRAINER' });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSubmitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.userForm.getRawValue();

    const request: UserCreateRequest = {
      firstName: formVal.firstName!,
      lastName: formVal.lastName || undefined,
      email: formVal.email!,
      password: formVal.password!,
      phone: formVal.phone || undefined,
      role: formVal.role as Role
    };

    this.userService.createUser(request).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.notification.success('Employee Added', `${res.data.fullName} is now registered.`);
          this.closeModal();
          this.loadUsers();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        FormErrorUtil.applyServerErrors(this.userForm, err);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to deactivate and remove ${user.fullName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.notification.success('Employee Removed', `${user.fullName} has been removed.`);
          this.loadUsers();
        }
      });
    }
  }

  formatRole(role: Role): string {
    switch (role) {
      case 'GYM_OWNER': return 'Owner';
      case 'GYM_ADMIN': return 'Administrator';
      case 'TRAINER': return 'Trainer';
      case 'STAFF': return 'Staff';
      default: return role;
    }
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
