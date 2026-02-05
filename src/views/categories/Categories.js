import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar, CButton, CModal, CModalHeader, CModalTitle, CFormSwitch,
  CModalBody, CModalFooter, CFormInput, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTags, cilTrash, cilZoom, cilPencil } from '@coreui/icons'

import { getCategories, deleteCategory, updateCategory, createCategory, toggleCategoryStatus } from '../../services/categoryService'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    image: '',
    status: 'ACTIVE'
 })

 const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  
  const handleCreate = async () => {
    if (!form.name || !form.image) {
      alert("All fields required")
      return
    }
  
    const res = await createCategory(form)
    if (res?.success) {
      setVisible(false)
      setForm({ name: '', image: '', status: 'ACTIVE' })
      fetchCategories()
    }
  }

//   const handleToggle = async (cat) => {
//     const newStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
//     const ok = await toggleCategoryStatus(cat.categoryId, newStatus)
//     if (ok) fetchCategories()
//   }

const handleToggle = async (cat) => {
    const newStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  
    // ✅ UI immediately update
    setCategories(prev =>
      prev.map(c =>
        c.categoryId === cat.categoryId ? { ...c, status: newStatus } : c
      )
    )
  
    // 🔁 API call in background
    const ok = await toggleCategoryStatus(cat.categoryId, newStatus)
  
    if (!ok) {
      setCategories(prev =>
        prev.map(c =>
          c.categoryId === cat.categoryId ? { ...c, status: cat.status } : c
        )
      )
      alert("Status update failed")
    }
  }
  
  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      image: cat.image,
      status: cat.status
    })
    setEditId(cat.categoryId)
    setIsEdit(true)
    setVisible(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.image) {
      alert("All fields required")
      return
    }
  
    let res
  
    if (isEdit) {
      // ✅ UPDATE API CALL
      res = await updateCategory(editId, form)
    } else {
      // ✅ CREATE API CALL
      res = await createCategory(form)
    }
  
    if (res?.success) {
      setVisible(false)
      setForm({ name: '', image: '', status: 'ACTIVE' })
      setIsEdit(false)
      setEditId(null)
      fetchCategories()
    }
  }
  
  
  


  const fetchCategories = async () => {
    setLoading(true)
    const data = await getCategories()
    setCategories(data.filter(c => !c.isDeleted))
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const current = categories.slice((page - 1) * perPage, page * perPage)

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return
    const ok = await deleteCategory(id)
    if (ok) fetchCategories()
  }


  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
    <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setVisible(true)}>
            + Add Category
        </CButton>
    </div>

      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className='text-center'>
              <CIcon icon={cilTags} /> Category
            </CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Created</CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {current.map((c) => (
            <CTableRow key={c.categoryId}>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <CAvatar size="md" src={c.image} />
                  <div>
                    <div>{c.name}</div>
                    <small className="text-body-secondary">
                      ID: {c.categoryId}
                    </small>
                  </div>
                </div>
              </CTableDataCell>

              <CTableDataCell>
                <CBadge color={c.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {c.status}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                {new Date(c.createdAt).toLocaleString()}
              </CTableDataCell>

            <CTableDataCell>
                <CFormSwitch
                    checked={c.status === 'ACTIVE'}
                    onChange={() => handleToggle(c)}
                    label={c.status}
                    size="lg"
                />
            </CTableDataCell>


            

              <CTableDataCell className="text-center">
              <CIcon
                icon={cilPencil}
                className="me-3 text-info cursor-pointer"
                onClick={() => handleEdit(c)}
                />
                <CIcon
                  icon={cilTrash}
                  className="text-danger cursor-pointer"
                  onClick={() => handleDelete(c.categoryId)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(categories.length / perPage)).keys()].map((n) => (
          <CPaginationItem
            key={n}
            active={page === n + 1}
            onClick={() => setPage(n + 1)}
          >
            {n + 1}
          </CPaginationItem>
        ))}
      </CPagination>

      <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
  <CModalHeader>
  <CModalTitle>{isEdit ? "Edit Category" : "Add Category"}</CModalTitle>

  </CModalHeader>

  <CModalBody>
    <CFormInput
      label="Category Name"
      name="name"
      value={form.name}
      onChange={handleChange}
      className="mb-3"
    />

    <CFormInput
      label="Image URL"
      name="image"
      value={form.image}
      onChange={handleChange}
      className="mb-3"
    />

    <CFormSelect
      label="Status"
      name="status"
      value={form.status}
      onChange={handleChange}
    >
      <option value="ACTIVE">ACTIVE</option>
      <option value="INACTIVE">INACTIVE</option>
    </CFormSelect>
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => setVisible(false)}>
      Cancel
    </CButton>
    <CButton color="primary" onClick={handleSubmit}>
  {isEdit ? "Update Category" : "Save Category"}
</CButton>
  </CModalFooter>
</CModal>

    </>
  )
}

export default Categories
