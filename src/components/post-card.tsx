import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  id: string;
  title: string;
  price: number;
  images: {
    image: string;
    alt: string | null;
    postId: string;
  }[];
}

export default function PostCard({ id, title, price, images }: PostCardProps) {
  return (
    <Link
      key={id}
      href={`/post/${id}`}
      className="border rounded-lg overflow-hidden group relative shadow-sm"
    >
      <Image
        src={images[0]?.image || "/placeholder.jpg"}
        alt={images[0]?.alt || title}
        width={400}
        height={400}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{price} €</p>
      </div>
      <div className="absolute bottom-5 right-0 translate-x-full rounded-sm -skew-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 bg-primary w-fit h-fit  p-1 transition-all duration-300 shrink-0 mr-5">
        <ChevronRight className="text-primary-foreground" />
      </div>
    </Link>
  );
}
