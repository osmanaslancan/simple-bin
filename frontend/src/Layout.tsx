import { Package2 } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { ThemeToggleSwitch } from "./components/theme-toggle-switch"

export const Layout = () => {
    return (
        <div className='h-screen'>
            <nav className='flex justify-between items-center h-[var(--navbar-height)] bg-primary shadow-lg'>
                <NavLink to={"/"}>
                    <div className='flex items-center gap-2 ml-4'>
                        <Package2 className='text-primary-foreground' />
                        <h1 className='text-primary-foreground text-xl font-bold'>PasteBin</h1>
                    </div>
                </NavLink>
                <ThemeToggleSwitch className="m-2" />
            </nav>
            <main className='h-[calc(100%-var(--navbar-height))] p-6'>
                <Outlet />
            </main>
        </div>
    )
}