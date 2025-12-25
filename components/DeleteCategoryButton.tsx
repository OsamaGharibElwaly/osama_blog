// components/DeleteCategoryButton.tsx
'use client';

import React from 'react';

type DeleteCategoryButtonProps = {
  catId: number;
};

const DeleteCategoryButton = ({ catId }: DeleteCategoryButtonProps) => {
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this category?")) {
      // Submit the form after confirmation
      const form = document.getElementById(`delete-form-${catId}`) as HTMLFormElement;
      form.submit();
    }
  };

  return (
    <form id={`delete-form-${catId}`} action="/api/authors/delete" method="POST">
      <input type="hidden" name="catId" value={catId} />
      <button
        type="submit"
        onClick={handleDelete}
        className="text-red-400 hover:underline"
      >
        Delete
      </button>
    </form>
  );
};

export default DeleteCategoryButton;
