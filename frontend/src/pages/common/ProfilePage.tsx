import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Camera, Save, User, Lock, Mail, Phone, MapPin, GraduationCap, BookOpen, Award, Briefcase, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { api, API_BASE_URL } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'

export function ProfilePage() {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    phone: '',
    address: '',
    school: '',
    grade: '',
    qualifications: '',
    experience: '',
    specialization: ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  // Get current user data
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => api.get('/auth/me')
  })
  
  // Initialize form data when currentUser loads
  useEffect(() => {
    if (currentUser) {
      const user = currentUser as any
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.studentProfile?.bio || user.teacherProfile?.bio || '',
        phone: user.studentProfile?.phone || user.teacherProfile?.phone || '',
        address: user.studentProfile?.address || user.teacherProfile?.address || '',
        school: user.studentProfile?.school || '',
        grade: user.studentProfile?.grade || '',
        qualifications: user.teacherProfile?.qualifications || '',
        experience: user.teacherProfile?.experience || '',
        specialization: user.teacherProfile?.specialization || ''
      })
    }
  }, [currentUser])
  
  // Get avatar URL
  const getAvatarUrl = () => {
    const user = currentUser as any
    if (user?.studentProfile?.avatarUrl) {
      return API_BASE_URL + user.studentProfile.avatarUrl
    }
    if (user?.teacherProfile?.avatarUrl) {
      return API_BASE_URL + user.teacherProfile.avatarUrl
    }
    return null
  }
  
  // Get initials for avatar fallback
  const getInitials = () => {
    const user = currentUser as any
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => api.put('/auth/me', data),
    onSuccess: (response) => {
      setUser(response as any)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (error: any) => {
      console.error('Profile update error:', error)
    }
  })
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => 
      api.put('/auth/me/password', data),
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordSuccess(true)
      setPasswordError('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Failed to change password')
    }
  })
  
  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post('/auth/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    onSuccess: (response) => {
      setUser(response as any)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    }
  })
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatarMutation.mutate(file)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }
  
  const user = currentUser as any
  const isStudent = user?.role === 'STUDENT'
  const isTeacher = user?.role === 'TEACHER'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">โปรไฟล์ของฉัน</h1>
          <p className="text-muted-foreground text-lg">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</p>
        </div>
        
        {/* Profile Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
          <CardHeader className="-mt-16 pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={getAvatarUrl() || ''} alt="Profile" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-purple-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-2 right-2 bg-primary text-white p-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {isStudent ? 'นักเรียน' : isTeacher ? 'ครู' : 'ผู้ดูแลระบบ'}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {user?.username && (
                  <p className="text-muted-foreground text-sm mt-1">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Main Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="text-sm sm:text-base py-3">
              <User className="w-4 h-4 mr-2" />
              ข้อมูลส่วนตัว
            </TabsTrigger>
            <TabsTrigger value="security" className="text-sm sm:text-base py-3">
              <Lock className="w-4 h-4 mr-2" />
              ความปลอดภัย
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab Content */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  ข้อมูลส่วนตัว
                </CardTitle>
                <CardDescription>
                  อัปเดตข้อมูลส่วนตัวและรายละเอียดโปรไฟล์ของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          ชื่อจริง
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          placeholder="กรุณากรอกชื่อจริง"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          นามสกุล
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          placeholder="กรุณากรอกนามสกุล"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">
                          ชื่อผู้ใช้
                        </Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          placeholder="username"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          เบอร์โทรศัพท์
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="08x-xxx-xxxx"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      ที่อยู่
                    </h3>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        ที่อยู่
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="กรุณากรอกที่อยู่"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      เกี่ยวกับฉัน
                    </h3>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        คำแนะนำตัว
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="แนะนำตัวเองสักหน่อย..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  
                  {/* Student Specific Fields */}
                  {isStudent && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-green-500" />
                        ข้อมูลการศึกษา
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="school" className="text-sm font-medium">
                            โรงเรียน
                          </Label>
                          <Input
                            id="school"
                            value={formData.school}
                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                            placeholder="ชื่อโรงเรียน"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade" className="text-sm font-medium">
                            ชั้น
                          </Label>
                          <Input
                            id="grade"
                            value={formData.grade}
                            onChange={(e) => setFormData({...formData, grade: e.target.value})}
                            placeholder="ชั้นเรียน"
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Teacher Specific Fields */}
                  {isTeacher && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        ข้อมูลวิชาชีพ
                      </h3>
                      <Separator />
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="qualifications" className="text-sm font-medium">
                            วุฒิการศึกษา
                          </Label>
                          <Textarea
                            id="qualifications"
                            value={formData.qualifications}
                            onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                            placeholder="วุฒิการศึกษาและใบประกอบวิชาชีพ"
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience" className="text-sm font-medium flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            ประสบการณ์การทำงาน
                          </Label>
                          <Textarea
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({...formData, experience: e.target.value})}
                            placeholder="ประสบการณ์การสอนและทำงาน"
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialization" className="text-sm font-medium">
                            ความเชี่ยวชาญ
                          </Label>
                          <Textarea
                            id="specialization"
                            value={formData.specialization}
                            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            placeholder="วิชาที่เชี่ยวชาญ"
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto h-11 px-8 text-base"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          บันทึกการเปลี่ยนแปลง
                        </>
                      )}
                    </Button>
                    
                    {profileSuccess && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">บันทึกข้อมูลเรียบร้อยแล้ว!</span>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab Content */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  เปลี่ยนรหัสผ่าน
                </CardTitle>
                <CardDescription>
                  อัปเดตรหัสผ่านเพื่อความปลอดภัยของบัญชี
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium">
                        รหัสผ่านปัจจุบัน
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="••••••••"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        รหัสผ่านใหม่
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="••••••••"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        ต้องมีอย่างน้อย 6 ตัวอักษร
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        ยืนยันรหัสผ่านใหม่
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto h-11 px-8 text-base"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังเปลี่ยนรหัสผ่าน...
                        </>
                      ) : (
                        'เปลี่ยนรหัสผ่าน'
                      )}
                    </Button>
                    
                    {passwordError && (
                      <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{passwordError}</span>
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!</span>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
