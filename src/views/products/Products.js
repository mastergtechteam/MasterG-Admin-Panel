import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilTrash, cilZoom } from '@coreui/icons'
import { getProducts, deleteProduct } from '../../services/productService'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10

  const fetchProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const current = products.slice((page - 1) * perPage, page * perPage)

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    const ok = await deleteProduct(id)
    if (ok) fetchProducts()
  }

  if (loading) return <CSpinner color="primary" />

  return (
    <>
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead >
          <CTableRow>
            <CTableHeaderCell className='text-center'>
              <CIcon icon={cilCart} /> Product
            </CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>Price</CTableHeaderCell>
            <CTableHeaderCell>Stock</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {current.map((p) => (
            <CTableRow key={p.productId}>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <CAvatar
                    size="md"
                    src={`https://ui-avatars.com/api/?name=${p.name}`}
                  />
                  <div>
                    <div>{p.name}</div>
                    <small className="text-body-secondary">
                      ID: {p.productId}
                    </small>
                  </div>
                </div>
              </CTableDataCell>

              <CTableDataCell>{p.category}</CTableDataCell>
              <CTableDataCell>₹ {p.sellingPrice}</CTableDataCell>
              <CTableDataCell>{p.stock}</CTableDataCell>

              <CTableDataCell>
                <CBadge color={p.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {p.status}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell className="text-center">
                <CIcon icon={cilZoom} className="me-3 cursor-pointer" />
                <CIcon
                  icon={cilTrash}
                  className="text-danger cursor-pointer"
                  onClick={() => handleDelete(p.productId)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(products.length / perPage)).keys()].map((n) => (
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

export default Products
