import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2, X, Download } from 'lucide-react'
import API_URL from '../config/api'

const emptyForm = { name: '', sku: '', supplier_id: '', cost_price: '', selling_price: '', stock_qty: 0 }

export default function Products() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const fetchData = () => {
    axios.get(`${API_URL}/api/products`).then(res => setProducts(res.data)).catch(() => setProducts([]))
    axios.get(`${API_URL}/api/suppliers`).then(res => setSuppliers(res.data)).catch(() => setSuppliers([]))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, cost_price: parseFloat(form.cost_price), selling_price: parseFloat(form.selling_price), stock_qty: parseInt(form.stock_qty) }
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/products/${editId}`, payload)
      } else {
        await axios.post(`${API_URL}/api/products`, payload)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditId(null)
      fetchData()
    } catch (err) {
      alert('Error: Could not connect to server. Make sure the backend is running.')
    }
  }

  const handleEdit = (product) => {
    setForm({ name: product.name, sku: product.sku, supplier_id: product.supplier_id, cost_price: product.cost_price, selling_price: product.selling_price, stock_qty: product.stock_qty })
    setEditId(product._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await axios.delete(`${API_URL}/api/products/${id}`)
      fetchData()
    }
  }

  const getSupplierName = (id) => suppliers.find(s => s._id === id)?.name || 'Unknown'

  const currencySymbol = (c) => c === 'LKR' ? 'Rs' : '$'

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const downloadReport = () => {
    const headers = ['Name', 'SKU', 'Supplier', 'Cost Price (Rs)', 'Selling Price (Rs)', 'Stock']
    const rows = filtered.map(p => [p.name, p.sku, getSupplierName(p.supplier_id), `Rs${p.cost_price}`, `Rs${p.selling_price}`, p.stock_qty])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate inventory value
  const totalValueLKR = filtered.reduce((sum, p) => sum + (p.selling_price * p.stock_qty), 0)
  const lowStockCount = filtered.filter(p => p.stock_qty <= 10 && p.stock_qty > 0).length
  const outOfStockCount = filtered.filter(p => p.stock_qty === 0).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Products</h2>
        <div className="flex gap-2">
          <button onClick={downloadReport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            <Download size={18} /> Report
          </button>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-navy-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="text-2xl font-bold text-emerald-600">Rs{totalValueLKR.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-amber-500">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">SKU</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Supplier</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Cost Price</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Selling Price</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Stock</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{getSupplierName(product.supplier_id)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">Rs{product.cost_price?.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">Rs{product.selling_price?.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_qty > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock_qty > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock_qty}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(product)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(product._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <input required placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <select required value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Cost Price" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                <input required type="number" step="0.01" placeholder="Selling Price" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Stock Quantity" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
              <button type="submit" className="w-full bg-navy-900 text-white py-2.5 rounded-lg hover:bg-navy-800 transition font-medium">
                {editId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
