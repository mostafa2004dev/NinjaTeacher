import { RouterProvider } from 'react-router'
import './App.css'
import { router } from './routes/approute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from './context/Authcontext'
import { ThemeProvider } from './context/ThemeContext/ThemeContext'
import SocketProvider from './context/SocketContext'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {/* SocketProvider must be inside QueryClientProvider (uses queryClient)
              and inside AuthProvider (reads userToken from localStorage).
              It is a pure side-effect provider — adds no DOM nodes. */}
          <SocketProvider>
            <RouterProvider router={router} />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
