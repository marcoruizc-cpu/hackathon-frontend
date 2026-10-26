// DTOs de autenticacion (copiados del contrato Swagger).
export interface UserDto {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: "OPERATOR";
}

export interface LoginRequestDto {
  teamCode: string;
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  expiresAt: string;
  user: UserDto;
}
