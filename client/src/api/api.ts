import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // 요청할 때마다 세션 쿠키(connect.sid)를 함께 보냅니다.
  withCredentials: true,
});

export default api;