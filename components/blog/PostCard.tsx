import Link from "next/link";
import Image from "next/image";
import { Calendar, User, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    thumbnailUrl?: string;
    publishedAt: Date;
    author: {
      name: string;
      slug: string;
    };
    tags: Array<{ name: string; slug: string }>;
    commentCount: number;
  };
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export default function PostCard({ post, variant = "default", className }: PostCardProps) {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900",
        isFeatured && "md:col-span-2",
        className
      )}
    >
      {/* Thumbnail */}
      {post.thumbnailUrl && !isCompact && (
        <div className="relative h-48 overflow-hidden md:h-56">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={cn("p-6", isCompact && "p-4")}>
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h3 className={cn(
          "mb-2 font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400",
          isCompact ? "text-base" : "text-xl",
          isFeatured && "text-2xl md:text-3xl"
        )}>
          <Link href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {!isCompact && (
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {post.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt.toISOString()}>
                {format(post.publishedAt, "MMM d, yyyy")}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <Link
                href={`/authors/${post.author.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {post.author.name}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </div>
          </div>

          {/* Read More */}
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Read more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}