import { AlertTriangle, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from '@/lib/i18n'

export function TeacherApprovalBanner() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const status = user?.teacherProfile?.status

  if (!status || status === 'APPROVED') {
    return null
  }

  const isPending = status === 'PENDING_REVIEW'

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        isPending
          ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
          : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200'
      }`}
    >
      {isPending ? (
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div>
        <p className="font-medium">
          {isPending ? t('teacherDashboard.pendingTitle') : t('teacherDashboard.rejectedTitle')}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {isPending ? t('teacherDashboard.pendingDesc') : t('teacherDashboard.rejectedDesc')}
        </p>
      </div>
    </div>
  )
}
