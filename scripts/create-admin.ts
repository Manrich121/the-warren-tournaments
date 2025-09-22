import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Check environment variables ADMIN_USERNAME and ADMIN_PASSWORD');
    process.exit(1);
  }

  try {
    const hashedPassword = await hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    console.log('Admin account created successfully:', {
      id: admin.id,
      email: admin.email,
      createdAt: admin.createdAt
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Admin with this email already exists');
    } else {
      console.error('Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
