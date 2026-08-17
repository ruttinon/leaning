const unsplash = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const photos = {
  brandStamp: '/media/brand-stamp.png',
  heroStudy: '/media/hero-study.jpg',
  emptyDesk: '/media/empty-desk.jpg',
  library: '/media/library-aisle.jpg',
  teacherDesk: '/media/teacher-desk.jpg',
  subjectStill: '/media/subject-still.jpg',
  notebooks: unsplash('photo-14565130808-af504b67f98c'),
  lecture: unsplash('photo-1524178232363-1aa32b6e3c56'),
  laptop: unsplash('photo-1516321318423-f06f85e504b3'),
  collab: unsplash('photo-1522202176988-66273c2fd55f'),
  writing: unsplash('photo-1434030216411-0b793f4b4173'),
  shelves: unsplash('photo-1524995997946-a1c2e315a42f'),
  chalkboard: unsplash('photo-1503676260728-1c00da094a0b'),
  plants: unsplash('photo-1460518459118-ca973c4d0d4d'),
}

const COURSE_COVERS = [
  photos.notebooks,
  photos.lecture,
  photos.writing,
  photos.shelves,
  photos.laptop,
  photos.collab,
  photos.library,
  photos.heroStudy,
  photos.subjectStill,
  photos.teacherDesk,
]

const PORTRAITS = [
  unsplash('photo-1544717305-2782549b5136'),
  unsplash('photo-1573496359142-b8d87734a5a2'),
  unsplash('photo-1580894732444-8ecded7900cd'),
  unsplash('photo-1500648767791-00dcc994a43e'),
  unsplash('photo-1472099645785-5658abf4ff4e'),
  unsplash('photo-1438761681033-6461ffad8d80'),
]

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function coverFor(id?: string | null) {
  if (!id) return COURSE_COVERS[0]
  return COURSE_COVERS[hashString(id) % COURSE_COVERS.length]
}

export function portraitFor(id?: string | null) {
  if (!id) return PORTRAITS[0]
  return PORTRAITS[hashString(id) % PORTRAITS.length]
}

export function resolveCover(thumbnailUrl?: string | null, id?: string | null) {
  if (thumbnailUrl && !thumbnailUrl.includes('placeholder')) {
    return thumbnailUrl
  }
  return coverFor(id)
}
