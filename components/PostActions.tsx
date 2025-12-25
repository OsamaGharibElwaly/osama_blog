'use client';

import { useState } from "react";

type PostActionsProps = {
  postId: number;
  deletePost: (postId: number) => void;
};

const PostActions = ({ postId, deletePost }: PostActionsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      e.preventDefault();
      return;
    }
    deletePost(postId);  // Call the delete function passed as prop
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDelete}
        className="text-red-400 hover:underline"
      >
        Delete
      </button>
    </div>
  );
};

export default PostActions;
