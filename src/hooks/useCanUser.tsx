import { useAuthContext } from "context/AuthContext";
import { validateUserPermisson } from "utils/validateUserPermissons";

type UseCan = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ roles, permissions }: UseCan) {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated) {
    return false;
  }

  const validateUserPermissons = validateUserPermisson({
    user,
    permissions,
    roles,
  });

  return validateUserPermissons;
}
