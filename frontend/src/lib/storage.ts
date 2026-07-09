import { api, API_BASE_URL } from '@/lib/api'

export type StorageFolder = 'materials' | 'course-thumbnails' | 'avatars' | 'submissions'
type StorageScope = 'teacher' | 'student'

type SignedUploadResponse = {
  mode: 'signed' | 'direct'
  provider: 's3' | 'local'
  key: string
  fileUrl: string
  uploadUrl: string | null
  expiresIn: number | null
  headers?: Record<string, string>
  message?: string
}

type SignedDownloadResponse = {
  mode: 'signed' | 'public'
  provider: 's3' | 'local'
  key: string
  downloadUrl: string
  expiresIn: number | null
}

async function requestSignedUpload(
  scope: StorageScope,
  folder: StorageFolder,
  file: File,
): Promise<SignedUploadResponse> {
  return api.post<SignedUploadResponse>(`/${scope}/storage/signed-upload`, {
    folder,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
  })
}

async function requestSignedDownload(
  scope: StorageScope,
  fileUrl: string,
): Promise<SignedDownloadResponse> {
  return api.post<SignedDownloadResponse>(`/${scope}/storage/signed-download`, { fileUrl })
}

async function putToSignedUrl(uploadUrl: string, file: File, headers?: Record<string, string>) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      ...(headers || {}),
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error('อัปโหลดไฟล์ไปยัง storage ไม่สำเร็จ')
  }
}

async function trySignedUploadForScope(
  scope: StorageScope,
  folder: StorageFolder,
  file: File,
): Promise<string | null> {
  const signed = await requestSignedUpload(scope, folder, file)
  if (signed.mode !== 'signed' || !signed.uploadUrl) {
    return null
  }

  await putToSignedUrl(signed.uploadUrl, file, signed.headers)
  return signed.fileUrl
}

async function resolveFileUrlForScope(scope: StorageScope, fileUrl?: string | null): Promise<string> {
  if (!fileUrl) return ''
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    try {
      const signed = await requestSignedDownload(scope, fileUrl)
      if (signed.downloadUrl) return signed.downloadUrl
    } catch {
      return fileUrl
    }
    return fileUrl
  }
  return `${API_BASE_URL}${fileUrl}`
}

/** Upload via S3 signed URL when available; otherwise return null so caller uses multipart. */
export async function trySignedUpload(folder: StorageFolder, file: File): Promise<string | null> {
  return trySignedUploadForScope('teacher', folder, file)
}

export async function tryStudentSignedUpload(folder: StorageFolder, file: File): Promise<string | null> {
  return trySignedUploadForScope('student', folder, file)
}

export async function uploadLessonMaterial(params: {
  lessonId: string
  title: string
  type: string
  file?: File | null
  fileUrl?: string
}) {
  const { lessonId, title, type, file, fileUrl } = params

  if (file) {
    const signedFileUrl = await trySignedUpload('materials', file)
    if (signedFileUrl) {
      return api.post(`/teacher/lessons/${lessonId}/materials`, {
        title,
        type,
        fileUrl: signedFileUrl,
      })
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('type', type)
    formData.append('file', file)
    return api.post(`/teacher/lessons/${lessonId}/materials`, formData)
  }

  if (fileUrl) {
    return api.post(`/teacher/lessons/${lessonId}/materials`, {
      title,
      type,
      fileUrl,
    })
  }

  throw new Error('ต้องมีไฟล์หรือลิงก์เอกสาร')
}

export async function uploadStudentAssignment(params: {
  assignmentId: string
  textAnswer?: string
  file?: File | null
}) {
  const { assignmentId, textAnswer, file } = params
  const trimmedText = textAnswer?.trim()

  if (file) {
    const signedFileUrl = await tryStudentSignedUpload('submissions', file)
    if (signedFileUrl) {
      return api.post(`/student/assignments/${assignmentId}/submit`, {
        textAnswer: trimmedText,
        fileUrl: signedFileUrl,
      })
    }

    const formData = new FormData()
    if (trimmedText) {
      formData.append('textAnswer', trimmedText)
    }
    formData.append('file', file)
    return api.post(`/student/assignments/${assignmentId}/submit`, formData)
  }

  if (trimmedText) {
    return api.post(`/student/assignments/${assignmentId}/submit`, {
      textAnswer: trimmedText,
    })
  }

  throw new Error('ต้องมีข้อความหรือไฟล์สำหรับส่งการบ้าน')
}

export async function uploadCourseThumbnail(courseId: string, file: File) {
  const signedFileUrl = await trySignedUpload('course-thumbnails', file)
  if (signedFileUrl) {
    return api.post(`/teacher/courses/${courseId}/thumbnail`, { thumbnailUrl: signedFileUrl })
  }

  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/teacher/courses/${courseId}/thumbnail`, formData)
}

export async function uploadAvatar(file: File) {
  // Avatar stays on multipart auth endpoint (storage service handles local/S3).
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/auth/me/avatar', formData)
}

export async function resolveFileUrl(fileUrl?: string | null): Promise<string> {
  return resolveFileUrlForScope('teacher', fileUrl)
}

export async function resolveStudentFileUrl(fileUrl?: string | null): Promise<string> {
  return resolveFileUrlForScope('student', fileUrl)
}

export function toAbsoluteFileUrl(fileUrl?: string | null) {
  if (!fileUrl) return ''
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl
  return `${API_BASE_URL}${fileUrl}`
}
