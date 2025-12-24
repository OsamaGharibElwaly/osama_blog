// prisma/seed.js - ملف JavaScript خالص
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

console.log('🚀 Starting seed...')
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Exists ✓' : 'MISSING!')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('\n1️⃣ Testing connection...')
  
  try {
    // Test connection
    const test = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('✅ Database connected:', test[0].connected === 1)
    
    // Clear old data
    console.log('\n2️⃣ Clearing old data...')
    await prisma.postView.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.postTag.deleteMany()
    await prisma.postCategory.deleteMany()
    await prisma.contactMessage.deleteMany()
    await prisma.authorSocialLink.deleteMany()
    await prisma.post.deleteMany()
    await prisma.author.deleteMany()
    await prisma.role.deleteMany()
    await prisma.category.deleteMany()
    await prisma.tag.deleteMany()
    console.log('✅ Old data cleared')
    
    // Create roles
    console.log('\n3️⃣ Creating roles...')
    const adminRole = await prisma.role.create({
      data: { name: 'ADMIN', description: 'Admin role' }
    })
    const authorRole = await prisma.role.create({
      data: { name: 'AUTHOR', description: 'Author role' }
    })
    console.log('✅ Roles created')
    
    // Create admin
    console.log('\n4️⃣ Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.author.create({
      data: {
        name: 'Osama Admin',
        email: 'admin@blog.com',
        passwordHash: adminPassword,
        bio: 'Blog administrator',
        roleId: adminRole.id
      }
    })
    console.log('✅ Admin created:', admin.email)
    
    // Create a post
    console.log('\n5️⃣ Creating sample post...')
    const post = await prisma.post.create({
      data: {
        title: 'Welcome to My Blog',
        slug: 'welcome-to-my-blog',
        shortDescription: 'First post in the blog',
        content: 'This is the content of the first post...',
        status: 'PUBLISHED',
        authorId: admin.id
      }
    })
    console.log('✅ Post created:', post.title)
    
    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!')
    console.log('\n📋 Test Login:')
    console.log('   Email: admin@blog.com')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('\n❌ SEED FAILED:', error.message)
    if (error.code) console.error('Error code:', error.code)
  } finally {
    await prisma.$disconnect()
  }
}

main()