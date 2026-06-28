import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Star, Users, Zap, CheckCircle, GraduationCap, Clock, Award, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/theme-store'

export function HomePage() {
  const { theme, language } = useAppStore()

  const features = [
    { 
      title: language === 'th' ? 'คอร์สคุณภาพสูง' : 'High Quality Courses', 
      description: language === 'th' ? 'คอร์สที่ออกแบบโดยครูผู้เชี่ยวชาญ' : 'Courses designed by expert teachers', 
      icon: BookOpen,
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: language === 'th' ? 'เรียนได้ทุกที่' : 'Learn Anywhere', 
      description: language === 'th' ? 'เรียนได้ทุกเวลา ทุกที่ทุกเมื่อ' : 'Learn anytime, anywhere', 
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      title: language === 'th' ? 'ครูผู้สอนคุณภาพ' : 'Expert Teachers', 
      description: language === 'th' ? 'ครูที่มีประสบการณ์และความเชี่ยวชาญ' : 'Experienced and specialized teachers', 
      icon: Users,
      gradient: 'from-pink-500 to-rose-600'
    },
    { 
      title: language === 'th' ? 'ติดตามความก้าวหน้า' : 'Track Your Progress', 
      description: language === 'th' ? 'ดูความก้าวหน้าของตัวเองได้ง่ายๆ' : 'Easily track your learning progress', 
      icon: CheckCircle,
      gradient: 'from-amber-500 to-orange-600'
    },
  ]

  const courses = [
    { id: '1', title: language === 'th' ? 'คณิตศาสตร์พื้นฐาน' : 'Basic Mathematics', teacher: language === 'th' ? 'ครูสมศักดิ์' : 'Mr. Smith', rating: 4.8, students: 1234, price: 0 },
    { id: '2', title: language === 'th' ? 'ภาษาอังกฤษสำหรับผู้เริ่มต้น' : 'English for Beginners', teacher: language === 'th' ? 'ครูสุภาพร' : 'Ms. Johnson', rating: 4.9, students: 2567, price: 0 },
    { id: '3', title: language === 'th' ? 'วิทยาศาสตร์ ม.ปลาย' : 'High School Science', teacher: language === 'th' ? 'ครูวิทยา' : 'Mr. Brown', rating: 4.7, students: 987, price: 0 },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Premium 3D Effect */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-premium">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'แพลตฟอร์มเรียนออนไลน์ #1' : '#1 Online Learning Platform'}
                  </span>
                </div>
                
                <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'th' ? 'การเรียนรู้ที่' : 'Learning Without'}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {language === 'th' ? ' ไม่มีขีดจำกัด' : ' Limits'}
                  </span>
                </h1>
                
                <p className={`text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {language === 'th' 
                    ? 'เลือกคอร์สที่คุณชื่นชอบ เรียนกับครูมืออาชีพ สร้างอนาคตที่ดีงามกับเรา'
                    : 'Choose your favorite courses, learn with expert teachers, build your future with us'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="premium-btn text-white text-lg px-8 py-6 shadow-lg hover:shadow-indigo-500/40">
                      {language === 'th' ? 'เริ่มเรียนตอนนี้' : 'Start Learning Now'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className={`text-lg px-8 py-6 ${
                      theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300'
                    }`}>
                      {language === 'th' ? 'ดูคอร์สทั้งหมด' : 'Browse All Courses'}
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                  {[
                    { label: language === 'th' ? 'คอร์ส' : 'Courses', value: '500+' },
                    { label: language === 'th' ? 'นักเรียน' : 'Students', value: '10K+' },
                    { label: language === 'th' ? 'ครู' : 'Teachers', value: '100+' },
                    { label: language === 'th' ? 'คะแนน' : 'Rating', value: '4.9' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl glass">
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 3D Effect */}
              <div className="relative flex justify-center">
                <div className="relative">
                  {/* Floating Elements */}
                  <div className="floating absolute -top-8 -left-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-premium flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="floating-slow absolute -bottom-8 -right-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-premium flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Main 3D Card */}
                  <div className="card-3d w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-6">
                        <Clock className="h-16 w-16 text-indigo-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {language === 'th' ? 'เรียนได้ทุกเวลา' : 'Learn Anytime'}
                      </h3>
                      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                        {language === 'th' ? '24 ชั่วโมง ตลอด 7 วัน' : '24 hours a day, 7 days a week'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {language === 'th' ? 'เหตุผลที่เลือกเรา' : 'Why Choose Us'}
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'th' 
                  ? 'คุณสมบัติที่จะช่วยให้การเรียนของคุณประสบความสำเร็จ'
                  : 'Features that will help your learning succeed'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card 
                    key={index} 
                    className="card-3d border-0 overflow-hidden group"
                  >
                    <CardHeader className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className={`text-base mt-2 ${theme === 'dark' ? 'text-slate-400' : ''}`}>
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Courses Section */}
        <section className={`py-20 md:py-32 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {language === 'th' ? 'คอร์สยอดนิยม' : 'Popular Courses'}
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'th' 
                  ? 'คอร์สที่ได้รับความนิยมจากนักเรียน'
                  : 'Courses loved by students'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="card-3d border-0 overflow-hidden"
                >
                  <div className="h-52 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center relative overflow-hidden">
                    <BookOpen className="h-20 w-20 text-white/90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {language === 'th' ? 'โดย ' : 'by '}{course.teacher}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                          ({course.students.toLocaleString()})
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                        {course.price === 0 ? (language === 'th' ? 'ฟรี' : 'Free') : `฿${course.price}`}
                      </span>
                    </div>

                    <Button className="w-full premium-btn text-white">
                      {language === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/courses">
                <Button size="lg" className={`${
                  theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300'
                }`}>
                  {language === 'th' ? 'ดูคอร์สทั้งหมด' : 'Browse All Courses'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
              {/* Decorations */}
              <div className="absolute top-8 right-8 floating">
                <Award className="h-16 w-16 text-white/30" />
              </div>
              <div className="absolute bottom-8 left-8 floating-slow">
                <GraduationCap className="h-12 w-12 text-white/20" />
              </div>

              <div className="relative z-10 text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {language === 'th' ? 'พร้อมที่จะเริ่มการเรียนรู้หรือยัง?' : 'Ready to Start Learning?'}
                </h2>
                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                  {language === 'th' 
                    ? 'สมัครสมาชิกวันนี้ แล้วเริ่มการเรียนรู้ที่จะเปลี่ยนชีวิตคุณ'
                    : 'Sign up today and start your life-changing learning journey'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register/student">
                    <Button size="lg" className="text-lg px-8 py-6 bg-white text-indigo-600 hover:bg-white/90 shadow-xl">
                      {language === 'th' ? 'สมัครเป็นนักเรียน' : 'Sign Up as Student'}
                    </Button>
                  </Link>
                  <Link to="/register/teacher">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/50 text-white hover:bg-white/10">
                      {language === 'th' ? 'สมัครเป็นครู' : 'Sign Up as Teacher'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
