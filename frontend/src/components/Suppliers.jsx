import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2, X, Download } from 'lucide-react'

const API_URL = 'http://localhost:8001'
const emptyForm = {
  name: '', type: '', contact_person: '', phone: '', email: '',
  address: '', product_service: '', payment_terms: 'Net 30', monthly_avg: 0
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const fetchSuppliers = () => {
    axios.get(`${API_URL}/api/suppliers`).then(res => setSuppliers(res.data)).catch(() => setSuppliers([]))
  }

  useEffect(() => { fetchSuppliers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, monthly_avg: parseFloat(form.monthly_avg) || 0 }
      if (editId) {
        await axios.put(`${API_URL}/api/suppliers/${editId}`, payload)
      } else {
        await axios.post(`${API_URL}/api/suppliers`, payload)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditId(null)
      fetchSuppliers()
    } catch (err) {
      alert('Error: Could not connect to server. Make sure the backend is running.')
    }
  }

  const handleEdit = (supplier) => {
    setForm({
      name: supplier.name || '', type: supplier.type || '', contact_person: supplier.contact_person || '',
      phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '',
      product_service: supplier.product_service || '', payment_terms: supplier.payment_terms || 'Net 30',
      monthly_avg: supplier.monthly_avg || 0
    })
    setEditId(supplier._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      await axios.delete(`${API_URL}/api/suppliers/${id}`)
      fetchSuppliers()
    }
  }

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.type || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.product_service || '').toLowerCase().includes(search.toLowerCase())
  )

  const currencySymbol = (c) => c === 'LKR' ? 'Rs' : '$'

  const downloadReport = () => {
    const headers = ['Type', 'Supplier Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Product/Service', 'Payment Terms', 'Monthly Avg (Rs)']
    const rows = filtered.map(s => [s.type, s.name, s.contact_person, s.phone, s.email, s.address, s.product_service, s.payment_terms, `Rs${(s.monthly_avg || 0).toFixed(2)}`])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suppliers_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate total monthly spend across all suppliers
  const totalMonthlyLKR = filtered.reduce((sum, s) => sum + (s.monthly_avg || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Suppliers</h2>
        <div className="flex gap-2">
          <button onClick={downloadReport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            <Download size={18} /> Report
          </button>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition">
            <Plus size={18} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Suppliers</p>
          <p className="text-2xl font-bold text-navy-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Monthly Spend</p>
          <p className="text-2xl font-bold text-emerald-600">Rs{totalMonthlyLKR.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg per Supplier</p>
          <p className="text-2xl font-bold text-navy-700">
            Rs{filtered.length > 0 ? (totalMonthlyLKR / filtered.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Supplier Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Contact Person</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Product/Service</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Payment Terms</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Monthly Avg</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(supplier => (
              <tr key={supplier._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-700">
                    {supplier.type || '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-navy-900">{supplier.name}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{supplier.contact_person}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{supplier.phone}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{supplier.email}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{supplier.product_service || '-'}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{supplier.payment_terms}</td>
                <td className="px-4 py-4 text-sm font-semibold text-emerald-600">Rs{(supplier.monthly_avg || 0).toFixed(2)}</td>
                <td className="px-4 py-4 flex gap-2">
                  <button onClick={() => handleEdit(supplier)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(supplier._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-400">No suppliers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">{editId ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type / Category</label>
                  <input required placeholder="e.g. Raw Materials" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Supplier Name</label>
                  <input required placeholder="Company name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Contact Person</label>
                  <input required placeholder="Full name" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
                  <input required placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input required type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Address</label>
                <input placeholder="Full address" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Product / Service</label>
                <input placeholder="What do they supply?" value={form.product_service} onChange={e => setForm({...form, product_service: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Payment Terms</label>
                  <input placeholder="e.g. Net 30, COD" value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Monthly Avg (Rs)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={form.monthly_avg} onChange={e => setForm({...form, monthly_avg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-navy-900 text-white py-2.5 rounded-lg hover:bg-navy-800 transition font-medium mt-2">
                {editId ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
