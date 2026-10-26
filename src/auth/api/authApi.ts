import { request } from "../../common/api/httpClient";
import type { LoginRequestDto, LoginResponseDto, UserDto } from "../dto/auth.dto";

// Capa "repository": solo habla con la API, sin estado ni UI.
export const authApi = {
  login: (body: LoginRequestDto) => request<LoginResponseDto>("/auth/login", { method: "POST", body, auth: false }),
  me: (signal?: AbortSignal) => request<UserDto>("/auth/me", { signal }),
};
