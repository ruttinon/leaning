import { BookOpen, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">EduPlatform</span>
            </div>
            <p className="text-gray-600 text-sm">
              แพลตฟอร์มเรียนออนไลน์ที่ครบวงจร ให้คุณเรียนได้ทุกที่ทุกเวลา
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">เมนูหลัก</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 hover:text-primary">หน้าแรก</Link></li>
              <li><Link to="/courses" className="text-gray-600 hover:text-primary">คอร์สทั้งหมด</Link></li>
              <li><Link to="/teachers" className="text-gray-600 hover:text-primary">ครูผู้สอน</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-primary">เกี่ยวกับเรา</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">สำหรับผู้ใช้</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register/student" className="text-gray-600 hover:text-primary">สมัครเป็นนักเรียน</Link></li>
              <li><Link to="/register/teacher" className="text-gray-600 hover:text-primary">สมัครเป็นครู</Link></li>
              <li><Link to="/login" className="text-gray-600 hover:text-primary">เข้าสู่ระบบ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@eduplatform.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>กรุงเทพมหานคร</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 EduPlatform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
