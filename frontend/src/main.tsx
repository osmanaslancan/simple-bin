import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../app/globals.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from './components/ui/toaster.tsx'
import { Layout } from './Layout.tsx'
import { BinView } from './BinView.tsx'
import { ApiProvider } from './api.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/:id", element: <BinView /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <ApiProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <>
          <RouterProvider router={router} />
          <Toaster />
        </>
      </ThemeProvider>
    </QueryClientProvider>
  </ApiProvider>
  // </React.StrictMode>,
)
