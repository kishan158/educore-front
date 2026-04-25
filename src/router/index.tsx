import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/guards/ProtectedRoute'

// ─── Auth pages ───────────────────────────────────────────────────
import LoginPage           from '../pages/auth/LoginPage'
import RegisterPage        from '../pages/auth/RegisterPage'
import ForgotPasswordPage  from '../pages/auth/ForgotPasswordPage'
import TwoFactorVerifyPage from '../pages/auth/TwoFactorVerifyPage'
import TwoFactorSetupPage  from '../pages/settings/TwoFactorSetupPage'

// ─── Admin pages ──────────────────────────────────────────────────
import UsersPage          from '../pages/admin/UsersPage'
import CategoriesPage     from '../pages/admin/CategoriesPage'
import AdminCoursesPage   from '../pages/admin/AdminCoursesPage'
import CouponsPage        from '../pages/admin/CouponsPage'
import PayoutsPage        from '../pages/admin/PayoutsPage'
import AdminDashboardPage from '../pages/admin/DashboardPage'
import SiteSettingsPage   from '../pages/admin/SiteSettingsPage'
import ServerMonitorPage  from '../pages/admin/ServerMonitorPage'
import ErrorLogsPage      from '../pages/admin/ErrorLogsPage'

// ─── Teacher pages ────────────────────────────────────────────────
import TeacherCoursesPage       from '../pages/teacher/CoursesPage'
import CourseBuilderPage        from '../pages/teacher/CourseBuilderPage'
import CurriculumPage           from '../pages/teacher/CurriculumPage'
import StudentsPage             from '../pages/teacher/StudentsPage'
import LiveClassSchedulerPage   from '../pages/teacher/LiveClassSchedulerPage'
import EarningsPage             from '../pages/teacher/EarningsPage'
import TeacherAnalyticsPage     from '../pages/teacher/AnalyticsPage'

// ─── Student pages ────────────────────────────────────────────────
import MyCoursesPage         from '../pages/student/MyCoursesPage'
import QuizPlayerPage        from '../pages/student/QuizPlayerPage'
import AssignmentPage        from '../pages/student/AssignmentPage'
import MySubmissionsPage     from '../pages/student/MySubmissionsPage'
import CertificatesPage      from '../pages/student/CertificatesPage'
import LiveClassesPage       from '../pages/student/LiveClassesPage'
import CheckoutPage          from '../pages/student/CheckoutPage'
import OrderHistoryPage      from '../pages/student/OrderHistoryPage'

// ─── Public pages ─────────────────────────────────────────────────
import CertificateVerifyPage from '../pages/public/CertificateVerifyPage'

// ─── Settings pages ───────────────────────────────────────────────
import DevicesPage from '../pages/settings/DevicesPage'

// ─── Layout ───────────────────────────────────────────────────────
import MainLayout from '../components/layout/MainLayout'

// ─── Placeholders (dashboard pages) ──────────────────────────────
const TeacherDashboard = () => <div className="p-8 text-2xl font-bold text-gray-700">Teacher Dashboard</div>
const StudentDashboard = () => <div className="p-8 text-2xl font-bold text-gray-700">Student Dashboard</div>

// ─────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([

  // ─── Public routes ──────────────────────────────────────────────
  { path: '/',                              element: <Navigate to="/auth/login" replace /> },
  { path: '/auth/login',                    element: <LoginPage /> },
  { path: '/auth/register',                 element: <RegisterPage /> },
  { path: '/auth/forgot-password',          element: <ForgotPasswordPage /> },
  { path: '/auth/two-factor',               element: <TwoFactorVerifyPage /> },
  { path: '/certificates/verify/:hash',     element: <CertificateVerifyPage /> },

  // ─── Admin routes ───────────────────────────────────────────────
  {
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin/dashboard',     element: <AdminDashboardPage /> },
      { path: '/admin/users',         element: <UsersPage /> },
      { path: '/admin/categories',    element: <CategoriesPage /> },
      { path: '/admin/courses',       element: <AdminCoursesPage /> },
      { path: '/admin/orders',        element: <OrderHistoryPage /> },
      { path: '/admin/coupons',       element: <CouponsPage /> },
      { path: '/admin/payouts',       element: <PayoutsPage /> },
      { path: '/admin/monitor',       element: <ServerMonitorPage /> },
      { path: '/admin/errors',        element: <ErrorLogsPage /> },
      { path: '/admin/settings',      element: <SiteSettingsPage /> },
      { path: '/settings/devices',    element: <DevicesPage /> },
      { path: '/settings/two-factor', element: <TwoFactorSetupPage /> },
    ],
  },

  // ─── Teacher routes ─────────────────────────────────────────────
  {
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/teacher/dashboard',                element: <TeacherDashboard /> },
      { path: '/teacher/courses',                  element: <TeacherCoursesPage /> },
      { path: '/teacher/courses/create',           element: <CourseBuilderPage /> },
      { path: '/teacher/courses/:id/edit',         element: <CourseBuilderPage /> },
      { path: '/teacher/courses/:id/curriculum',   element: <CurriculumPage /> },
      { path: '/teacher/students',                 element: <StudentsPage /> },
      { path: '/teacher/live-classes',             element: <LiveClassSchedulerPage /> },
      { path: '/teacher/earnings',                 element: <EarningsPage /> },
      { path: '/teacher/analytics',                element: <TeacherAnalyticsPage /> },
    ],
  },

  // ─── Student routes ─────────────────────────────────────────────
  {
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/student/dashboard',                  element: <StudentDashboard /> },
      { path: '/student/courses',                    element: <MyCoursesPage /> },
      { path: '/student/quiz/:quizId',               element: <QuizPlayerPage /> },
      { path: '/student/assignments/:assignmentId',  element: <AssignmentPage /> },
      { path: '/student/submissions',                element: <MySubmissionsPage /> },
      { path: '/student/certificates',               element: <CertificatesPage /> },
      { path: '/student/live-classes',               element: <LiveClassesPage /> },
      { path: '/student/checkout',                   element: <CheckoutPage /> },
      { path: '/student/orders',                     element: <OrderHistoryPage /> },
    ],
  },
])