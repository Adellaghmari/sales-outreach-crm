import { ownerInitials, ownerColor } from '../../utils/leadHelpers';

export function OwnerAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      className="owner-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: ownerColor(name),
      }}
      title={name}
    >
      {ownerInitials(name)}
    </span>
  );
}
