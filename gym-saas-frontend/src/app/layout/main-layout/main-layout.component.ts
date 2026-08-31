import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="layout-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
      <!-- Sidebar Navigation -->
      <aside class="layout-sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">
            <div class="brand-icon">⚡</div>
            <div class="brand-text">
              <span class="brand-name">Pulse<span class="text-gradient">Gym</span></span>
              <span class="brand-tag">SaaS v1.0</span>
            </div>
          </div>
          <button class="collapse-toggle" (click)="toggleSidebar()" aria-label="Toggle Sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        <!-- Gym Context Badge -->
        <div class="gym-badge-card">
          <div class="gym-icon">🏢</div>
          <div class="gym-info">
            <div class="gym-name">{{ authService.currentGym()?.name || 'My Gym Club' }}</div>
            <div class="gym-role">{{ authService.currentUser()?.role || 'GYM_OWNER' }}</div>
          </div>
        </div>

        <!-- Nav Items -->
        <nav class="sidebar-nav">
          <div class="nav-section-title">CORE OPERATIONS</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/users" routerLinkActive="active" class="nav-link">
            <span class="nav-label-icon">🏋️</span>
            <span class="nav-label">Staff & Trainers</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Gym Settings</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="user-profile-widget">
            <div class="user-avatar">
              {{ authService.currentUser()?.firstName?.charAt(0) || 'U' }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ authService.currentUser()?.fullName || 'User' }}</span>
              <span class="user-email">{{ authService.currentUser()?.email || '' }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="authService.logout()" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="layout-main">
        <!-- Topbar Header -->
        <header class="layout-topbar">
          <div class="topbar-left">
            <div class="tenant-status-pill">
              <span class="status-dot"></span>
              <span>LIVE TENANT</span>
            </div>
            <span class="topbar-gym-name">{{ authService.currentGym()?.name }}</span>
          </div>

          <div class="topbar-right">
            <!-- Theme Toggle -->
            <button class="icon-action-btn" (click)="toggleTheme()" title="Toggle Theme">
              {{ isDarkMode() ? '☀️' : '🌙' }}
            </button>

            <!-- User Menu -->
            <div class="user-badge" (click)="toggleUserMenu()">
              <div class="user-avatar-small">
                {{ authService.currentUser()?.firstName?.charAt(0) || 'A' }}
              </div>
              <span class="topbar-user-name">{{ authService.currentUser()?.firstName }}</span>
            </div>
          </div>
        </header>

        <!-- Dynamic Routed Content -->
        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
      background: var(--bg-app);
      position: relative;
    }

    /* Sidebar */
    .layout-sidebar {
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      transition: width var(--transition-smooth);
    }

    .sidebar-header {
      height: var(--topbar-height);
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--accent-gradient);
      color: #04101e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      font-weight: 800;
      box-shadow: 0 0 16px rgba(0, 242, 254, 0.35);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.15rem;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .collapse-toggle {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .collapse-toggle:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }

    /* Gym Context Card */
    .gym-badge-card {
      margin: 16px 16px 8px 16px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .gym-icon {
      font-size: 1.2rem;
    }

    .gym-info {
      flex: 1;
      overflow: hidden;
    }

    .gym-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gym-role {
      font-size: 0.7rem;
      color: var(--primary-cyan);
      font-weight: 600;
    }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.675rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      padding: 8px 12px 4px 12px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .nav-link:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-link.active {
      color: #04101e;
      background: var(--accent-gradient);
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0, 242, 254, 0.3);
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }

    .user-avatar {
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

    .user-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.7rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .logout-btn:hover {
      background: rgba(244, 63, 94, 0.15);
      color: var(--color-danger);
      border-color: rgba(244, 63, 94, 0.3);
    }

    /* Main Area */
    .layout-main {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-left var(--transition-smooth);
    }

    /* Topbar */
    .layout-topbar {
      height: var(--topbar-height);
      background: rgba(8, 11, 17, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .tenant-status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 999px;
      font-size: 0.675rem;
      font-weight: 700;
      color: var(--color-success);
      letter-spacing: 0.05em;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
    }

    .topbar-gym-name {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-action-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all var(--transition-fast);
    }

    .icon-action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 999px;
      cursor: pointer;
    }

    .user-avatar-small {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: #04101e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .topbar-user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Content */
    .content-wrapper {
      padding: 32px;
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    /* Responsive Collapsed */
    .sidebar-collapsed .layout-sidebar {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-collapsed .layout-main {
      margin-left: var(--sidebar-collapsed-width);
    }

    .sidebar-collapsed .brand-text,
    .sidebar-collapsed .gym-badge-card,
    .sidebar-collapsed .nav-section-title,
    .sidebar-collapsed .nav-label,
    .sidebar-collapsed .user-meta {
      display: none;
    }

    .sidebar-collapsed .collapse-toggle svg {
      transform: rotate(180deg);
    }
  `]
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);
  readonly isSidebarCollapsed = signal<boolean>(false);
  readonly isDarkMode = signal<boolean>(true);
  readonly isUserMenuOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }
}
