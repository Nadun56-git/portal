import { useState, useEffect } from 'react'
import { COMPANY } from '../config/company'

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtDate = (s) => {
  if (!s) return ''
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00')
  if (isNaN(d)) return s
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
}
const fmtAmt = (n) =>
  (parseFloat(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const padGrn = (id) => String(id ?? '').replace(/\D/g, '').padStart(5, '0').slice(-5)

/* ─────────────────────────────────────────
   Editable field components
───────────────────────────────────────── */
const EInput = ({ value, onChange, width = '120px', align = 'left', mono = false, style = {} }) => (
  <input
    className="grn-editable"
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width,
      textAlign: align,
      fontFamily: mono ? 'monospace' : 'inherit',
      fontSize: 'inherit',
      color: 'inherit',
      background: 'transparent',
      border: 'none',
      borderBottom: '1px dashed #bbb',
      outline: 'none',
      padding: '0 2px',
      lineHeight: 'inherit',
      ...style,
    }}
  />
)

const ETextarea = ({ value, onChange, width = '100%', rows = 2 }) => (
  <textarea
    className="grn-editable"
    value={value}
    onChange={e => onChange(e.target.value)}
    rows={rows}
    style={{
      width,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      color: 'inherit',
      background: 'transparent',
      border: 'none',
      borderBottom: '1px dashed #bbb',
      outline: 'none',
      padding: '0 2px',
      resize: 'none',
      lineHeight: '1.4',
    }}
  />
)

/* ─────────────────────────────────────────
   Label + Editable row
───────────────────────────────────────── */
const LabelRow = ({ label, children, labelWidth = '96px' }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px', gap: '4px' }}>
    <span style={{ fontWeight: '700', minWidth: labelWidth, flexShrink: 0, fontSize: '10px' }}>{label}:</span>
    {children}
  </div>
)

/* ─────────────────────────────────────────
   Table helpers
───────────────────────────────────────── */
const Th = ({ children, style = {} }) => (
  <th style={{
    border: '1px solid #000', padding: '3px 5px', textAlign: 'left',
    fontWeight: '700', background: '#fff', fontSize: '10px', ...style,
  }}>{children}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{
    border: '1px solid #000', padding: '2px 4px',
    verticalAlign: 'middle', fontSize: '10px', ...style,
  }}>{children}</td>
)

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function GrnPrint({ purchaseOrder, supplier }) {
  /* ── Build initial state from props ── */
  const buildState = () => ({
    grnNo:          purchaseOrder?.grn_number || padGrn(purchaseOrder?._id) || '',
    date:           fmtDate(purchaseOrder?.received_date || purchaseOrder?.date),
    supplierName:   supplier?.name || '',
    supplierAddr:   supplier?.address || '',
    supplierPhone:  supplier?.phone || '',
    supplierFax:    supplier?.fax || '',
    contactName:    COMPANY.contractName,
    contactNo:      purchaseOrder?.contact_no || '',
    reqNo:          purchaseOrder?.requisition_no || 'N/A',
    reqDate:        fmtDate(purchaseOrder?.date),
    reqTill:        fmtDate(purchaseOrder?.expected_delivery),
    reqBy:          purchaseOrder?.requisition_by || supplier?.contact_person || '',
    reqTel:         purchaseOrder?.requisition_tel || '',
    currency:       purchaseOrder?.currency || 'LKR',
    deliveryReq:    purchaseOrder?.delivery_required || 'ASAP',
    deliveryAddr:   purchaseOrder?.delivery_address || COMPANY.deliveryAddress,
    receivedBy:     purchaseOrder?.received_by || supplier?.contact_person || '',
    receivedPhone:  purchaseOrder?.received_by_phone || supplier?.phone || '',
    vatNo:          COMPANY.vatAicNo,
    paymentTerms:   supplier?.payment_terms || COMPANY.defaultPaymentTerms,
    remarks:        purchaseOrder?.remarks || '',
    reviewedDate:   fmtDate(purchaseOrder?.reviewed_date || ''),
    authDate:       fmtDate(purchaseOrder?.received_date || purchaseOrder?.date),
    items: (purchaseOrder?.items || []).map((it, i) => ({
      no:       String(i + 1),
      costCode: it.cost_code || '',
      desc:     it.product_name || '',
      qty:      Number(it.quantity).toFixed(2),
      unit:     it.unit || '',
      rate:     fmtAmt(it.unit_cost),
      amount:   fmtAmt(it.total),
    })),
  })

  const [d, setD] = useState(buildState)

  useEffect(() => {
    if (purchaseOrder) setD(buildState())
  }, [purchaseOrder, supplier])

  const set = (key, val) => setD(prev => ({ ...prev, [key]: val }))

  const setItem = (idx, key, val) =>
    setD(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [key]: val } : it),
    }))

  const addRow = () =>
    setD(prev => ({
      ...prev,
      items: [...prev.items, { no: String(prev.items.length + 1), costCode: '', desc: '', qty: '', unit: '', rate: '', amount: '' }],
    }))

  // Ensure at least 4 visible rows
  const MIN_ROWS = 4
  const displayItems = d.items.length >= MIN_ROWS
    ? d.items
    : [...d.items, ...Array(MIN_ROWS - d.items.length).fill({ no: '', costCode: '', desc: '', qty: '', unit: '', rate: '', amount: '' })]

  /* ── Compute total from amount column ── */
  const total = d.items.reduce((s, it) => s + (parseFloat(it.amount?.replace(/,/g, '')) || 0), 0)

  if (!purchaseOrder) return null

  return (
    <div
      id="grn-document"
      style={{
        width: '210mm',
        minHeight: '297mm',
        background: '#fff',
        color: '#000',
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: '10px',
        lineHeight: '1.45',
        position: 'relative',
        padding: '10mm 14mm 12mm 20mm',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Left spine text ── */}
      <div style={{
        position: 'absolute', left: '3px', top: 0, bottom: 0,
        width: '14px', display: 'flex', alignItems: 'center',
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        fontSize: '6.5px', color: '#333', letterSpacing: '0.04em',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        THIS ORDER IS SUBJECT TO THE TERMS AND CONDITIONS SET OUT ABOVE AND OVERLEAF.
      </div>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ textAlign: 'right', marginRight: '8px' }}>
          <div style={{ fontSize: '8px', color: '#555', marginBottom: '1px' }}>{COMPANY.address}</div>
          <div style={{ fontWeight: '700', fontSize: '10.5px', letterSpacing: '0.02em' }}>{COMPANY.name}</div>
        </div>
        <img src="/chec_logo.png" alt="Logo"
          style={{ width: '46px', height: '46px', objectFit: 'contain', flexShrink: 0 }} />
      </div>

      {/* Title */}
      <h1 style={{
        textAlign: 'center', fontWeight: '700', fontSize: '13px',
        letterSpacing: '0.06em', margin: '4px 0 10px', textTransform: 'uppercase',
      }}>
        Goods Received Note
      </h1>

      {/* ══════════════════════════════════════
          SUPPLIER  |  GRN META
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>

        {/* LEFT – Supplier */}
        <div>
          <LabelRow label="SUPPLIER">
            <EInput value={d.supplierName} onChange={v => set('supplierName', v)} width="160px"
              style={{ fontWeight: '700' }} />
          </LabelRow>
          <div style={{ paddingLeft: '100px', marginBottom: '2px' }}>
            <ETextarea value={d.supplierAddr} onChange={v => set('supplierAddr', v)} rows={2} />
          </div>
          <LabelRow label="Contact Tel">
            <EInput value={d.supplierPhone} onChange={v => set('supplierPhone', v)} width="130px" />
          </LabelRow>
          <LabelRow label="Contact Name">
            <EInput value={d.contactName} onChange={v => set('contactName', v)} width="150px" />
          </LabelRow>
          <LabelRow label="Contact No.">
            <EInput value={d.contactNo} onChange={v => set('contactNo', v)} width="130px" />
          </LabelRow>
        </div>

        {/* RIGHT – GRN Meta */}
        <div>
          <LabelRow label="GRN No">
            <EInput value={d.grnNo} onChange={v => set('grnNo', v)} width="100px" style={{ fontWeight: '700' }} />
          </LabelRow>
          <LabelRow label="Date">
            <EInput value={d.date} onChange={v => set('date', v)} width="100px" />
          </LabelRow>
          <LabelRow label="Supplier Fax">
            <EInput value={d.supplierFax} onChange={v => set('supplierFax', v)} width="100px" />
          </LabelRow>
          <LabelRow label="Requisition No">
            <EInput value={d.reqNo} onChange={v => set('reqNo', v)} width="100px" />
          </LabelRow>
          <LabelRow label="Requisition Date">
            <EInput value={d.reqDate} onChange={v => set('reqDate', v)} width="100px" />
          </LabelRow>
          <LabelRow label="Till">
            <EInput value={d.reqTill} onChange={v => set('reqTill', v)} width="100px" />
          </LabelRow>
          <LabelRow label="Requisition by">
            <EInput value={d.reqBy} onChange={v => set('reqBy', v)} width="110px" />
          </LabelRow>
          <LabelRow label="Tel">
            <EInput value={d.reqTel} onChange={v => set('reqTel', v)} width="110px" />
          </LabelRow>
          <LabelRow label="Currency">
            <EInput value={d.currency} onChange={v => set('currency', v)} width="70px" />
          </LabelRow>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ITEMS TABLE
      ══════════════════════════════════════ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
        <thead>
          <tr>
            <Th style={{ width: '26px', textAlign: 'center' }}>Item</Th>
            <Th style={{ width: '55px' }}>Cost Code</Th>
            <Th>Description</Th>
            <Th style={{ width: '50px', textAlign: 'right' }}>Quantity</Th>
            <Th style={{ width: '34px', textAlign: 'center' }}>Unit</Th>
            <Th style={{ width: '78px', textAlign: 'right' }}>Rate (LKR)</Th>
            <Th style={{ width: '88px', textAlign: 'right' }}>Amount (LKR)</Th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => {
            const isData = idx < d.items.length
            return (
              <tr key={idx} style={{ height: '22px' }}>
                <Td style={{ textAlign: 'center' }}>
                  {isData
                    ? <EInput value={item.no} onChange={v => setItem(idx, 'no', v)} width="20px" align="center" />
                    : <span>&nbsp;</span>}
                </Td>
                <Td>
                  {isData
                    ? <EInput value={item.costCode} onChange={v => setItem(idx, 'costCode', v)} width="50px" />
                    : <span>&nbsp;</span>}
                </Td>
                <Td>
                  {isData
                    ? <EInput value={item.desc} onChange={v => setItem(idx, 'desc', v)} width="100%" style={{ display: 'block' }} />
                    : <span>&nbsp;</span>}
                </Td>
                <Td style={{ textAlign: 'right' }}>
                  {isData
                    ? <EInput value={item.qty} onChange={v => setItem(idx, 'qty', v)} width="44px" align="right" />
                    : <span>&nbsp;</span>}
                </Td>
                <Td style={{ textAlign: 'center' }}>
                  {isData
                    ? <EInput value={item.unit} onChange={v => setItem(idx, 'unit', v)} width="28px" align="center" />
                    : <span>&nbsp;</span>}
                </Td>
                <Td style={{ textAlign: 'right' }}>
                  {isData
                    ? <EInput value={item.rate} onChange={v => setItem(idx, 'rate', v)} width="72px" align="right" />
                    : <span>&nbsp;</span>}
                </Td>
                <Td style={{ textAlign: 'right' }}>
                  {isData
                    ? <EInput value={item.amount} onChange={v => setItem(idx, 'amount', v)} width="82px" align="right" />
                    : <span>&nbsp;</span>}
                </Td>
              </tr>
            )
          })}

          {/* Total row */}
          <tr>
            <td colSpan={5} style={{ border: '1px solid #000', padding: '3px 5px', fontWeight: '700', fontSize: '10px' }}>
              Total Amount ({d.currency || 'LKR'}) :
            </td>
            <Td style={{ textAlign: 'right', fontWeight: '700' }}>&nbsp;</Td>
            <Td style={{ textAlign: 'right', fontWeight: '700' }}>
              {fmtAmt(total)}
            </Td>
          </tr>
        </tbody>
      </table>

      {/* Add row button — hidden on print */}
      <button
        className="grn-no-print"
        onClick={addRow}
        style={{
          fontSize: '9px', padding: '2px 10px', marginBottom: '8px',
          background: '#e0f2fe', border: '1px solid #7dd3fc',
          borderRadius: '4px', cursor: 'pointer', color: '#0369a1',
        }}
      >
        + Add Row
      </button>

      {/* ══════════════════════════════════════
          DELIVERY  |  REMARKS
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

        {/* Left – Delivery */}
        <div>
          <LabelRow label="DELIVERY REQUIRED" labelWidth="120px">
            <EInput value={d.deliveryReq} onChange={v => set('deliveryReq', v)} width="80px"
              style={{ fontWeight: '700' }} />
          </LabelRow>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Delivery Address:</div>
            <ETextarea value={d.deliveryAddr} onChange={v => set('deliveryAddr', v)} rows={2} />
          </div>
          <div>
            <span style={{ fontWeight: '700' }}>Received By: </span>
            <EInput value={d.receivedBy} onChange={v => set('receivedBy', v)} width="110px" />
            {' - '}
            <EInput value={d.receivedPhone} onChange={v => set('receivedPhone', v)} width="90px" />
          </div>
        </div>

        {/* Right – Remarks */}
        <div>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>Remarks:</div>
          <div style={{ marginBottom: '2px' }}>
            A: Our VAT A/C No. :{' '}
            <EInput value={d.vatNo} onChange={v => set('vatNo', v)} width="130px" />
          </div>
          <div style={{ marginBottom: '2px' }}>
            B: Payment terms:{' '}
            <EInput value={d.paymentTerms} onChange={v => set('paymentTerms', v)} width="110px" />
          </div>
          {d.remarks !== undefined && (
            <div style={{ marginTop: '4px' }}>
              <ETextarea value={d.remarks} onChange={v => set('remarks', v)} rows={2} />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          NOTES
      ══════════════════════════════════════ */}
      <div style={{ fontSize: '8.5px', lineHeight: '1.5', maxWidth: '70%', marginBottom: '14px' }}>
        <div style={{ fontWeight: '700', marginBottom: '2px' }}>Note:</div>
        <div>1. Supplier is required to send invoice, delivery note and correspondence in accordance with this GRN.</div>
        <div>2. All invoice must be sent to the above address for the attention of Accounts Department (if payment not cash) once your correspondences/documents is as attached (if any).</div>
        <div>3. Related Costs Should be Separate Account.</div>
      </div>

      {/* ══════════════════════════════════════
          SIGNATURES
      ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Reviewed By */}
        <div>
          <div style={{ fontWeight: '700', marginBottom: '32px', fontSize: '10px' }}>REVIEWED BY</div>
          <div style={{ borderBottom: '1px solid #000', width: '160px', marginBottom: '4px' }}>&nbsp;</div>
          <div>Date: <EInput value={d.reviewedDate} onChange={v => set('reviewedDate', v)} width="100px" /></div>
        </div>

        {/* Authorized Signature */}
        <div>
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>For and On behalf of</div>
          <div style={{ fontWeight: '700', fontSize: '10px', marginBottom: '1px' }}>{COMPANY.name}</div>
          <div style={{ fontWeight: '700', marginBottom: '32px', fontSize: '10px' }}>AUTHORIZED SIGNATURE</div>
          <div style={{ borderBottom: '1px solid #000', width: '160px', marginBottom: '4px' }}>&nbsp;</div>
          <div>Date: <EInput value={d.authDate} onChange={v => set('authDate', v)} width="100px" /></div>
        </div>
      </div>
    </div>
  )
}
