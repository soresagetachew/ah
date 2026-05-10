interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getBadgeColor = (role: string) => {
    switch (role) {
      case 'System Admin': return 'bg-red-100 text-red-800';
      case 'GM': return 'bg-amber-100 text-amber-800';
      case 'Finance': return 'bg-purple-100 text-purple-800';
      case 'Storekeeper': return 'bg-teal-100 text-teal-800';
      case 'Checker': return 'bg-blue-100 text-blue-800';
      case 'Staff': return 'bg-gray-100 text-gray-800';
      case 'Auditor': return 'bg-slate-800 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(role)}`}>
      {role}
    </span>
  );
}
