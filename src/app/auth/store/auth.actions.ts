import {Action} from '@ngrx/store';

export const LOGIN_REQUEST = '[Auth] LOGIN_REQUEST';
export const SIGN_UP_REQUEST = '[Auth] SIGN_UP_REQUEST';

export const AUTHENTICATE_SUCCESS = '[Auth] AUTHENTICATE_SUCCESS';
export const AUTHENTICATE_FAILURE = '[Auth] AUTHENTICATE_FAILURE';

export const LOGOUT = '[Auth] LOGOUT';

export class LoginRequest implements Action {
  readonly type = LOGIN_REQUEST;

  constructor(public payload: {email: string, password: string}) {}
}

export class SignUpRequest implements Action {
  readonly type = SIGN_UP_REQUEST;

  constructor(public payload: {email: string, password: string}) {}
}

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;
  constructor( public payload: {
    email: string;
    userId: string;
    token: string;
    expirationDate: Date;
  }) {}
}

export class AuthenticateFailure implements Action {
  readonly type = AUTHENTICATE_FAILURE;

  constructor(public payload: string) {}
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export type AuthActions =
  | AuthenticateSuccess
  | AuthenticateFailure
  | LoginRequest
  | SignUpRequest
  | Logout;
