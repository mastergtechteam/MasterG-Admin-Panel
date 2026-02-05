import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilTrash, cilZoom } from '@coreui/icons'
import config from '../../config'
import { getRetailers } from '../../services/retailerService'


const Retailers = () => {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10

  const fetchRetailers = async () => {
    setLoading(true)
    const data = await getRetailers()
    setRetailers(data)
    setLoading(false)
  }
  

  useEffect(() => {
    fetchRetailers()
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString()

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

  if (loading) return <CSpinner color="primary" />

  return (
    <>
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
                <CIcon icon={cilZoom} className="me-3 cursor-pointer" />
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
