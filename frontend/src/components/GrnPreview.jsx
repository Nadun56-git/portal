import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Printer, ArrowLeft, Edit3 } from 'lucide-react'
import GrnPrint from './GrnPrint'

const API_URL = 'http://localhost:8001'

export default function GrnPreview() {
  const { id } = useParams()
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const poRes = await axios.get(`${API_URL}/api/purchase-orders/${id}`)
        const po = poRes.data
        setPurchaseOrder(po)
        if (po.supplier_id) {
          const supplierRes = await axios.get(`${API_URL}/api/suppliers/${po.supplier_id}`)
          setSupplier(supplierRes.data)
        }
      } catch {
        setError('Could not load purchase order. Make sure the backend is running and the PO exists.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading GRN…</p>
      </div>
    )
  }

  if (error || !purchaseOrder) {
    return (
      <div style={{ minHeight: '100vh', background: '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Purchase order not found'}</p>
        <Link to="/purchase-orders" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Purchase Orders
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', paddingBottom: '40px' }}>

      {/* ── Toolbar ── */}
      <div className="grn-no-print" style={{
        display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center',
        background: '#1e293b', borderRadius: '12px', padding: '10px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Edit3 size={14} /> Click any field to edit
        </span>
        <div style={{ width: '1px', height: '20px', background: '#334155' }} />
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#059669', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: '8px', fontWeight: '600',
            fontSize: '13px', cursor: 'pointer',
          }}
        >
          <Printer size={16} /> Print / Save PDF
        </button>
        <Link to="/purchase-orders" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#475569', color: '#fff',
          padding: '8px 14px', borderRadius: '8px',
          fontWeight: '600', fontSize: '13px', textDecoration: 'none',
        }}>
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* ── Document ── */}
      <div className="grn-print-area" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <GrnPrint purchaseOrder={purchaseOrder} supplier={supplier} />
      </div>
    </div>
  )
}
