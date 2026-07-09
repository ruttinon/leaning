import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Zap, CheckCircle, GraduationCap, Clock, Award, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/theme-store'
import { useTranslation } from '@/lib/i18n'
import { api } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'

export function HomePage() {
  const { theme } = useAppStore()
  const { t } = useTranslation()

  const { data: featuredCourses, isLoading: coursesLoading, isError } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const featured = await api.get<any[]>('/public/courses/featured?limit=3')
      if (Array.isArray(featured) && featured.length > 0) {
        return featured
      }
      const all = await api.get<any[]>('/public/courses')
      return Array.isArray(all) ? all.slice(0, 3) : []
    },
  })

  const features = [
    { 
      title: t('home.features.highQuality.title'), 
      description: t('home.features.highQuality.desc'), 
      icon: BookOpen,
      gradient: 'from-emerald-600 to-green-700'
    },
    { 
      title: t('home.features.anytimeAnywhere.title'), 
      description: t('home.features.anytimeAnywhere.desc'), 
      icon: Zap,
      gradient: 'from-teal-600 to-emerald-600'
    },
    { 
      title: t('home.features.expertTeachers.title'), 
      description: t('home.features.expertTeachers.desc'), 
      icon: Users,
      gradient: 'from-amber-600 to-orange-600'
    },
    { 
      title: t('home.features.trackProgress.title'), 
      description: t('home.features.trackProgress.desc'), 
      icon: CheckCircle,
      gradient: 'from-amber-500 to-orange-600'
    },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Premium 3D Effect */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-amber-500/10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-premium">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('home.badge')}
                  </span>
                </div>
                
                <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('home.heroLine1')}
                  <span className="bg-gradient-to-r from-emerald-800 via-green-700 to-amber-700 bg-clip-text text-transparent">
                    {t('home.heroLine2')}
                  </span>
                </h1>
                
                <p className={`text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('home.heroSubtitle')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="premium-btn text-white text-lg px-8 py-6 shadow-lg hover:shadow-emerald-700/40">
                      {t('home.startLearning')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className={`text-lg px-8 py-6 ${
                      theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300'
                    }`}>
                      {t('home.viewAllCourses')}
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                  {[
                    { label: t('home.statsCourses'), value: '500+' },
                    { label: t('home.statsStudents'), value: '10K+' },
                    { label: t('home.statsTeachers'), value: '100+' },
                    { label: t('home.statsRating'), value: '4.9' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl glass">
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
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
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 shadow-premium flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="floating-slow absolute -bottom-8 -right-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-premium flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Main 3D Card */}
                  <div className="card-3d w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center mb-6">
                        <Clock className="h-16 w-16 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {t('home.learnAnytimeTitle')}
                      </h3>
                      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                        {t('home.learnAnytimeDesc')}
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
                {t('home.whyChooseUs')}
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('home.whyChooseUsSubtitle')}
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
                {t('home.popularCourses')}
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('home.popularCoursesDesc')}
              </p>
            </div>

            {coursesLoading ? (
              <LoadingState />
            ) : isError || !featuredCourses?.length ? (
              <EmptyState
                icon={BookOpen}
                title={t('home.featuredEmpty')}
                description={t('home.featuredEmptyDesc')}
                actionLabel={t('home.browseCourses')}
                onAction={() => window.location.assign('/courses')}
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course: any) => (
                <Card 
                  key={course.id} 
                  className="card-3d border-0 overflow-hidden"
                >
                  <div className="h-52 bg-gradient-to-br from-emerald-500 via-green-500 to-amber-500 flex items-center justify-center relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-20 w-20 text-white/90" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('home.by')}{' '}
                      {course.teacher?.user ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : '-'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {course._count?.enrollments ?? 0} {t('home.statsStudents')}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                        {Number(course.price) === 0 ? t('coursesPage.free') : `฿${course.price}`}
                      </span>
                    </div>

                    <Link to={`/courses/${course.id}`}>
                      <Button className="w-full premium-btn text-white">
                        {t('coursesPage.viewDetails')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
            
            <div className="text-center mt-12">
              <Link to="/courses">
                <Button size="lg" className={`${
                  theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300'
                }`}>
                  {t('home.viewAllCourses')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 bg-gradient-to-r from-emerald-800 via-green-700 to-amber-700 shadow-2xl">
              {/* Decorations */}
              <div className="absolute top-8 right-8 floating">
                <Award className="h-16 w-16 text-white/30" />
              </div>
              <div className="absolute bottom-8 left-8 floating-slow">
                <GraduationCap className="h-12 w-12 text-white/20" />
              </div>

              <div className="relative z-10 text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {t('home.ctaTitle')}
                </h2>
                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                  {t('home.ctaDesc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register/student">
                    <Button size="lg" className="text-lg px-8 py-6 bg-white text-emerald-700 hover:bg-white/90 shadow-xl">
                      {t('home.signUpStudent')}
                    </Button>
                  </Link>
                  <Link to="/register/teacher">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/50 text-white hover:bg-white/10">
                      {t('home.signUpTeacher')}
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
