import {auth} from "../services/auth.service";

// Create the request header needed for authorization.
export const authHeader = () => {
  const user = auth.current();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
}
