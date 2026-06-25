// Authcontext.jsx — أُعيدت كتابته بعد تلف RAR
// متوافق مع: login.jsx (SaveUserToken) و CommentCard.jsx (userId)
import { createContext, useEffect, useState } from "react";

export const Authcontext = createContext(null);

function decodeUserId(token) {
  // الـ JWT بتاع الـ backend بيحمل { id, role } في الـ payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id ?? payload.Teacher_ID ?? null;
  } catch {
    return null;
  }
}

export function AuthcontextProvider({ children }) {
  const [userToken, setUserToken] = useState(() => localStorage.getItem("userToken"));
  const [userId, setUserId]       = useState(() => {
    const t = localStorage.getItem("userToken");
    return t ? decodeUserId(t) : null;
  });

  function SaveUserToken(token) {
    localStorage.setItem("userToken", token);
    setUserToken(token);
    setUserId(decodeUserId(token));
  }

  function RemoveUserToken() {
    localStorage.removeItem("userToken");
    setUserToken(null);
    setUserId(null);
  }

  // مزامنة لو التوكن اتغير من تبويب تاني
  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem("userToken");
      setUserToken(t);
      setUserId(t ? decodeUserId(t) : null);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <Authcontext.Provider value={{ userToken, userId, SaveUserToken, RemoveUserToken }}>
      {children}
    </Authcontext.Provider>
  );
}

export default AuthcontextProvider;
