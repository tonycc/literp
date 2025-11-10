import { createContext } from 'react'
import type { AuthContextType } from '@zyerp/shared'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)