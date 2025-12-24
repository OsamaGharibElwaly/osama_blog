// prisma/seed.js - النسخة المؤكدة
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

console.log('🚀 Starting seed...')
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Exists ✓' : 'MISSING!')

// ✅ الطريقة 1: datasourceUrl (مفرد)
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

// أو ✅ الطريقة 2: datasources (مفرد)
// const prisma = new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL,
//     },
//   },
// })

async function main() {
  console.log('\n1️⃣ Testing connection...')
  
  try {
    // Test connection
    const test = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('✅ Database connected')
    
    // Check existing data
    const authorCount = await prisma.author.count()
    console.log('📊 Existing authors:', authorCount)
    
    if (authorCount > 0) {
      console.log('⚠️ Database has data, skipping seed')
      return
    }
    
    // Create roles
    console.log('\n2️⃣ Creating roles...')
    const adminRole = await prisma.role.create({
      data: { name: 'ADMIN', description: 'Admin role' }
    })
    const authorRole = await prisma.role.create({
      data: { name: 'AUTHOR', description: 'Author role' }
    })
    console.log('✅ Roles created')
    
    // Create admin
    console.log('\n3️⃣ Creating admin user...')
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
    console.log('✅ Admin created')
    
    console.log('\n🎉 SEED COMPLETED!')
    console.log('📋 Login: admin@blog.com / admin123')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()