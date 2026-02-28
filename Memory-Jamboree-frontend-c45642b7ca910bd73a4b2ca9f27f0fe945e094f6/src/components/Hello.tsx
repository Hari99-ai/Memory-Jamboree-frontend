import { useRecoilValue } from "recoil";
import { userRoleAtom } from "../atoms/authAtom";


export function Hello() {
  const userRole = useRecoilValue(userRoleAtom);

  return (
    <div>
      {userRole === "admin" && <p>Welcome Admin</p>}
      {userRole === "user" && <p>Welcome User</p>}
    </div>
  );
}
