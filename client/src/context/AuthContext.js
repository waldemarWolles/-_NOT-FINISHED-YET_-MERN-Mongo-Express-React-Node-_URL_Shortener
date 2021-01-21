import { createContext } from 'react'

function noop() {} // just useless function which do nothing

export const AuthContext = createContext({
  token: null,
  userId: null,
  login: noop,
  logout: noop,
  isAuthenticated: false,
})
