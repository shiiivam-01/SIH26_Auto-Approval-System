import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllAsRead, markAsRead } from '../../api/notificationApi';
import { Button, Card, CardBody, PageHeader, Badge, EmptyState, ErrorState, SkeletonRows } from '../../components/common/ui';
import { NOTIFICATION_TYPE } from '../../constants/statusCatalog';
import { PROTOTYPE_NOTIFICATIONS } from '../../constants/prototypeData';

export const NotificationsPage = ({ notificationKey = '' }) => {
  const { user } = useAuth();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications', notificationKey],
    queryFn: () => getNotifications({ page: 1, limit: 50 }),
  });

  const markAll = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Could not update notifications'),
  });

  const markOne = useMutation({
    mutationFn: (id) => markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (notifications.isLoading) return <SkeletonRows rows={5} />;
  if (notifications.isError) return <ErrorState title="Could not load notifications" message={notifications.error?.response?.data?.error} onRetry={() => notifications.refetch()} />;

  const list = (notifications.data?.notifications && notifications.data.notifications.length > 0) ? notifications.data.notifications : (isDemo ? PROTOTYPE_NOTIFICATIONS : []);
  const unread = list.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'You are all caught up'}
        action={
          unread > 0 && (
            <Button variant="outline" onClick={() => markAll.mutate()} isLoading={markAll.isPending}>
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )
        }
      />

      {list.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={Bell} title="No notifications" description="SLA alerts, grievance updates and application updates will appear here." />
        </CardBody></Card>
      ) : (
        <Card>
          <CardBody>
            <ul className="divide-y divide-slate-100">
              {list.map((n) => {
                const type = NOTIFICATION_TYPE[n.type];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.is_read && markOne.mutate(n.id)}
                      className={`w-full text-left px-3 py-3 rounded-md transition-colors ${n.is_read ? '' : 'bg-primary-50/60 hover:bg-primary-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-hidden="true" />}
                            {n.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt || n.created_at || Date.now()).toLocaleString()}</p>
                        </div>
                        {type && <Badge label={type.label} colorClass="bg-slate-100 text-slate-600 border-slate-200" />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
};