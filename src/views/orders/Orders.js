import React, { useEffect, useState } from "react"
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CButton, CModal,
  CModalHeader, CModalTitle, CModalBody
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilViewColumn, cilCart } from "@coreui/icons"

import {getOrders} from '../../services/ordersService'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const perPage = 10

  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  const fetchOrders = async () => {
    setLoading(true)
    const res = await getOrders()
    setOrders(res) 
    setLoading(false)
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      const res = await getOrders()
      setOrders(res)
      setLoading(false)
    }
    fetchOrders()
  }, [])
  

  const current = orders.slice((page - 1) * perPage, page * perPage)

  const statusColor = (s) => ({
    PLACED: "secondary",
    ACCEPTED: "info",
    PACKED: "warning",
    OUT_FOR_DELIVERY: "primary",
    DELIVERED: "success",
    CANCELLED: "danger"
  }[s] || "light")

  if (loading) return <CSpinner color="primary" />

  return (
    <>
      <h4 className="mb-3">Orders</h4>

      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className='text-center'> <CIcon icon={cilCart} /> Order ID</CTableHeaderCell>
            <CTableHeaderCell>Retailer</CTableHeaderCell>
            <CTableHeaderCell>Items</CTableHeaderCell>
            <CTableHeaderCell>Total</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Payment</CTableHeaderCell>
            <CTableHeaderCell>Created</CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {current.map(o => (
            <CTableRow key={o.orderId}>
              <CTableDataCell>{o.orderId}</CTableDataCell>
              <CTableDataCell>{o.retailerId}</CTableDataCell>
              <CTableDataCell>{o.items.length}</CTableDataCell>
              <CTableDataCell>₹ {o.billing.grandTotal}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={statusColor(o.orderStatus)}>
                  {o.orderStatus}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                {o.payment.mode} ({o.payment.status})
              </CTableDataCell>
              <CTableDataCell>{formatIST(o.createdAt)}</CTableDataCell>
              <CTableDataCell>
                <CIcon
                  icon={cilViewColumn}
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(o)
                    setDetailVisible(true)
                  }}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(orders.length / perPage)).keys()].map(n => (
          <CPaginationItem
            key={n}
            active={page === n + 1}
            onClick={() => setPage(n + 1)}
          >
            {n + 1}
          </CPaginationItem>
        ))}
      </CPagination>

      {/* ORDER DETAIL MODAL */}
      <CModal size="lg" visible={detailVisible} onClose={() => setDetailVisible(false)}>
        <CModalHeader>
          <CModalTitle>Order Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedOrder && (
            <>
              <h6>Items</h6>
              {selectedOrder.items.map((i, idx) => (
                <div key={idx} className="border p-2 mb-2">
                  {i.productName} — {i.quantity} × ₹{i.price}
                </div>
              ))}

              <hr />
              <p><b>Item Total:</b> ₹{selectedOrder.billing.itemTotal}</p>
              <p><b>Delivery:</b> ₹{selectedOrder.billing.deliveryCharge}</p>
              <p><b>Tax:</b> ₹{selectedOrder.billing.tax}</p>
              <h5>Grand Total: ₹{selectedOrder.billing.grandTotal}</h5>
            </>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default Orders
