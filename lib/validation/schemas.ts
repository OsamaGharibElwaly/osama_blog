// app/lib/validation/schemas.ts
import { z } from 'zod'

// Post schemas
export const postCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  shortDescription: z.string().max(500),
  content: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  authorId: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']),
  categoryIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
})

export const postUpdateSchema = postCreateSchema.partial()

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Contact schemas
export const contactMessageSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
})

// Comment schemas
export const commentCreateSchema = z.object({
  postId: z.number().int().positive(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  content: z.string().min(1).max(1000),
})

export type PostCreateInput = z.infer<typeof postCreateSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ContactMessageInput = z.infer<typeof contactMessageSchema>