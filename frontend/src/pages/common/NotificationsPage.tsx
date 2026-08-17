import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, Calendar, ExternalLink, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PageIntro } from '@/components/PageIntro';
import { EmptyState } from '@/components/EmptyState';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => api.get<Notification[]>('/auth/me/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) =>
      api.put(`/auth/me/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/auth/me/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'INFO':
      default:
        return 'text-emerald-700 bg-emerald-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />;
      case 'WARNING':
        return <Bell className="h-4 w-4" />;
      case 'ERROR':
        return <X className="h-4 w-4" />;
      case 'INFO':
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        kicker="บัญชี"
        title="การแจ้งเตือน"
        description="ดูการแจ้งเตือนทั้งหมดของคุณ"
        actions={
          notifications && notifications.some(n => !n.isRead) ? (
            <Button
              variant="outline"
              className="rounded-sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
            </Button>
          ) : undefined
        }
      />

      {!notifications || notifications.length === 0 ? (
        <EmptyState title="ยังไม่มีการแจ้งเตือน" description="เมื่อมีข่าวสารใหม่ จะแสดงที่นี่" />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${
                !notification.isRead ? 'border-l-4 border-l-primary' : ''
              } hover:shadow-lg transition-shadow`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-full ${getTypeColor(notification.type)}`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-lg">
                          {notification.title}
                        </CardTitle>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      {notification.linkUrl && (
                        <Button variant="ghost" className="p-0 h-auto text-primary">
                          <a
                            href={notification.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1"
                          >
                            ดูเพิ่มเติม
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      อ่านแล้ว
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
