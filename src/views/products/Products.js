import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSelect, CFormSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilTrash, cilPencil, cilZoom, cilViewColumn } from '@coreui/icons'

import {
  getProducts, createProduct, updateProduct, getProductById,
  deleteProduct, toggleProductStatus
} from '../../services/productService'

import { getCategories } from '../../services/categoryService'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [visible, setVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)

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
    name: '',
    brand: '',
    categoryId: '',
    description: '',
    pricing: {
      mrp: '',
      sellingPrice: '',
      currency: 'INR'
    },
    quantity: 1,
    stock: '',
    tax: '',
    productType: 'GROCERY',
    expiry: '',
    manufacturingDetails: {
      manufacturer: '',
      countryOfOrigin: ''
    },
    barcode: '',
    images: [''],
    status: 'ACTIVE'
  })
  

  const fetchProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data.filter(p => !p.isDeleted))
    setLoading(false)
  }

  const fetchCategories = async () => {
    const data = await getCategories()
    setCategories(data.filter(c => !c.isDeleted))
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  

  const handleEdit = async (p) => {
    const res = await getProductById(p.productId)
  
    if (!res.success) return alert("Failed to load product")
  
    const prod = res.data
  
    setForm({
      name: prod.name || '',
      brand: prod.brand || '',
      categoryId: prod.category?.categoryId || '',
      categoryName: prod.category?.name || '',
      description: prod.description || '',
      pricing: prod.pricing || { mrp:'', sellingPrice:'', currency:'INR' },
      quantity: prod.quantity || 1,
      stock: prod.stock || '',
      tax: prod.tax || '',
      productType: prod.productType || 'GROCERY',
      expiry: prod.expiry || '',
      manufacturingDetails: prod.manufacturingDetails || { manufacturer:'', countryOfOrigin:'' },
      barcode: prod.barcode || '',
      images: prod.images?.length ? prod.images : [''],
      status: prod.status || 'ACTIVE'
    })
  
    setEditId(prod.productId)
    setIsEdit(true)
    setVisible(true)
  }
  

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId) {
      alert("Required fields missing")
      return
    }
  
    const res = isEdit
      ? await updateProduct(editId, form)
      : await createProduct(form)
  
    if (res?.success) {
      setVisible(false)
      setIsEdit(false)
      setEditId(null)
  
      setForm({
        name: '',
        brand: '',
        categoryId: '',
        description: '',
        pricing: { mrp:'', sellingPrice:'', currency:'INR' },
        quantity: 1,
        stock: '',
        tax: '',
        productType: 'GROCERY',
        expiry: '',
        manufacturingDetails: { manufacturer:'', countryOfOrigin:'' },
        barcode: '',
        images: [''],
        status: 'ACTIVE'
      })
  
      fetchProducts()
    }
  }

  const handleCategoryChange = (e) => {
    const selected = categories.find(c => c.categoryId === e.target.value)
  
    setForm({
      ...form,
      categoryId: selected.categoryId,
      categoryName: selected.name
    })
  }
  

  const handleToggle = async (p) => {
    const newStatus = p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    setProducts(prev =>
      prev.map(x => x.productId === p.productId ? { ...x, status: newStatus } : x)
    )

    const ok = await toggleProductStatus(p.productId, newStatus)
    if (!ok) fetchProducts()
  }

  const handleView = async (id) => {
    setDetailVisible(true)
    setSelectedProduct(null)
    setDetailError(null)
    setDetailLoading(true)
  
    const res = await getProductById(id)
  
    if (res.success) {
      setSelectedProduct(res.data)
    } else {
      setDetailError(res.message || "Failed to load product")
    }
  
    setDetailLoading(false)
  }
  

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    const ok = await deleteProduct(id)
    if (ok) fetchProducts()
  }

  const current = products.slice((page - 1) * perPage, page * perPage)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })
  
  const handlePricingChange = (e) =>
    setForm({ ...form, pricing: { ...form.pricing, [e.target.name]: e.target.value }})
  
  const handleManufacturingChange = (e) =>
    setForm({ ...form, manufacturingDetails: { ...form.manufacturingDetails, [e.target.name]: e.target.value }})
  
  const handleImageChange = (i, value) => {
    const newImages = [...form.images]
    newImages[i] = value
    setForm({ ...form, images: newImages })
  }
  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setVisible(true)}>
          + Add Product
        </CButton>
      </div>

     
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className='text-center'> <CIcon icon={cilCart} /> Product</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>Price</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
  {current.map(p => (
    <CTableRow key={p.productId}>
    <CTableDataCell>
  <div className="d-flex align-items-center gap-2">

    <CAvatar
      size="md"
      src={
        p.image
          ? p.image
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`
      }
    />

    <div>
      <div>{p.name}</div>
      <small className="text-body-secondary">
        ID: {p.productId}
      </small>
    </div>

  </div>
</CTableDataCell>


      <CTableDataCell>
        <div>
          <div>{p.category?.name}</div>
          <small className="text-body-secondary">
            ID: {p.category?.categoryId}
          </small>
        </div>
      </CTableDataCell>

      <CTableDataCell>₹ {p.sellingPrice}</CTableDataCell>

      <CTableDataCell>
        <CBadge color={p.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {p.status}
        </CBadge>
      </CTableDataCell>

      <CTableDataCell>
        <CFormSwitch
          checked={p.status === 'ACTIVE'}
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
      onClick={() => handleView(p.productId)}

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
      onClick={() => handleDelete(p.productId)}
    />

  </div>
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

      {/* ADD / EDIT MODAL */}
      <CModal size="lg" visible={visible} onClose={()=>setVisible(false)}>
  <CModalHeader>
    <CModalTitle>{isEdit ? "Edit Product" : "Add Product"}</CModalTitle>
  </CModalHeader>

  <CModalBody>

    {/* BASIC INFO */}
    <h6 className="mb-2 text-primary">Basic Info</h6>
    <CFormInput label="Product Name" name="name" value={form.name} onChange={handleChange}/>
    <CFormInput label="Brand" name="brand" value={form.brand} onChange={handleChange}/>
    <CFormSelect label="Category" value={form.categoryId} onChange={handleCategoryChange}>
      <option value="">Select Category</option>
      {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
    </CFormSelect>
    <CFormInput label="Description" name="description" value={form.description} onChange={handleChange}/>

    {/* PRICING */}
    <hr/>
    <h6 className="text-primary">Pricing</h6>
    <div className="row">
      <div className="col-md-4">
        <CFormInput label="MRP" name="mrp" value={form.pricing.mrp} onChange={handlePricingChange}/>
      </div>
      <div className="col-md-4">
        <CFormInput label="Selling Price" name="sellingPrice" value={form.pricing.sellingPrice} onChange={handlePricingChange}/>
      </div>
      <div className="col-md-4">
        <CFormSelect label="Currency" name="currency" value={form.pricing.currency} onChange={handlePricingChange}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </CFormSelect>
      </div>
    </div>

    {/* INVENTORY */}
    <hr/>
    <h6 className="text-primary">Inventory</h6>
    <CFormInput label="Quantity" name="quantity" value={form.quantity} onChange={handleChange}/>
    <CFormInput label="Stock" name="stock" value={form.stock} onChange={handleChange}/>
    <CFormInput label="Tax %" name="tax" value={form.tax} onChange={handleChange}/>
    <CFormSelect label="Product Type" name="productType" value={form.productType} onChange={handleChange}>
      <option>GROCERY</option>
      <option>ELECTRONICS</option>
      <option>FASHION</option>
    </CFormSelect>
    <CFormInput type="date" label="Expiry Date" name="expiry" value={form.expiry} onChange={handleChange}/>

    {/* MANUFACTURER */}
    <hr/>
    <h6 className="text-primary">Manufacturing Details</h6>
    <CFormInput label="Manufacturer" name="manufacturer" value={form.manufacturingDetails.manufacturer} onChange={handleManufacturingChange}/>
    <CFormInput label="Country Of Origin" name="countryOfOrigin" value={form.manufacturingDetails.countryOfOrigin} onChange={handleManufacturingChange}/>

    {/* MEDIA */}
    <hr/>
    <h6 className="text-primary">Media</h6>
    {form.images.map((img, i) => (
      <CFormInput
        key={i}
        label={`Image URL ${i+1}`}
        value={img}
        onChange={(e)=>handleImageChange(i, e.target.value)}
        className="mb-2"
      />
    ))}
    <CButton size="sm" onClick={()=>setForm({...form, images:[...form.images, '']})}>
      + Add Image
    </CButton>

    <CFormInput label="Barcode" name="barcode" value={form.barcode} onChange={handleChange}/>

    <CFormSelect label="Status" name="status" value={form.status} onChange={handleChange}>
      <option>ACTIVE</option>
      <option>INACTIVE</option>
    </CFormSelect>

  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={()=>setVisible(false)}>Cancel</CButton>
    <CButton color="primary" onClick={handleSubmit}>
      {isEdit ? "Update Product" : "Save Product"}
    </CButton>
  </CModalFooter>
</CModal>


      {/* PRODUCT DETAIL MODAL */}
      <CModal size="lg" visible={detailVisible} onClose={()=>setDetailVisible(false)}>
  <CModalHeader>
    <CModalTitle>Product Details</CModalTitle>
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
          {selectedProduct.images?.map((img, i) => (
            <div className="col-md-4 mb-2" key={i}>
              <img src={img} alt="product" className="img-fluid rounded border" />
            </div>
          ))}
        </div>

        <h5 className="text-primary">Basic Info</h5>
        <p><b>Name:</b> {selectedProduct.name}</p>
        <p><b>Brand:</b> {selectedProduct.brand}</p>
        <p><b>Description:</b> {selectedProduct.description}</p>
        <p><b>Barcode:</b> {selectedProduct.barcode}</p>

        <hr/>

        <h5 className="text-primary">Category</h5>
        <p><b>Category Name:</b> {selectedProduct.category?.name}</p>
        <p><b>Category ID:</b> {selectedProduct.category?.categoryId}</p>

        <hr/>

        <h5 className="text-primary">Pricing</h5>
        <p><b>MRP:</b> ₹ {selectedProduct.pricing?.mrp}</p>
        <p><b>Selling Price:</b> ₹ {selectedProduct.pricing?.sellingPrice}</p>
        <p><b>Currency:</b> {selectedProduct.pricing?.currency}</p>
        <p><b>Tax:</b> {selectedProduct.tax}%</p>

        <hr/>

        <h5 className="text-primary">Inventory</h5>
        <p><b>Stock:</b> {selectedProduct.stock}</p>
        <p><b>Quantity:</b> {selectedProduct.quantity}</p>
        <p><b>Product Type:</b> {selectedProduct.productType}</p>
        <p><b>Expiry:</b> {selectedProduct.expiry || "N/A"}</p>

        <hr/>

        <h5 className="text-primary">Manufacturing</h5>
        <p><b>Manufacturer:</b> {selectedProduct.manufacturingDetails?.manufacturer}</p>
        <p><b>Country:</b> {selectedProduct.manufacturingDetails?.countryOfOrigin}</p>

        <hr/>

        <h5 className="text-primary">Status</h5>
        <CBadge color={selectedProduct.status === "ACTIVE" ? "success" : "secondary"}>
          {selectedProduct.status}
        </CBadge>

        <p><b>Created At:</b> {formatIST(selectedProduct.createdAt)}</p>
        <p><b>Updated At:</b> {formatIST(selectedProduct.updatedAt)}</p>


      </div>
    )}
  </CModalBody>
</CModal>


    </>
  )
}

export default Products
