import React, { useEffect, useState } from 'react'
import Select from "react-select"
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSelect, CFormSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilTrash, cilPencil, cilZoom, cilBadge, cilViewColumn } from '@coreui/icons'
import { uploadToS3 } from '../../utils/fileUpload'
import {getProducts} from '../../services/productService'

import AsyncSelect from "react-select/async"
import config from '../../config'


import {
    getDeals,
    getDealsById,
    createDeals,
    updateDeals,
    deleteDeals,
    toggleIsBanner
  } from '../../services/dealsService'
  

const Deals = () => {
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [productOptions, setProductOptions] = useState([])
  const [productNextKey, setProductNextKey] = useState(null)
  const [productSearch, setProductSearch] = useState("")

  const [selectOptions, setSelectOptions] = useState([])
  const [options, setOptions] = useState([])
  const [nextKey, setNextKey] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  


  const [visible, setVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)

  const [uploading, setUploading] = useState(false)

  const [detailLoading, setDetailLoading] = useState(false) 
  const [detailError, setDetailError] = useState(null)  

  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  

    const [form, setForm] = useState({
        photo: '',
        heading: '',
        subheading: '',
        isBanner: false,
        items: []
      })
  

      const fetchDeals = async () => {
        setLoading(true)
        const data = await getDeals()
        setDeals(data.filter(d => d.isDeleted === "false"))
        setLoading(false)
      }

      const fetchProducts = async (lastKey = null) => {
        let url = `${config.BASE_URL}/products/select?pageSize=20`
        if (lastKey) {
          url += `&lastKey=${encodeURIComponent(lastKey)}`
        }
      
        const res = await fetch(url)
        const data = await res.json()
      
        if (data.success) {
          setOptions(prev => [...prev, ...data.data])
          setNextKey(data.nextKey || null)
        }
      }
      
      


  useEffect(() => {
    fetchDeals()
    fetchProducts()
  }, [])



  const loadProductOptions = async (inputValue) => {
    try {
      const res = await fetch(
        `${config.BASE_URL}/products/select?search=${encodeURIComponent(inputValue)}`
      )
      const data = await res.json()
  
      if (data.success && Array.isArray(data.data)) {
        return data.data   // [{value, label}]
      }
      return []
    } catch (e) {
      console.error(e)
      return []
    }
  }
  

  const fetchSelectProducts = async (search = "", lastKey = null) => {
    const url = new URL(`${config.BASE_URL}/products/select`)
    if (search) url.searchParams.append("search", search)
    if (lastKey) url.searchParams.append("lastKey", lastKey)
  
    const res = await fetch(url)
    const data = await res.json()
  
    if (data.success) {
      setSelectOptions(prev =>
        lastKey ? [...prev, ...data.data] : data.data
      )
      setNextKey(data.nextKey || null)
    }
  }
  
  
  
  const loadMoreProducts = async () => {
    if (!productNextKey) return
  
    const res = await fetch(
      `${config.BASE_URL}/products/select?search=${productSearch}&lastKey=${encodeURIComponent(productNextKey)}`
    )
    const data = await res.json()
  
    if (data.success) {
      setProductOptions(prev => [...prev, ...data.data])
      setProductNextKey(data.nextKey)
    }
  }
  
  

  const handleEdit = async (deal) => {
    const res = await getDealsById(deal.dealId)
  
    if (!res) return alert("Failed to load deal")
  
    setForm({
      photo: res.photo || '',
      heading: res.heading || '',
      subheading: res.subheading || '',
      isBanner: res.isBanner || false,
      items: Array.isArray(res.items) ? res.items : []
    })
  
    setEditId(deal.dealId)
    setIsEdit(true)
    setVisible(true)
  }
  

  const handleSubmit = async () => {
    if (!form.heading) {
      alert("Heading required")
      return
    }
  
    const res = isEdit
      ? await updateDeals(editId, form)
      : await createDeals(form)
  
    if (res) {
      setVisible(false)
      setIsEdit(false)
      setEditId(null)
      setForm({ photo:'', heading:'', subheading:'', isBanner:false, items:[] })
      fetchDeals()
    }
  }
  


  const handleToggle = async (deal) => {
    await toggleIsBanner(deal.dealId, !deal.isBanner)
    fetchDeals()
  }

  const handleView = async (id) => {
    setDetailVisible(true)
    setSelectedProduct(null)
    setDetailError(null)
    setDetailLoading(true)
  
    const res = await getDealsById(id)  
  
    if (res && res.dealId) {
      setSelectedProduct(res)
    } else {
      setDetailError("Failed to load deal")
    }
  
    setDetailLoading(false)
  }
  

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Deal?")) return
    const ok = await deleteDeals(id)
    if (ok) fetchDeals()
  }

  const handleFileUpload = async (file) => {
    setUploading(true)
    try {
      const imageUrl = await uploadToS3(file, `deals/${Date.now().toLocaleString()}`)
      setForm(p => ({ ...p, photo: imageUrl }))
    } catch (e) {
      alert(e.message)
    }
    setUploading(false)
  }
  
  
  

  const current = deals.slice((page - 1) * perPage, page * perPage)


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })
  
  

  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setVisible(true)}>
          + Add Deals
        </CButton>
      </div>

     
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className='text-center'> <CIcon icon={cilBadge} /> Deals</CTableHeaderCell>
            <CTableHeaderCell>Products Count</CTableHeaderCell>
            <CTableHeaderCell>isBanner</CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
  {current.map(p => (
    <CTableRow key={p.dealId}>
    <CTableDataCell>
  <div className="d-flex align-items-center gap-2">

    <CAvatar
      size="md"
      src={
        p.photo
          ? p.photo
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.heading)}`
      }
    />

    <div>
      <div>{p.heading}</div>
      <small className="text-body-secondary">
         {p.subheading}
      </small>
    </div>

  </div>
</CTableDataCell>

<CTableDataCell>{p.items.length} Products</CTableDataCell>


      <CTableDataCell>
        <CBadge color={p.isBanner ? 'success' : 'secondary'}>
            {p.isBanner ? 'Yes' : 'No'}
        </CBadge>
      </CTableDataCell>

      <CTableDataCell>
      <CFormSwitch
        checked={p.isBanner}
        onChange={() => handleToggle(p)}
    />
      </CTableDataCell>

      <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-3">
    
    <CIcon
      icon={cilViewColumn}
      className="text-primary cursor-pointer"
      size="lg"
      title="View Product"
      onClick={() => handleView(p.dealId)}

    />

    <CIcon
      icon={cilPencil}
      className="text-info cursor-pointer"
      size="lg"
      title="Edit Product"
      onClick={() => handleEdit(p)}
    />

    <CIcon
      icon={cilTrash}
      className="text-danger cursor-pointer"
      size="lg"
      title="Delete Product"
      onClick={() => handleDelete(p.dealId)}
    />

  </div>
</CTableDataCell>

    </CTableRow>
  ))}
</CTableBody>

      </CTable>

        <CPagination align="center" className="mt-3">
                {[...Array(Math.ceil(deals.length / perPage)).keys()].map(n => (
                <CPaginationItem
                    key={n}
                    active={page === n + 1}
                    onClick={() => setPage(n + 1)}
                >
                    {n + 1}
                </CPaginationItem>
                ))}
        </CPagination>

      {/* ADD / EDIT MODAL */}
      <CModal
  size="lg"
  visible={visible}
  onClose={()=>{
    setVisible(false)
    setIsEdit(false)
    setEditId(null)
    setForm({ photo:'', heading:'', subheading:'', isBanner:false, items:[] })
  }}
>

  <CModalHeader>
    <CModalTitle>{isEdit ? "Edit Deal" : "Add Deal"}</CModalTitle>
  </CModalHeader>

  <CModalBody>

    {/* BASIC INFO */}
    <h6 className="mb-2 text-primary">Basic Info</h6>
    <CFormInput className='mb-2' label="Heading" name="heading" value={form.heading} onChange={handleChange}/>
    <CFormInput className='mb-2'  label="Subheading" name="subheading" value={form.subheading} onChange={handleChange}/>

 {/* DEAL IMAGE UPLOAD BLOCK */}
<div className="mb-4">

<CFormInput
  type="file"
  label="Deal Image"
  accept="image/*"
  onChange={(e) => handleFileUpload(e.target.files[0])}
/>

{uploading && (
  <div className="mt-1">
    <small className="text-primary">Uploading image...</small>
  </div>
)}

{form.photo && (
  <div className="mt-2">
    <img
      src={form.photo}
      alt="deal"
      className="rounded border"
      style={{
        width: '150px',
        height: '90px',
        objectFit: 'cover'
      }}
    />
  </div>
)}

</div>


    <CFormSwitch
    className='mb-2' 
        label="Is Banner"
        checked={form.isBanner}
        onChange={(e) => setForm({ ...form, isBanner: e.target.checked })}
        />

{/* <label className="form-label">Select Products</label>

<AsyncSelect
  isMulti
  cacheOptions
  defaultOptions
  loadOptions={loadProductOptions}
  placeholder="Search products..."

  styles={{
    control: (base) => ({ ...base, backgroundColor: "#fff" }),
    menu: (base) => ({ ...base, backgroundColor: "#fff", zIndex: 9999 }),
    option: (base, s) => ({
      ...base,
      backgroundColor: s.isFocused ? "#e9ecef" : "#fff",
      color: "#000",
    }),
    multiValue: (b) => ({ ...b, backgroundColor: "#e7f1ff" }),
    multiValueLabel: (b) => ({ ...b, color: "#000" }),
    input: (b) => ({ ...b, color: "#000" }),
  }}

  value={form.items.map(id => ({
    value: id,
    label: id
  }))}

  onChange={(selected) =>
    setForm({
      ...form,
      items: selected ? selected.map(s => s.value) : []
    })
  }
/> */}

<Select
  isMulti
  options={options}
  isLoading={loadingMore}
  placeholder="Select products..."

  onMenuScrollToBottom={async () => {
    if (!nextKey || loadingMore) return
    setLoadingMore(true)
    await fetchProducts(nextKey)
    setLoadingMore(false)
  }}

  styles={{
    control: (base) => ({ ...base, backgroundColor: "#fff" }),
    menu: (base) => ({ ...base, backgroundColor: "#fff", zIndex: 9999 }),
    option: (base, s) => ({
      ...base,
      backgroundColor: s.isFocused ? "#e9ecef" : "#fff",
      color: "#000",
    }),
    multiValue: (b) => ({ ...b, backgroundColor: "#e7f1ff" }),
    multiValueLabel: (b) => ({ ...b, color: "#000" }),
    input: (b) => ({ ...b, color: "#000" }),
  }}

  value={form.items.map(id => ({
    value: id,
    label: id
  }))}

  onChange={(selected) =>
    setForm({
      ...form,
      items: selected ? selected.map(s => s.value) : []
    })
  }
/>




  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={()=>setVisible(false)}>Cancel</CButton>
    <CButton color="primary" onClick={handleSubmit}>
      {isEdit ? "Update Deal" : "Save Deal"}
    </CButton>
  </CModalFooter>
</CModal>


      {/* PRODUCT DETAIL MODAL */}
      <CModal size="lg" visible={detailVisible} onClose={()=>setDetailVisible(false)}>
  <CModalHeader>
    <CModalTitle>Deal Details</CModalTitle>
  </CModalHeader>

  <CModalBody>

    {/* LOADING */}
    {detailLoading && (
      <div className="text-center p-4">
        <CSpinner />
      </div>
    )}

    {/* ERROR */}
    {!detailLoading && detailError && (
      <div className="text-danger text-center p-3">
        {detailError}
      </div>
    )}

    {/* DATA */}
    {!detailLoading && selectedProduct && (
      <div className="container-fluid">

        {/* IMAGES */}
        <div className="row mb-3">
        {selectedProduct.photo && (
            <div className="col-md-4 mb-2">
                <img
                src={selectedProduct.photo}
                alt="deal"
                className="img-fluid rounded border"
                />
            </div>
            )}

        </div>

        <h5 className="text-primary">Basic Info</h5>
        <p><b>heading:</b> {selectedProduct.heading}</p>
        <p><b>subheading:</b> {selectedProduct.subheading}</p>
        <p>
            <b>isBanner:</b>{' '}
            <CBadge color={selectedProduct.isBanner ? 'success' : 'secondary'}>
                {selectedProduct.isBanner ? 'Yes' : 'No'}
            </CBadge>
            </p>

        <p><b>Items:</b> {selectedProduct.items.join(", ")}</p>


        <hr/>

        <p><b>Created At:</b> {formatIST(selectedProduct.createdAt)}</p>
        <p><b>Updated At:</b> {formatIST(selectedProduct.updatedAt)}</p>


      </div>
    )}
  </CModalBody>
</CModal>


    </>
  )
}

export default Deals
