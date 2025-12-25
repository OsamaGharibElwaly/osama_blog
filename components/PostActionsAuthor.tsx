'use client';  // هذا السطر لتحديد أن المكون يعمل على العميل

import { useState } from 'react';

// تعريف props بشكل صحيح
type PostActionsProps = {
  authorId: number; // authorId يجب أن يكون جزءًا من props
  deleteAuthor: (authorId: number) => Promise<void>; // دالة الحذف يجب أن تأخذ authorId
};

const PostActions = ({ authorId, deleteAuthor }: PostActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Are you sure you want to delete this author?")) {
      e.preventDefault();
      return;
    }

    setIsDeleting(true);
    await deleteAuthor(authorId); // استدعاء الدالة مع الـ authorId
    setIsDeleting(false);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className={`text-red-400 hover:underline ${isDeleting ? 'opacity-50' : ''}`}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default PostActions;
