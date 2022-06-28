import { ReactNode } from "react";
import { useCan } from "hooks/useCanUser";

interface UserCanSee {
  children: ReactNode;
  permissons?: string[];
  roles?: string[];
}

export function UserCan({ children, permissons, roles }: UserCanSee) {
  const userCanSeeComponent = useCan({
    permissons: permissons,
    roles: roles,
  });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}
