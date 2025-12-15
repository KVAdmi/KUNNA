export interface JitsiTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  sub: string;
  room: string;
  context: {
    user: {
      id: string;
      name: string;
      avatar: string;
      email?: string;
      moderator: boolean;
    };
  };
}

export interface ValidatePinRequest {
  room: string;
  name: string;
  pin: string;
}

export interface ValidatePinResponse {
  token: string;
  error?: string;
}
