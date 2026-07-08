import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ShoppingCart,
  ClipboardList,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-xl font-bold text-white tracking-wide">POTRAL</h1>
        <p className="text-navy-300 text-xs mt-1">ERP / CRM System</p>
      </div>
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
      <div className="p-4 border-t border-navy-700">
        <p className="text-navy-400 text-xs text-center">v1.0.0</p>
      </div>
    </aside>
  )
}
