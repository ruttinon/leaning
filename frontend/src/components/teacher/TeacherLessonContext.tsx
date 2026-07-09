interface LessonContextItem {
  lesson?: {
    id?: string
    title?: string
    chapter?: {
      course?: {
        id?: string
        title?: string
      }
    }
  }
}

export function TeacherLessonContext({ item }: { item: LessonContextItem }) {
  const courseTitle = item.lesson?.chapter?.course?.title
  const lessonTitle = item.lesson?.title

  if (!courseTitle && !lessonTitle) {
    return null
  }

  return (
    <p className="mb-2 text-xs text-muted-foreground">
      {[courseTitle, lessonTitle].filter(Boolean).join(' · ')}
    </p>
  )
}

export function getLessonId(item: LessonContextItem): string | undefined {
  return item.lesson?.id
}
