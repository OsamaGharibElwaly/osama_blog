'use client';

import { useState } from "react";

type PostActionsProps = {
  postId: number;
};

const PostActions = ({ postId }: PostActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      e.preventDefault();
      return;
    }

    setIsDeleting(true);

    // ارسال طلب حذف عبر الـ API
    const response = await fetch("/api/posts/delete", {
      method: "DELETE",
      body: JSON.stringify({ postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Post deleted successfully");
      window.location.reload(); // أو إعادة التوجيه للمكان الذي تحتاجه
    } else {
      alert("Error deleting post");
    }

    setIsDeleting(false);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDelete}
        className="text-red-400 hover:underline"
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
};

export default PostActions;
