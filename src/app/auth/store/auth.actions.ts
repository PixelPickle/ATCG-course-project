import {Action} from '@ngrx/store';

// Outbound HTTP Actions
export const LOGIN_REQUEST = '[Auth] LOGIN_REQUEST';
export const SIGN_UP_REQUEST = '[Auth] SIGN_UP_REQUEST';
export const LOGOUT = '[Auth] LOGOUT';

// Inbound HTTP Actions
export const AUTHENTICATE_SUCCESS = '[Auth] AUTHENTICATE_SUCCESS';
export const AUTHENTICATE_FAILURE = '[Auth] AUTHENTICATE_FAILURE';

export class LoginRequest implements Action {
  readonly type = LOGIN_REQUEST;
  // Payload Contains Existing User Credentials
  constructor(public payload: {email: string, password: string}) {}
}

export class SignUpRequest implements Action {
  readonly type = SIGN_UP_REQUEST;
  // Payload Contains New User Credentials
  constructor(public payload: {email: string, password: string}) {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
  // No Payload Needed
}

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;
  // Payload Contains User Data
  constructor( public payload: {
    email: string;
    userId: string;
    token: string;
    expirationDate: Date;
  }) {}
}

export class AuthenticateFailure implements Action {
  readonly type = AUTHENTICATE_FAILURE;
  // Payload Contains Error Message
  constructor(public payload: string) {}
}

export type AuthActions =
  | AuthenticateSuccess
  | AuthenticateFailure
  | LoginRequest
  | SignUpRequest
  | Logout;
