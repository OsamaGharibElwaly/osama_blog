// types/index.ts
export type PostWithAuthor = {
  id: number
  title: string
  slug: string
  shortDescription: string
  thumbnailUrl: string | null
  createdAt: Date
  author: {
    id: number
    name: string
  }
}