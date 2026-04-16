import { createContext, useContext, useState, useEffect } from 'react'

const ADMIN_EMAIL    = 'admin@horizonooh.com'
const ADMIN_PASSWORD = 'horizon2024'
const TOKEN_KEY      = 'horizon_admin_token'

interface Ctx { isAuth: boolean; login: (e:string,p:string)=>boolean; logout: ()=>void }
const Ctx = createContext<Ctx>({} as Ctx)
export const useAdmin = () => useContext(Ctx)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem(TOKEN_KEY))
  const login = (email: string, pw: string) => {
    if (email === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
      localStorage.setItem(TOKEN_KEY, '1')
      setIsAuth(true)
      return true
    }
    return false
  }
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setIsAuth(false) }
  return <Ctx.Provider value={{ isAuth, login, logout }}>{children}</Ctx.Provider>
}
