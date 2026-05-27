import Link from 'next/link';

interface CategoryBadgeProps {
  name: string;
  // 링크 여부 (글 목록에서는 링크, 카테고리 페이지에서는 텍스트만)
  linkable?: boolean;
}

export default function CategoryBadge({ name, linkable = true }: CategoryBadgeProps) {
  const badgeClass =
    'inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors';

  if (!linkable) {
    return <span className={badgeClass}>{name}</span>;
  }

  return (
    <Link href={`/category/${encodeURIComponent(name)}`} className={badgeClass}>
      {name}
    </Link>
  );
}
