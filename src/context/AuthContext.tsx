"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCredentials,
  logout as logoutAction,
  selectCurrentUser,
  selectCurrentOrg,
  selectAuthStatus,
} from "@/store/slices/authSlice";
import {
  useLazyGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from "@/store/api/authApi";
import { STORAGE_KEYS } from "@/lib/constants";
import { User, Organization, LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  org: Organization | null;
  status: "loading" | "in" | "out";
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthResponse | null>;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectCurrentUser);
  const reduxOrg = useAppSelector(selectCurrentOrg);
  const reduxStatus = useAppSelector(selectAuthStatus);

  const [triggerGetMe] = useLazyGetMeQuery();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const [user, setUser] = useState<User | null>(reduxUser);
  const [org, setOrg] = useState<Organization | null>(reduxOrg);
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");

  const load = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const res = await triggerGetMe().unwrap();
      setUser(res.user);
      setOrg(res.organization);
      setStatus("in");
      dispatch(setCredentials(res));
      return res;
    } catch {
      setUser(null);
      setOrg(null);
      setStatus("out");
      return null;
    }
  }, [triggerGetMe, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await loginMutation({ email, password }).unwrap();
    if (data.access_token && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
    }
    await load();
    return data;
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const data = await registerMutation(payload).unwrap();
    if (data.access_token && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
    }
    await load();
    return data;
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    dispatch(logoutAction());
    setUser(null);
    setOrg(null);
    setStatus("out");
  };

  const calculatedStatus: "loading" | "in" | "out" =
    status === "in" || reduxStatus === "authenticated"
      ? "in"
      : status === "loading"
      ? "loading"
      : "out";

  return (
    <AuthCtx.Provider
      value={{
        user: user || reduxUser,
        org: org || reduxOrg,
        status: calculatedStatus,
        login,
        register,
        logout,
        refresh: load,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
