import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Truck, Package, ShoppingCart, DollarSign, Clock, Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import API_URL from '../config/api'


export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [monthlyData, setMonthlyData] = useState(null)
  const [yearlyData, setYearlyData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    axios.get(`${API_URL}/api/dashboard`)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => { setData({ total_clients: 0, total_suppliers: 0, total_products: 0, total_orders: 0, pending_orders: 0, total_purchase_orders: 0, pending_purchase_orders: 0, revenue: 0, spend: 0 }); setLoading(false) })
  }, [])

  useEffect(() => {
    if (activeTab === 'monthly') {
      axios.get(`${API_URL}/api/dashboard/monthly?year=${selectedYear}&month=${selectedMonth}`)
        .then(res => setMonthlyData(res.data))
        .catch(() => setMonthlyData(null))
    }
  }, [activeTab, selectedYear, selectedMonth])

  useEffect(() => {
    if (activeTab === 'yearly') {
      axios.get(`${API_URL}/api/dashboard/yearly?year=${selectedYear}`)
        .then(res => setYearlyData(res.data))
        .catch(() => setYearlyData(null))
    }
  }, [activeTab, selectedYear])

  const fmt = (v) => `Rs${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const downloadMonthlyReport = () => {
    if (!monthlyData) return
    const headers = ['Metric', 'Value']
    const rows = [
      ['Month', `${monthlyData.month_name} ${monthlyData.year}`],
      ['Total Orders', monthlyData.total_orders],
      ['Completed Orders', monthlyData.completed_orders],
      ['Pending Orders', monthlyData.pending_orders],
      ['Total Purchase Orders', monthlyData.total_purchase_orders],
      ['Received POs', monthlyData.received_pos],
      ['Pending POs', monthlyData.pending_pos],
      ['Revenue', fmt(monthlyData.revenue)],
      ['Spend', fmt(monthlyData.spend)],
      ['Profit', fmt(monthlyData.revenue - monthlyData.spend)],
      ['Total Clients', monthlyData.total_clients],
      ['Total Suppliers', monthlyData.total_suppliers],
    ]
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly_report_${monthlyData.month_name}_${monthlyData.year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadYearlyReport = () => {
    if (!yearlyData) return
    const headers = ['Month', 'Orders', 'Revenue', 'Purchase Orders', 'Spend']
    const rows = yearlyData.monthly_breakdown.map(m => [m.month, m.orders, fmt(m.revenue), m.purchase_orders, fmt(m.spend)])
    rows.push([])
    rows.push(['YEARLY TOTALS', '', '', '', ''])
    rows.push(['Total Orders', yearlyData.total_orders])
    rows.push(['Completed Orders', yearlyData.completed_orders])
    rows.push(['Total Revenue', fmt(yearlyData.revenue)])
    rows.push(['Total Spend', fmt(yearlyData.spend)])
    rows.push(['Net Profit', fmt(yearlyData.revenue - yearlyData.spend)])
    rows.push(['Total Clients', yearlyData.total_clients])
    rows.push(['Total Suppliers', yearlyData.total_suppliers])
    rows.push(['Total Products', yearlyData.total_products])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yearly_report_${yearlyData.year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12 text-navy-500">Loading dashboard...</div>

  const cards = [
    { label: 'Total Clients', value: data?.total_clients || 0, icon: Users, color: 'bg-navy-900' },
    { label: 'Total Suppliers', value: data?.total_suppliers || 0, icon: Truck, color: 'bg-navy-700' },
    { label: 'Products', value: data?.total_products || 0, icon: Package, color: 'bg-navy-600' },
    { label: 'Pending Orders', value: data?.pending_orders || 0, icon: Clock, color: 'bg-amber-500' },
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Dashboard</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Overview</button>
          <button onClick={() => setActiveTab('monthly')} className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'monthly' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Calendar size={16} /> Monthly</button>
          <button onClick={() => setActiveTab('yearly')} className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'yearly' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><TrendingUp size={16} /> Yearly</button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-navy-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue & Spend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-600 p-2 rounded-lg"><DollarSign size={20} className="text-white" /></div>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{fmt(data?.revenue)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500 p-2 rounded-lg"><ShoppingCart size={20} className="text-white" /></div>
                <p className="text-sm text-gray-500">Total Spend</p>
              </div>
              <p className="text-2xl font-bold text-red-500">{fmt(data?.spend)}</p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Quick Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-navy-50 rounded-lg">
                <p className="text-2xl font-bold text-navy-900">{data?.total_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total Orders</p>
              </div>
              <div className="p-4 bg-navy-50 rounded-lg">
                <p className="text-2xl font-bold text-navy-900">{data?.total_purchase_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Purchase Orders</p>
              </div>
              <div className="p-4 bg-navy-50 rounded-lg">
                <p className="text-2xl font-bold text-navy-900">{data?.pending_purchase_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Pending POs</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{fmt((data?.revenue || 0) - (data?.spend || 0))}</p>
                <p className="text-xs text-gray-500 mt-1">Net Profit</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Monthly Tab */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={downloadMonthlyReport}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition ml-auto">
              <Download size={18} /> Download Report
            </button>
          </div>

          {monthlyData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">{fmt(monthlyData.revenue)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Monthly Spend</p>
                  <p className="text-2xl font-bold text-red-500">{fmt(monthlyData.spend)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Monthly Profit</p>
                  <p className={`text-2xl font-bold ${(monthlyData.revenue - monthlyData.spend) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(monthlyData.revenue - monthlyData.spend)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">{monthlyData.month_name} {monthlyData.year} Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{monthlyData.total_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Orders</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{monthlyData.completed_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{monthlyData.pending_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{monthlyData.total_purchase_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Purchase Orders</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{monthlyData.total_clients}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Clients</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{monthlyData.total_suppliers}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Suppliers</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{monthlyData.received_pos}</p>
                    <p className="text-xs text-gray-500 mt-1">Received POs</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{monthlyData.pending_pos}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending POs</p>
                  </div>
                </div>
              </div>

              {/* Monthly Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-navy-700" />
                    <h3 className="text-lg font-semibold text-navy-900">Revenue vs Spend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { name: 'Revenue', value: monthlyData.revenue, fill: '#059669' },
                      { name: 'Spend', value: monthlyData.spend, fill: '#ef4444' },
                      { name: 'Profit', value: monthlyData.revenue - monthlyData.spend, fill: '#1e3a5f' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`Rs${value.toLocaleString()}`, 'Value']} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-navy-700" />
                    <h3 className="text-lg font-semibold text-navy-900">Orders Breakdown</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { name: 'Total Orders', value: monthlyData.total_orders, fill: '#1e3a5f' },
                      { name: 'Completed', value: monthlyData.completed_orders, fill: '#059669' },
                      { name: 'Pending', value: monthlyData.pending_orders, fill: '#f59e0b' },
                      { name: 'POs', value: monthlyData.total_purchase_orders, fill: '#6366f1' },
                      { name: 'Received', value: monthlyData.received_pos, fill: '#10b981' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No data available for this period</div>
          )}
        </div>
      )}

      {/* Yearly Tab */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={downloadYearlyReport}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition ml-auto">
              <Download size={18} /> Download Report
            </button>
          </div>

          {yearlyData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Yearly Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">{fmt(yearlyData.revenue)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Yearly Spend</p>
                  <p className="text-2xl font-bold text-red-500">{fmt(yearlyData.spend)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Yearly Profit</p>
                  <p className={`text-2xl font-bold ${(yearlyData.revenue - yearlyData.spend) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(yearlyData.revenue - yearlyData.spend)}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">{yearlyData.year} Monthly Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Month</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Orders</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Revenue</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">POs</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-navy-700 uppercase">Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {yearlyData.monthly_breakdown.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-navy-900">{m.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{m.orders}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{fmt(m.revenue)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{m.purchase_orders}</td>
                          <td className="px-4 py-3 text-sm text-red-500 font-medium">{fmt(m.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Yearly Charts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-navy-700" />
                  <h3 className="text-lg font-semibold text-navy-900">Revenue vs Spend Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={yearlyData.monthly_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value, name) => [name === 'Revenue' || name === 'Spend' ? `Rs${value.toLocaleString()}` : value, name]} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#d1fae5" stroke="#059669" name="Revenue" />
                    <Area yAxisId="left" type="monotone" dataKey="spend" fill="#fee2e2" stroke="#ef4444" name="Spend" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#1e3a5f" strokeWidth={2} name="Orders" dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-navy-700" />
                    <h3 className="text-lg font-semibold text-navy-900">Monthly Revenue</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={yearlyData.monthly_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`Rs${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-navy-700" />
                    <h3 className="text-lg font-semibold text-navy-900">Monthly Spend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={yearlyData.monthly_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`Rs${value.toLocaleString()}`, 'Spend']} />
                      <Bar dataKey="spend" fill="#ef4444" radius={[6, 6, 0, 0]} name="Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-navy-700" />
                  <h3 className="text-lg font-semibold text-navy-900">Orders Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={yearlyData.monthly_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#1e3a5f" strokeWidth={2} name="Orders" dot={{ r: 5, fill: '#1e3a5f' }} />
                    <Line type="monotone" dataKey="purchase_orders" stroke="#6366f1" strokeWidth={2} name="Purchase Orders" dot={{ r: 5, fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">{yearlyData.year} Totals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{yearlyData.total_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Orders</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{yearlyData.completed_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{yearlyData.total_clients}</p>
                    <p className="text-xs text-gray-500 mt-1">Clients</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{yearlyData.total_suppliers}</p>
                    <p className="text-xs text-gray-500 mt-1">Suppliers</p>
                  </div>
                  <div className="p-4 bg-navy-50 rounded-lg">
                    <p className="text-2xl font-bold text-navy-900">{yearlyData.total_products}</p>
                    <p className="text-xs text-gray-500 mt-1">Products</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{yearlyData.received_pos}</p>
                    <p className="text-xs text-gray-500 mt-1">Received POs</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{yearlyData.pending_orders}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending Orders</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{yearlyData.pending_pos}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending POs</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No data available for this period</div>
          )}
        </div>
      )}
    </div>
  )
}
