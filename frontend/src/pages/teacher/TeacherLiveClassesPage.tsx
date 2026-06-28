import { Card, CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';

export function TeacherLiveClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Classes</h1>
        <p className="text-gray-600">จัดการคลาสเรียนสดของคุณ (Coming Soon)</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Coming Soon!</h2>
          <p className="text-gray-500 mb-4">ฟีเจอร์ Live Classes จะเปิดใช้งานในเร็วๆ นี้</p>
        </CardContent>
      </Card>
    </div>
  );
}
