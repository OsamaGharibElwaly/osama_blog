import prisma from '../../../lib/db/client';  // Use the singleton

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.name || !data.email || !data.subject || !data.message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // Basic email validation on server (redundant but good)
  if (!/\S+@\S+\.\S+/.test(data.email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        messageBody: data.message,
      },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to save message' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}