import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar, CButton, CModal, CModalHeader, CModalTitle, CFormSwitch,
  CModalBody, CModalFooter, CFormInput, CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTags, cilTrash, cilZoom, cilPencil,  cilCloudDownload,
    cilPlus } from '@coreui/icons'

import { getCategories, deleteCategory, updateCategory, createCategory, toggleCategoryStatus } from '../../services/categoryService'
import { uploadToS3 } from '../../utils/fileUpload'

import {
    exportToCSV,
    exportToExcel,
    exportToPDF
  } from '../../utils/exportUtils'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    image: '',
    status: 'ACTIVE'
 })

 const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })

    const exportData = categories.map(c => ({
        Category_ID: c.categoryId,
        Name: c.name,
        Status: c.status,
        Created_At: formatDate(c.createdAt)
      }))
      
  

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

  const handleFileUpload = async (file) => {
    if (!file) return
  
    setUploading(true)
    try {
      const imageUrl = await uploadToS3(
        file,
        `categories/${Date.now()}`
      )
  
      setForm(prev => ({ ...prev, image: imageUrl }))
    } catch (err) {
      alert(err.message)
    }
    setUploading(false)
  }
  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
    <div className="d-flex justify-content-between align-items-center mb-3">

{/* LEFT */}
<h5 className="mb-0 fw-semibold">Categories</h5>

{/* RIGHT */}
<div className="d-flex gap-2">

  {/* EXPORT DROPDOWN */}
  <CDropdown>
    <CDropdownToggle color="light" size="sm" className="border">
      <CIcon icon={cilCloudDownload} className="me-1" />
      Export
    </CDropdownToggle>

    <CDropdownMenu>
      <CDropdownItem
        onClick={() => exportToExcel(exportData, "Categories")}
      >
        📗 Export Excel
      </CDropdownItem>

      <CDropdownItem
        onClick={() => exportToCSV(exportData, "Categories")}
      >
        📄 Export CSV
      </CDropdownItem>

      <CDropdownItem
        onClick={() => {
          if (!exportData.length) return alert("No data to export")
          exportToPDF(
            Object.keys(exportData[0]),
            exportData,
            "Categories Report"
          )
        }}
      >
        📕 Export PDF
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>

  {/* ADD CATEGORY */}
  <CButton color="primary" size="sm" onClick={() => setVisible(true)}>
    <CIcon icon={cilPlus} className="me-1" />
    Add Category
  </CButton>

</div>
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

{/* CATEGORY IMAGE UPLOAD BLOCK */}
<div className="mb-4">

  <CFormInput
    type="file"
    label="Category Image"
    accept="image/*"
    onChange={(e) => handleFileUpload(e.target.files[0])}
  />

  {uploading && (
    <div className="mt-1">
      <small className="text-primary">Uploading image...</small>
    </div>
  )}

  {form.image && (
    <div className="mt-2">
      <img
        src={form.image}
        alt="category"
        className="rounded border"
        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
      />
    </div>
  )}

</div>




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
