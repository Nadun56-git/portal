import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2, X, Download, Printer } from 'lucide-react'
import API_URL from '../config/api'

export default function PurchaseOrders() {
  const [pos, setPos] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ supplier_id: '', date: new Date().toISOString().split('T')[0], expected_delivery: '', status: 'pending', items: [] })

  const fetchData = () => {
    axios.get(`${API_URL}/api/purchase-orders`).then(res => setPos(res.data)).catch(() => setPos([]))
    axios.get(`${API_URL}/api/suppliers`).then(res => setSuppliers(res.data)).catch(() => setSuppliers([]))
    axios.get(`${API_URL}/api/products`).then(res => setProducts(res.data)).catch(() => setProducts([]))
  }

  useEffect(() => { fetchData() }, [])

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', product_name: '', quantity: 1, unit_cost: 0, total: 0 }] })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...form.items]
    newItems[index][field] = value
    if (field === 'product_id') {
      const product = products.find(p => p._id === value)
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].unit_cost = product.cost_price
      }
    }
    newItems[index].total = newItems[index].quantity * newItems[index].unit_cost
    setForm({ ...form, items: newItems })
  }

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const getTotal = () => form.items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, total_cost: getTotal() }
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/purchase-orders/${editId}`, payload)
      } else {
        await axios.post(`${API_URL}/api/purchase-orders`, payload)
      }
      setShowModal(false)
      setForm({ supplier_id: '', date: new Date().toISOString().split('T')[0], expected_delivery: '', status: 'pending', items: [] })
      setEditId(null)
      fetchData()
    } catch (err) {
      alert('Error: Could not connect to server. Make sure the backend is running.')
    }
  }

  const handleEdit = (po) => {
    setForm({ supplier_id: po.supplier_id, date: po.date, expected_delivery: po.expected_delivery, status: po.status, items: po.items || [] })
    setEditId(po._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this purchase order?')) {
      await axios.delete(`${API_URL}/api/purchase-orders/${id}`)
      fetchData()
    }
  }

  const getSupplierName = (id) => suppliers.find(s => s._id === id)?.name || 'Unknown'

  const filtered = pos.filter(po =>
    getSupplierName(po.supplier_id).toLowerCase().includes(search.toLowerCase())
  )

  const currencySymbol = (c) => c === 'LKR' ? 'Rs' : '$'

  const statusColors = { pending: 'bg-amber-100 text-amber-700', received: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' }

  const downloadReport = () => {
    const headers = ['Supplier', 'Date', 'Expected Delivery', 'Items', 'Total Cost (Rs)', 'Status']
    const rows = filtered.map(po => [getSupplierName(po.supplier_id), po.date, po.expected_delivery, (po.items?.length || 0) + ' items', `Rs${po.total_cost}`, po.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase_orders_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pendingCount = filtered.filter(po => po.status === 'pending').length
  const receivedCount = filtered.filter(po => po.status === 'received').length
  const totalSpend = filtered.filter(po => po.status === 'received').reduce((sum, po) => sum + (po.total_cost || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Purchase Orders</h2>
        <div className="flex gap-2">
          <button onClick={downloadReport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            <Download size={18} /> Report
          </button>
          <button onClick={() => { setForm({ supplier_id: '', date: new Date().toISOString().split('T')[0], expected_delivery: '', status: 'pending', items: [] }); setEditId(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition">
            <Plus size={18} /> New PO
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total POs</p>
          <p className="text-2xl font-bold text-navy-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Received</p>
          <p className="text-2xl font-bold text-emerald-600">{receivedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Spend</p>
          <p className="text-2xl font-bold text-red-500">Rs{totalSpend.toFixed(2)}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" placeholder="Search by supplier..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Supplier</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Expected Delivery</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Items</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Total Cost</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(po => (
              <tr key={po._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{getSupplierName(po.supplier_id)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{po.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{po.expected_delivery}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{po.items?.length || 0} items</td>
                <td className="px-6 py-4 text-sm font-medium text-navy-900">Rs{po.total_cost?.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[po.status] || statusColors.pending}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {po.status === 'received' && (
                    <Link to={`/purchase-orders/${po._id}/grn`} title="Preview GRN"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                      <Printer size={16} />
                    </Link>
                  )}
                  <button onClick={() => handleEdit(po)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(po._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No purchase orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">{editId ? 'Edit Purchase Order' : 'New Purchase Order'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <select required value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                <input required type="date" value={form.expected_delivery} onChange={e => setForm({...form, expected_delivery: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-navy-700">Items</label>
                  <button type="button" onClick={addItem} className="text-sm text-navy-600 hover:text-navy-900 flex items-center gap-1">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                {form.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <select required value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} (Rs{p.cost_price})</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Qty" />
                    <span className="text-sm text-gray-600 w-20 text-right">Rs{item.total?.toFixed(2)}</span>
                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                ))}
                {form.items.length > 0 && (
                  <div className="text-right text-sm font-semibold text-navy-900 mt-2">Total: Rs{getTotal().toFixed(2)}</div>
                )}
              </div>

              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button type="submit" className="w-full bg-navy-900 text-white py-2.5 rounded-lg hover:bg-navy-800 transition font-medium">
                {editId ? 'Update PO' : 'Create PO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
