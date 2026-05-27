interface TagBadgeProps {
  name: string;
}

export default function TagBadge({ name }: TagBadgeProps) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      #{name}
    </span>
  );
}
