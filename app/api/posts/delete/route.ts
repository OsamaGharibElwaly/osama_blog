// API Route لتطبيق الحذف
import prisma from "@/lib/db/client";

export async function DELETE(request: Request) {
  const { postId } = await request.json();
  
  if (isNaN(postId)) {
    return new Response("Invalid postId", { status: 400 });
  }

  // حذف العلاقات
  await prisma.postCategory.deleteMany({ where: { postId } });
  await prisma.postTag.deleteMany({ where: { postId } });
  await prisma.comment.deleteMany({ where: { postId } });

  // حذف البوست
  await prisma.post.delete({ where: { id: postId } });

  return new Response("Post deleted", { status: 200 });
}
