'use client'; // Add this to indicate that it's a client-side component
import React, { useState } from 'react';

type DeleteCategoryButtonProps = {
  catId: number;
};

const DeleteCategoryButton = ({ catId }: DeleteCategoryButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);

    try {
      const response = await fetch('/api/category/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Category deleted successfully');
        window.location.reload(); // Or use your preferred navigation method
      } else {
        alert(result.message || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to delete category');
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

export default DeleteCategoryButton;
