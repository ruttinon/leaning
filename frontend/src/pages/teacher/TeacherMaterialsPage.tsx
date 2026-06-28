import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Calendar, FileText, Image, Video } from 'lucide-react';
import { api } from '@/lib/api';

interface Material {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  type: string;
  fileUrl: string;
  createdAt: string;
}

export function TeacherMaterialsPage() {
  const { data: materials, isLoading } = useQuery({
    queryKey: ['teacher-materials'],
    queryFn: async () => api.get<Material[]>('/teacher/materials'),
  });

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">วัสดุการสอนทั้งหมด</h1>
        <p className="text-gray-600">จัดการวัสดุการสอนของคุณ</p>
      </div>

      {!materials || materials.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีวัสดุการสอน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  {getTypeIcon(material.type)}
                  <div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    {material.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(material.createdAt).toLocaleDateString('th-TH')}
                </p>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline text-sm mt-2 inline-block"
                >
                  ดาวน์โหลด / เปิดไฟล์
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
