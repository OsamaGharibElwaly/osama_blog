// components/PostActions.tsx
'use client';

import { useState } from 'react';

type PostActionsProps = {
  authorId: number;
};

const PostActions = ({ authorId }: PostActionsProps) => {
  const [loading, setLoading] = useState(false);

  const deleteAuthor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authors/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete author');
      }

      alert('Author deleted successfully');
      window.location.reload(); // Or navigate away after successful deletion
    } catch (error) {
      alert(error|| 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={deleteAuthor}
      disabled={loading}
      className="text-red-400 hover:underline"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default PostActions;
