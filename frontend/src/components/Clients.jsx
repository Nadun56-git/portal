import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2, X, Download, Users } from 'lucide-react'

const API_URL = 'http://localhost:8001'
const emptyForm = { name: '', company: '', email: '', phone: '', address: '', status: 'active' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const fetchClients = () => {
    axios.get(`${API_URL}/api/clients`).then(res => setClients(res.data)).catch(() => setClients([]))
  }

  useEffect(() => { fetchClients() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/clients/${editId}`, form)
      } else {
        await axios.post(`${API_URL}/api/clients`, form)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditId(null)
      fetchClients()
    } catch (err) {
      alert('Error: Could not connect to server. Make sure the backend is running.')
    }
  }

  const handleEdit = (client) => {
    setForm({ name: client.name, company: client.company, email: client.email, phone: client.phone, address: client.address, status: client.status })
    setEditId(client._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client?')) {
      await axios.delete(`${API_URL}/api/clients/${id}`)
      fetchClients()
    }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = filtered.filter(c => c.status === 'active').length
  const inactiveCount = filtered.filter(c => c.status === 'inactive').length

  const downloadReport = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Status']
    const rows = filtered.map(c => [c.name, c.company, c.email, c.phone, c.address, c.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Clients</h2>
        <div className="flex gap-2">
          <button onClick={downloadReport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            <Download size={18} /> Report
          </button>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition">
            <Plus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-navy-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Company</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Address</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(client => (
              <tr key={client._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-navy-900">{client.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.company}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.address || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(client)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(client._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No clients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">{editId ? 'Edit Client' : 'Add Client'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <input required placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <input required placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500" />
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="submit" className="w-full bg-navy-900 text-white py-2.5 rounded-lg hover:bg-navy-800 transition font-medium">
                {editId ? 'Update Client' : 'Add Client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
