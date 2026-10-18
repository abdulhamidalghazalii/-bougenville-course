import React from 'react';
import { useAppStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, History, Clock } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const store = useAppStore();
  const logs = store.auditLogs.filter((a) => a.entity_type === 'profile');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
          Log Audit & Keamanan Akun
        </h1>
        <p className="text-sm text-slateNavy-500 mt-1">
          Catatan riwayat pembuatan akun, pembaruan data, dan perubahan status aktif/nonaktif tutor.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-slateNavy-100">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slateNavy-500 text-sm">
              Belum ada log audit akun yang tersimpan.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {log.action}
                    </Badge>
                    <span className="text-xs font-bold text-slateNavy-800">{log.actor_name}</span>
                  </div>
                  {log.details && (
                    <pre className="text-[11px] font-mono bg-cream-50 p-2 rounded-xl border border-slateNavy-100 text-slateNavy-700 mt-2 max-w-xl overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>

                <div className="text-right shrink-0 text-xs text-slateNavy-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
