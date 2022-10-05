export type User = {
  email: string
  id: number
  admin: boolean
  isLoggedIn: boolean
  oreRecuperare: number
}

export namespace Get {
  export type Request = void;
  export type Response = User;
}
