import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reset, setReset] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/auth/reset-password', {
        token: token || '',
        newPassword: password,
      }),
    onSuccess: () => setReset(true),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
            ข้อผิดพลาด!
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            โทเค็นรีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ
          </p>
          <div className="flex justify-center">
            <Link to="/login">
              <Button variant="outline">กลับไปหน้าเข้าสู่ระบบ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (reset) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">
            รีเซ็ตรหัสผ่านสำเร็จ!
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
          </p>
          <div className="flex justify-center">
            <Link to="/login">
              <Button variant="outline">เข้าสู่ระบบตอนนี้</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-gray-600 mt-2">
            ป้อนรหัสผ่านใหม่ของคุณ
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
              return;
            }
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่านใหม่</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง"
              required
              minLength={6}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-600 text-sm">รหัสผ่านไม่ตรงกัน</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              mutation.isPending ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              password.length < 6
            }
          >
            {mutation.isPending ? 'กำลังตั้งรหัสผ่านใหม่...' : 'ตั้งรหัสผ่านใหม่'}
          </Button>
          {mutation.isError && (
            <div className="text-red-600 text-center mt-4">
              โทเค็นไม่ถูกต้องหรือหมดอายุ
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
