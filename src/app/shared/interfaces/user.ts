export interface User {
  uid: string,
  email: string,
  emailVerified: boolean,
  verificationCode?: string | number,
  verificationCodeCreated?: object,
  photoURL?: string,
  displayName?: string,
  stripeCustomerId?: string,
  subscriptionId?: string,
  company?: string
}
