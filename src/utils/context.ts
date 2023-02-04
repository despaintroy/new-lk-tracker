import {Api, Organization, Project, Task, User, UserSession} from "api/sdk"
import {Dayjs} from "dayjs"
import {createContext} from "react"

export interface AuthContextType {
  session: UserSession
  logout: () => void
  currentUser: User
  setCurrentUser: (newCurrentUser: User) => void
  currentOrganization: Organization
  mode: "light" | "dark"
  setMode: (newMode: "light" | "dark") => void
  color: string
  setColor: (newColor: string) => void
}

export interface UnauthContextType {
  api: Api
  authenticate: (userToken: string) => void
  changeBackendURL: (backendURL: string) => void
}

export interface TimerContextType {
  timers: Record<string, Timer>
  removeTimer: (key: string) => void
  updateTimer: (key: string, updates: Partial<Timer>) => void
  toggleTimer: (key: string) => void
  newTimer: (initialValues?: Pick<Timer, "task" | "project">) => string
  submitTimer: (key: string) => Promise<void>
  getTimerForTask: (taskId: string) => string | null
}

export interface Timer {
  lastStarted: Dayjs | null
  accumulatedSeconds: number
  task: string | null
  project: string | null
  summary: string
}

// AuthContext is available when the user is authenticated
export const AuthContext = createContext({} as AuthContextType)

// UnauthContext is available when the user is not authenticated (login screen)
export const UnauthContext = createContext({} as UnauthContextType)

export const TimerContext = createContext({} as TimerContextType)
