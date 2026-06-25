// useProfile.js — أُعيدت كتابته بعد تلف RAR — جلب/تحديث بروفايل المستخدم الحالي
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const PROFILE_API = "http://localhost:3000/profile";

function authHeaders() {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      // Backend exposes the current user's full profile at GET /profile (not /profile/me).
      const res = await axios.get(`${PROFILE_API}`, { headers: authHeaders() });
      return res.data?.data ?? res.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Backend updates basic info at PUT /profile/basic.
      const res = await axios.put(`${PROFILE_API}/basic`, payload, { headers: authHeaders() });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}

export default useProfile;
