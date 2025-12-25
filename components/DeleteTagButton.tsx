'use client'; // Make sure this is a client component

import React, { useState } from 'react';

type DeleteTagButtonProps = {
  tagId: number;
};

const DeleteTagButton = ({ tagId }: DeleteTagButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this tag?")) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tags/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Tag deleted successfully');
        window.location.reload(); // Or you can redirect as needed
      } else {
        alert(result.message || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:underline"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default DeleteTagButton;
