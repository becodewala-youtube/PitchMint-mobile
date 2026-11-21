export const statusCodes = {
  ONE_TAP_START_FAILED: 'ONE_TAP_START_FAILED',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
  SIGN_OUT_FAILED: 'SIGN_OUT_FAILED',
  REVOKE_ACCESS_FAILED: 'REVOKE_ACCESS_FAILED',
} as const;

export class GoogleSignInError extends Error {
  public code: string;
  public userInfo?: Record<string, string>;
  public cause?: unknown;

  constructor(code: string, message: string, userInfo?: Record<string, string>) {
    super(message);
    this.name = 'GoogleSignInError';
    this.code = code;
    this.userInfo = userInfo;
    Object.setPrototypeOf(this, GoogleSignInError.prototype);
  }
}

export const isSuccessResponse = (response: any): boolean => response?.type === 'success';

export const isNoSavedCredentialFoundResponse = (response: any): boolean =>
  response?.type === 'noSavedCredentialFound';

export const isCancelledResponse = (response: any): boolean =>
  response?.type === 'cancelled';

export const isErrorWithCode = (
  error: unknown
): error is { code: string; message: string; userInfo?: Record<string, string> } => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const toGoogleSignInError = (error: unknown): unknown => error;

export const GoogleOneTapSignIn = {
  configure: jest.fn(),
  checkPlayServices: jest.fn().mockResolvedValue(undefined),
  signIn: jest.fn().mockResolvedValue({ type: 'noSavedCredentialFound', data: null }),
  createAccount: jest.fn().mockResolvedValue({ type: 'noSavedCredentialFound', data: null }),
  presentExplicitSignIn: jest.fn().mockResolvedValue({ type: 'cancelled', data: null }),
  signOut: jest.fn().mockResolvedValue(undefined),
  revokeAccess: jest.fn().mockResolvedValue(undefined),
  getCurrentUser: jest.fn().mockReturnValue(null),
  getTokens: jest.fn().mockResolvedValue({ idToken: 'mock-id-token', accessToken: 'mock-access-token' }),
  clearCachedAccessToken: jest.fn().mockResolvedValue(undefined),
  requestScopes: jest.fn().mockResolvedValue({ accessToken: 'mock-token', serverAuthCode: null }),
};

export const NitroGoogleSignin = GoogleOneTapSignIn;

export const GoogleSignInButton = () => null;
export const useGoogleSignInFromButton = () => ({ signIn: jest.fn(), loading: false });
