// pages/api/authors/delete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { authorId } = req.body;

    try {
      await prisma.author.delete({
        where: { id: authorId },
      });
      return res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete author' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
