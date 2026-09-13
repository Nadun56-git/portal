import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  Package,
  ShoppingCart,
  ClipboardList,
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('chec_auth')
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-64 bg-navy-900 min-h-screen flex flex-col">
      {/* Logo + Title */}
      <div className="p-6 border-b border-navy-700 flex items-center gap-3">
        <img src="/chec_logo.png" alt="CHEC Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide leading-tight">CHEC PORT CITY</h1>
          <p className="text-navy-300 text-xs mt-0.5">ERP System</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-200 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-navy-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-navy-200 hover:bg-red-900/40 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
        <p className="text-navy-400 text-xs text-center mt-3">v1.0.0</p>
      </div>
    </aside>
  )
}
