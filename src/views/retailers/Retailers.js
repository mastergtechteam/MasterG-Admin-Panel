import React, { useEffect, useState } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CBadge,
    CPagination, CPaginationItem, CSpinner, CAvatar,
    CButton, CModal, CModalHeader, CModalTitle,
    CModalBody, CModalFooter, CFormInput, CFormSelect,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem   
  } from '@coreui/react'
  
  import { cilBuilding, cilTrash, cilZoom, cilPencil, cilCloudDownload,
    cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import config from '../../config'
import {
    getRetailers,
    getRetailerById,
    createRetailer,
    updateRetailer,
    deleteRetailer
  } from '../../services/retailerService'

  import {
    exportToCSV,
    exportToExcel,
    exportToPDF
  } from "../../utils/exportUtils"
  
  

import { getOrdersByRetailer } from '../../services/ordersService'




const Retailers = () => {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [visible, setVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [selectedRetailer, setSelectedRetailer] = useState(null)

  const [orders, setOrders] = useState([])
  const [orderVisible, setOrderVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const formatDate = (d) => new Date(d).toLocaleDateString()

  const exportData = retailers.map(r => ({
    Retailer_ID: r.retailerId,
    Store_Name: r.storeName,
    Owner_Name: r.ownerName,
    Mobile: r.contact?.mobile || '',
    Email: r.contact?.email || '',
    City: r.address?.city || '',
    State: r.address?.state || '',
    Status: r.status,
    Total_Products: r.inventorySummary?.totalProducts || 0,
    Created_At: formatDate(r.createdAt)
  }))
  

  const [form, setForm] = useState({
    storeName: '',
    ownerName: '',
    status: 'ACTIVE',
    contact: {
      mobile: '',
      alternateMobile: '',
      email: ''
    },
    address: {
      line1: '',
      line2: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  const fetchRetailers = async () => {
    setLoading(true)
    const data = await getRetailers()
    setRetailers(data)
    setLoading(false)
  }
  

  useEffect(() => {
    fetchRetailers()
  }, [])



  const current = retailers.slice((page - 1) * perPage, page * perPage)

  const getAddress = (address) => {
    if (!address) return 'N/A'
    if (typeof address === 'string') return address
    return `${address.line1 || ''}, ${address.city || ''}`
  }

  const getContact = (contact) => {
    if (!contact) return 'N/A'
    if (typeof contact === 'string') return contact
    return contact.mobile
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this retailer?")) return
    await fetch(`${config.BASE_URL}/retailers/${id}`, { method: 'DELETE' })
    fetchRetailers()
  }

  const handleView = async (id) => {
    const res = await getRetailerById(id)
    if (res.success) {
      setSelectedRetailer(res.data)
  
      const orderRes = await getOrdersByRetailer(id)
      if (orderRes.success) {
        setOrders(orderRes.data)
      }
  
      setDetailVisible(true)
    }
  }
  
  

  const handleEdit = async (id) => {
    const res = await getRetailerById(id)
    if (!res.success) return alert("Failed")
  
    const r = res.data
  
    setForm({
      storeName: r.storeName,
      ownerName: r.ownerName,
      status: r.status,
      contact: r.contact || {},
      address: r.address || {}
    })
  
    setEditId(id)
    setIsEdit(true)
    setVisible(true)
  }

  const handleSubmit = async () => {
    if (!form.storeName || !form.ownerName) {
      alert("Required fields missing")
      return
    }
  
    const res = isEdit
      ? await updateRetailer(editId, form)
      : await createRetailer(form)
  
    if (res.success) {
      setVisible(false)
      setIsEdit(false)
      setEditId(null)
      fetchRetailers()
    }
  }
  
  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
    <div className="d-flex justify-content-between align-items-center mb-3">

{/* LEFT: Title */}
<h5 className="mb-0 fw-semibold">Retailers</h5>

{/* RIGHT: Actions */}
<div className="d-flex gap-2">

  {/* EXPORT DROPDOWN */}
  <CDropdown>
    <CDropdownToggle color="light" size="sm" className="border">
      <CIcon icon={cilCloudDownload} className="me-1" />
      Export
    </CDropdownToggle>

    <CDropdownMenu>
      <CDropdownItem
        onClick={() => exportToExcel(exportData, "Retailers")}
      >
        📗 Export Excel
      </CDropdownItem>

      <CDropdownItem
        onClick={() => exportToCSV(exportData, "Retailers")}
      >
        📄 Export CSV
      </CDropdownItem>

      <CDropdownItem
        onClick={() => {
          if (!exportData.length) return alert("No data to export")
          exportToPDF(
            Object.keys(exportData[0]),
            exportData,
            "Retailers Report"
          )
        }}
      >
        📕 Export PDF
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>

  {/* ADD RETAILER */}
  <CButton color="primary" size="sm" onClick={() => setVisible(true)}>
    <CIcon icon={cilPlus} className="me-1" />
    Add Retailer
  </CButton>

</div>
</div>


      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className="text-center">
            <CIcon icon={cilBuilding} /> Store
            </CTableHeaderCell>
            <CTableHeaderCell>Owner</CTableHeaderCell>
            <CTableHeaderCell>Contact</CTableHeaderCell>
            <CTableHeaderCell>Address</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Products</CTableHeaderCell>
            <CTableHeaderCell>Created</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {current.map((r) => (
            <CTableRow key={r.retailerId}>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <CAvatar
                    size="md"
                    src={`https://ui-avatars.com/api/?name=${r.storeName}`}
                  />
                  <div>
                    <div>{r.storeName}</div>
                    <small className="text-body-secondary">
                      ID: {r.retailerId}
                    </small>
                  </div>
                </div>
              </CTableDataCell>

              <CTableDataCell>{r.ownerName}</CTableDataCell>
              <CTableDataCell>{getContact(r.contact)}</CTableDataCell>
              <CTableDataCell>{getAddress(r.address)}</CTableDataCell>

              <CTableDataCell>
                <CBadge color={r.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {r.status}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                {r.inventorySummary?.totalProducts || 0}
              </CTableDataCell>

              <CTableDataCell>{formatDate(r.createdAt)}</CTableDataCell>

              <CTableDataCell className="text-center">
              <CIcon
                icon={cilZoom}
                className="text-primary me-3 cursor-pointer"
                onClick={() => handleView(r.retailerId)}
                />

                <CIcon
                icon={cilPencil}
                className="text-info me-3 cursor-pointer"
                onClick={() => handleEdit(r.retailerId)}
                />
                <CIcon
                  icon={cilTrash}
                  className="text-danger cursor-pointer"
                  onClick={() => handleDelete(r.retailerId)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visible} onClose={() => setVisible(false)}>
  <CModalHeader>
    <CModalTitle>
      {isEdit ? "Edit Retailer" : "Add Retailer"}
    </CModalTitle>
  </CModalHeader>

  <CModalBody>

    <CFormInput
      label="Store Name"
      value={form.storeName}
      onChange={(e)=>setForm({...form, storeName:e.target.value})}
      className="mb-2"
    />

    <CFormInput
      label="Owner Name"
      value={form.ownerName}
      onChange={(e)=>setForm({...form, ownerName:e.target.value})}
      className="mb-2"
    />

    <CFormInput
      label="Mobile"
      value={form.contact.mobile}
      onChange={(e)=>setForm({
        ...form,
        contact:{...form.contact, mobile:e.target.value}
      })}
      className="mb-2"
    />

    <CFormInput
      label="Email"
      value={form.contact.email}
      onChange={(e)=>setForm({
        ...form,
        contact:{...form.contact, email:e.target.value}
      })}
      className="mb-2"
    />

    <CFormInput
      label="Address Line 1"
      value={form.address.line1}
      onChange={(e)=>setForm({
        ...form,
        address:{...form.address, line1:e.target.value}
      })}
      className="mb-2"
    />

    <CFormSelect
      label="Status"
      value={form.status}
      onChange={(e)=>setForm({...form, status:e.target.value})}
    >
      <option>ACTIVE</option>
      <option>INACTIVE</option>
    </CFormSelect>

  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={()=>setVisible(false)}>
      Cancel
    </CButton>
    <CButton color="primary" onClick={handleSubmit}>
      {isEdit ? "Update" : "Save"}
    </CButton>
  </CModalFooter>
</CModal>


<CModal size="lg" visible={detailVisible} onClose={()=>setDetailVisible(false)}>
  <CModalHeader>
    <CModalTitle>Retailer Details</CModalTitle>
  </CModalHeader>

  <CModalBody>
    {selectedRetailer && (
      <div className="container-fluid">

        <div className="row mb-3">
          <div className="col-md-6">
            <h6 className="text-primary">Basic Info</h6>
            <p><b>Store:</b> {selectedRetailer.storeName}</p>
            <p><b>Owner:</b> {selectedRetailer.ownerName}</p>
            <p><b>Status:</b>{" "}
              <CBadge color={selectedRetailer.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {selectedRetailer.status}
              </CBadge>
            </p>
          </div>

          <div className="col-md-6">
            <h6 className="text-primary">Contact</h6>
            <p><b>Mobile:</b> {selectedRetailer.contact?.mobile || 'N/A'}</p>
            <p><b>Alternate:</b> {selectedRetailer.contact?.alternateMobile || 'N/A'}</p>
            <p><b>Email:</b> {selectedRetailer.contact?.email || 'N/A'}</p>
          </div>
        </div>

        <hr/>

        <h6 className="text-primary">Address</h6>
        <p>
          {selectedRetailer.address?.line1}<br/>
          {selectedRetailer.address?.line2}<br/>
          {selectedRetailer.address?.area}, {selectedRetailer.address?.city}<br/>
          {selectedRetailer.address?.state} - {selectedRetailer.address?.pincode}
        </p>

        <hr/>

        <p><b>Created At:</b> {formatDate(selectedRetailer.createdAt)}</p>
        <p><b>Updated At:</b> {formatDate(selectedRetailer.updatedAt)}</p>

        <hr />
<h6 className="text-primary">
  Orders ({orders.length})
</h6>

<CTable small bordered responsive>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>Order ID</CTableHeaderCell>
      <CTableHeaderCell>Status</CTableHeaderCell>
      <CTableHeaderCell>Total</CTableHeaderCell>
      <CTableHeaderCell>Date</CTableHeaderCell>
      <CTableHeaderCell>Action</CTableHeaderCell>
    </CTableRow>
  </CTableHead>

  <CTableBody>
    {orders.map((o) => (
      <CTableRow key={o.orderId}>
        <CTableDataCell>{o.orderId}</CTableDataCell>
        <CTableDataCell>
          <CBadge color="info">{o.orderStatus}</CBadge>
        </CTableDataCell>
        <CTableDataCell>₹{o.billing.grandTotal}</CTableDataCell>
        <CTableDataCell>{formatDate(o.createdAt)}</CTableDataCell>
        <CTableDataCell>
          <CButton
            size="sm"
            color="primary"
            onClick={() => {
              setSelectedOrder(o)
              setOrderVisible(true)
            }}
          >
            View
          </CButton>
        </CTableDataCell>
      </CTableRow>
    ))}
  </CTableBody>
</CTable>


      </div>
    )}
  </CModalBody>
</CModal>

<CModal
  size="lg"
  visible={orderVisible}
  onClose={() => setOrderVisible(false)}
>
  <CModalHeader>
    <CModalTitle>Order Details</CModalTitle>
  </CModalHeader>

  <CModalBody>
    {selectedOrder && (
      <>
        <p><b>Order ID:</b> {selectedOrder.orderId}</p>
        <p><b>Status:</b> {selectedOrder.orderStatus}</p>
        <p><b>Payment:</b> {selectedOrder.payment.mode} ({selectedOrder.payment.status})</p>
        <p><b>Delivery:</b> {selectedOrder.delivery.type}</p>

        <hr />
        <h6 className="text-primary">Items</h6>

        <CTable small bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Product</CTableHeaderCell>
              <CTableHeaderCell>Qty</CTableHeaderCell>
              <CTableHeaderCell>Price</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {selectedOrder.items.map((i, idx) => (
              <CTableRow key={idx}>
                <CTableDataCell>{i.productName}</CTableDataCell>
                <CTableDataCell>{i.quantity}</CTableDataCell>
                <CTableDataCell>₹{i.price}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <hr />
        <p><b>Item Total:</b> ₹{selectedOrder.billing.itemTotal}</p>
        <p><b>Delivery:</b> ₹{selectedOrder.billing.deliveryCharge}</p>
        <p><b>Tax:</b> ₹{selectedOrder.billing.tax}</p>
        <h6><b>Grand Total:</b> ₹{selectedOrder.billing.grandTotal}</h6>
      </>
    )}
  </CModalBody>
</CModal>




      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(retailers.length / perPage)).keys()].map((n) => (
          <CPaginationItem
            key={n}
            active={page === n + 1}
            onClick={() => setPage(n + 1)}
          >
            {n + 1}
          </CPaginationItem>
        ))}
      </CPagination>
    </>
  )
}

export default Retailers
