type User = {
  permissions: string[];
  roles: string[];
};

interface ValidateUserpermissionsProps {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermisson({
  user,
  roles,
  permissions,
}: ValidateUserpermissionsProps) {
  if (permissions && permissions?.length > 0) {
    const hasAllpermissions = permissions?.every((permisson) => {
      return user?.permissions?.includes(permisson);
    });
    if (!hasAllpermissions) {
      return false;
    }
  }
  if (roles && roles?.length > 0) {
    const hasAllRoles = roles?.some((role) => {
      return user?.roles.includes(role);
    });
    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
