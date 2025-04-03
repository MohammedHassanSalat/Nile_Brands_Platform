export interface Signup {
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface Login {
  readonly email: string;
  readonly password: string;
}

export interface resetPassword {
  readonly password: string;
  readonly confirmPassword: string;
}
