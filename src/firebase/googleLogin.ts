import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    client_id: "490339358193-dvttrog0nr2lo08aajij88kuggakm5e8.apps.googleusercontent.com",
  });
  return await signInWithPopup(auth, provider);
};