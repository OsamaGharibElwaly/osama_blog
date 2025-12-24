// prisma/seed-simple.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple seed...')

  // 1. Create roles (delete if exist)
  await prisma.role.deleteMany()
  
  const adminRole = await prisma.role.create({
    data: { name: 'ADMIN', description: 'Full access' }
  })
  
  const authorRole = await prisma.role.create({
    data: { name: 'AUTHOR', description: 'Author access' }
  })
  
  console.log('✅ Roles created')

  // 2. Create admin author
  await prisma.author.deleteMany()
  
  const admin = await prisma.author.create({
    data: {
      name: 'Osama Admin',
      email: 'admin@blog.com',
      passwordHash: 'temp123', // غيرها بعدين
      bio: 'Blog admin',
      roleId: adminRole.id
    }
  })
  
  console.log('✅ Admin created')

  // 3. Create a simple post
  await prisma.post.deleteMany()
  
  const post = await prisma.post.create({
    data: {
      title: 'Welcome to My Blog',
      slug: 'welcome-to-my-blog',
      shortDescription: 'First post in the blog',
      content: 'This is the content...',
      status: 'PUBLISHED',
      authorId: admin.id
    }
  })
  
  console.log('✅ Post created')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })