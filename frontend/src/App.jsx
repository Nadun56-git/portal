import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Suppliers from './components/Suppliers'
import Products from './components/Products'
import Orders from './components/Orders'
import PurchaseOrders from './components/PurchaseOrders'
import GrnPreview from './components/GrnPreview'
import Login from './components/Login'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected: GRN preview (outside layout) */}
        <Route path="/purchase-orders/:id/grn" element={
          <PrivateRoute><GrnPreview /></PrivateRoute>
        } />

        {/* Protected: Main layout */}
        <Route path="/" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
