// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'project-details',
    component: () => import('@/views/ProjectDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/TasksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Track initialization state
let authInitialized = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  console.log('🔄 Navigation started:', to.path);
  console.log('📊 Auth state - initialized:', authStore.initialized, 'authenticated:', authStore.isAuthenticated);

  // If auth hasn't been initialized yet, wait for it
  if (!authStore.initialized && !authInitialized) {
    console.log('⏳ Waiting for auth initialization...');
    try {
      await authStore.initialize();
      authInitialized = true;
      console.log('✅ Auth initialization completed');
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      authInitialized = true; // Mark as initialized even on failure
    }
  }

  console.log('🔐 After auth check - authenticated:', authStore.isAuthenticated);

  // Redirect to login if route requires auth but user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 Redirecting to login - authentication required');
    next('/login');
    return;
  }

  // Redirect to dashboard if user is already authenticated but trying to access login
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('📈 Redirecting to dashboard - already authenticated');
    next('/dashboard');
    return;
  }

  // Check admin permissions
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    console.log('👮 Redirecting to dashboard - admin access required');
    next('/dashboard');
    return;
  }

  console.log('✅ Navigation allowed to:', to.path);
  next();
});

export default router;