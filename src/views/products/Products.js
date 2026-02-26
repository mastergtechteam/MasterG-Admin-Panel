import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge,
  CPagination, CPaginationItem, CSpinner, CAvatar, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSelect, CFormSwitch,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilTrash, cilPencil, cilZoom, cilViewColumn,
    cilCloudDownload,
    cilPlus } from '@coreui/icons'

import {
    exportToCSV,
    exportToExcel,
    exportToPDF
  } from "../../utils/exportUtils"
  
  import config from '../../config';
import {
  getProducts, createProduct, updateProduct, getProductById,
  deleteProduct, toggleProductStatus
} from '../../services/productService'

import { getCategories } from '../../services/categoryService'
import { uploadToS3 } from '../../utils/fileUpload'


  

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [pageSize, setPageSize] = useState(10)
  const [lastKey, setLastKey] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [nextKey, setNextKey] = useState(null)
  const [prevKeys, setPrevKeys] = useState([])

  const [visible, setVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [selectedCategory, setSelectedCategory] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])

  const [totalCount, setTotalCount] = useState(0)
  const [currentOffset, setCurrentOffset] = useState(0)

  const start = totalCount === 0 ? 0 : currentOffset + 1
  const end = Math.min(currentOffset + filteredProducts.length, totalCount)

  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)

  const [detailLoading, setDetailLoading] = useState(false) 
  const [detailError, setDetailError] = useState(null) 
  
  const [uploading, setUploading] = useState(false)


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

    // const exportData = products.map(p => ({
    //     Product_ID: p.productId,
    //     Name: p.name,
    //     Brand: p.brand,
    //     Category: p.category?.name,
    //     Selling_Price: p.pricing?.sellingPrice,
    //     MRP: p.pricing?.mrp,
    //     Stock: p.stock?.availableQuantity,
    //     Status: p.status,
    //     Created_At: formatIST(p.createdAt)
    //   }))

    const exportData = filteredProducts.map(p => ({
        Product_ID: p.productId,
        Name: p.name,
        Brand: p.brand,
        Category: p.category?.name,
        Selling_Price: p.pricing?.sellingPrice,
        MRP: p.pricing?.mrp,
        Stock: p.stock?.availableQuantity,
        Status: p.status,
        Created_At: formatIST(p.createdAt)
      }))
      
  

    const [form, setForm] = useState({
        name: '',
        brand: '',
        categoryId: '',
        categoryName: '',
        subCategory: '',
        description: '',
      
        pricing: {
          mrp: '',
          sellingPrice: '',
          discountPercentage: 0,
          currency: 'INR'
        },
      
        quantity: {
            unit: "",
            value: ""
        },
      
        stock: {
          availableQuantity: '',
          minimumThreshold: 0,
          outOfStock: false
        },
      
        tax: {
          gstApplicable: false,
          gstPercentage: 0
        },
      
        productType: 'GROCERY',
      
        expiry: {
          expiryRequired: false,
          expiryDate: ''
        },
      
        manufacturingDetails: {
            manufacturer: '',
          countryOfOrigin: ''
        },
      
        barcode: '',
        images: [],
        status: 'ACTIVE'
      })
     
      
      const fetchProducts = async (key = null, categoryIdOverride = null) => {
        setLoading(true)
      
        const res = await getProducts({
          pageSize,
          lastKey: key,
          categoryId: categoryIdOverride ?? selectedCategory
        })
      
        if (res?.success) {
          setProducts(res.data)
          setFilteredProducts(res.data)
      
          setNextKey(res.pagination?.nextPageKey || null)
          setTotalCount(res.totalCount || 0)
      
          if (key) {
            setPrevKeys(prev => [...prev, key])
            setCurrentOffset(prev => prev + pageSize)
          } else {
            setPrevKeys([])
            setCurrentOffset(0)
          }
        }
      
        setLoading(false)
      }
      
      

  const fetchCategories = async () => {
    const data = await getCategories()
    setCategories(data.filter(c => !c.isDeleted))
  }

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId)
    setCurrentOffset(0)
    setPrevKeys([])
    fetchProducts(null, categoryId)
  }
  
  

  useEffect(() => {
    fetchProducts(null)
    fetchCategories()
  }, [])
  

 
  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return
  
    setUploading(true)
  
    try {
      const uploadedUrls = []
  
      for (let file of Array.from(files)) {
        if (!file || !file.type.startsWith("image/")) continue
  
        const safeFileName = file.name
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9.-]/g, '')
          .toLowerCase()
  
        const url = await uploadToS3(
          file,
          `products/${Date.now()}-${safeFileName}`
        )
  
        uploadedUrls.push(url)
      }
  
      if (uploadedUrls.length) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }))
      }
  
    } catch (err) {
      console.error("Upload error:", err)
      alert("Image upload failed")
    }
  
    setUploading(false)
  }
  

  const handleEdit = async (p) => {
    const res = await getProductById(p.productId)
  
    if (!res.success) return alert("Failed to load product")
  
    const prod = res.data
  
    setForm({
      name: prod.name || '',
      brand: prod.brand || '',
      categoryId: prod.category?.categoryId || '',
      categoryName: prod.category?.name || '',
      subCategory: prod.subCategory || '',
      description: prod.description || '',
      pricing: prod.pricing || { mrp:'', sellingPrice:'', currency:'INR' },
      quantity: prod.quantity || { value:'', unit:'PCS' },
      stock: prod.stock || { availableQuantity:'', minimumThreshold:0, outOfStock:false },
      tax: prod.tax || { gstApplicable:false, gstPercentage:0 },
      expiry: prod.expiry || { expiryRequired:false, expiryDate:'' },
      manufacturingDetails: prod.manufacturingDetails || { manufacturer:'', countryOfOrigin:'' },
      productType: prod.productType || 'GROCERY',
      barcode: prod.barcode || '',
      images: Array.isArray(prod.images) ? prod.images : [],
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
  
      const emptyForm = {
        name: '',
        brand: '',
        categoryId: '',
        categoryName: '',
        subCategory: '',
        description: '',
        pricing: { mrp:'', sellingPrice:'', discountPercentage:0, currency:'INR' },
        quantity: { value:'', unit:'PCS' },
        stock: { availableQuantity:'', minimumThreshold:0, outOfStock:false },
        tax: { gstApplicable:false, gstPercentage:0 },
        productType: 'GROCERY',
        expiry: { expiryRequired:false, expiryDate:'' },
        manufacturingDetails: { manufacturer:'', countryOfOrigin:'' },
        barcode: '',
        images:[],
        status:'ACTIVE'
      }
      
      setForm(emptyForm)
      
  
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

  const exportAllProducts = async (type) => {
    const res = await fetch(
      `${config.BASE_URL}/products/export?categoryId=${selectedCategory || ""}`
    )
    const data = await res.json()
  
    if (!data.success || !data.data.length) {
      alert("No data to export")
      return
    }
  
    const exportData = data.data.map(p => ({
      Product_ID: p.productId,
      Name: p.name,
      Category: p.category?.name,
      Selling_Price: p.pricing?.sellingPrice,
      MRP: p.pricing?.mrp,
      Status: p.status
    }))
  
    if (type === "excel") exportToExcel(exportData, "Products")
    if (type === "csv") exportToCSV(exportData, "Products")
    if (type === "pdf") exportToPDF(Object.keys(exportData[0]), exportData, "Products")
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
    setDetailLoading(true)
  
    const res = await getProductById(id)
  
    if (res.success) {
      setSelectedProduct(res.data)
    }
  
    setDetailLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    const ok = await deleteProduct(id)
    if (ok) fetchProducts()
  }

//   const current = products.slice((page - 1) * perPage, page * perPage)

const current = filteredProducts.slice(
    (page - 1) * perPage,
    page * perPage
  )
  

  const handleQuantityChange = (e) => {
    const { name, value } = e.target
    setForm({
      ...form,
      quantity: {
        ...form.quantity,
        [name]: value
      }
    })
  }

  const extractS3Key = (url) => {
    try {
      return url.split(".amazonaws.com/")[1] || null;
    } catch {
      return null;
    }
  };

  const isS3Image = (url) => {
    return (
      url.includes(".amazonaws.com/") &&
      (
        url.includes("masterg-dev") ||
        url.includes("masterg") ||
        url.includes(process.env.REACT_APP_S3_BUCKET || "")
      )
    );
  };

  const handleDeleteImage = async (imageUrl, index) => {
    const confirm = window.confirm("Are you sure you want to delete this image?");
    if (!confirm) return;
  
    // ✅ Optimistic UI
    const backupImages = [...form.images];
    const updatedImages = form.images.filter((_, i) => i !== index);
  
    setForm(prev => ({
      ...prev,
      images: updatedImages
    }));
  
    try {
      const res = await fetch(
        `${config.BASE_URL}/products/${editId}/image`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl
          })
        }
      );
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }
  
    } catch (error) {
      alert("Failed to delete image");
      console.error(error);
  
      // ❌ rollback on failure
      setForm(prev => ({
        ...prev,
        images: backupImages
      }));
    }
  };
  
  
  
  const closeViewModal = () => {
    setDetailVisible(false)
    setSelectedProduct(null)
  }
  
  
  
  const handleStockChange = (e) =>
    setForm({ ...form, stock: { ...form.stock, [e.target.name]: e.target.value }})

  const handleTaxChange = (e) =>
    setForm({ ...form, tax: { ...form.tax, [e.target.name]: e.target.value === 'true' ? true : e.target.value }})

  const handleExpiryChange = (e) =>
    setForm({ ...form, expiry: { ...form.expiry, [e.target.name]: e.target.value }})

  const handleManufacturingChange = (e) =>
    setForm({ ...form, manufacturingDetails: { ...form.manufacturingDetails, [e.target.name]: e.target.value }})
  

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })
  
  const handlePricingChange = (e) => {
    const { name, value } = e.target;
  
    setForm((prev) => {
      const pricing = {
        ...prev.pricing,
        [name]: value ? Number(value) : 0,
      };
  
      // Auto calculate discount %
      if (pricing.mrp > 0 && pricing.sellingPrice > 0) {
        pricing.discountPercentage = Number(
          (((pricing.mrp - pricing.sellingPrice) / pricing.mrp) * 100).toFixed(2)
        );
      } else {
        pricing.discountPercentage = 0;
      }
  
      return {
        ...prev,
        pricing,
      };
    });
  };
  
  
  const handleImageChange = (i, value) => {
    const newImages = [...form.images]
    newImages[i] = value
    setForm({ ...form, images: newImages })
  }
  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
 <div className="d-flex justify-content-between align-items-center mb-3">

{/* LEFT: Title */}
<h5 className="mb-0 fw-semibold">Products</h5>

{/* RIGHT: Actions */}
<div className="d-flex gap-2">

<CFormSelect
  size="sm"
  value={selectedCategory}
  onChange={(e) => handleCategoryFilter(e.target.value)}
  className="w-auto"
>
  <option value="">All Categories</option>
  {categories.map(c => (
    <option key={c.categoryId} value={c.categoryId}>
      {c.name}
    </option>
  ))}
</CFormSelect>


  <CDropdown>
    <CDropdownToggle color="light" size="sm" className="border">
      <CIcon icon={cilCloudDownload} className="me-1" />
      Export
    </CDropdownToggle>

    <CDropdownMenu>
      <CDropdownItem onClick={() => exportAllProducts("excel")}>
        📗 Export Excel
      </CDropdownItem>
      <CDropdownItem onClick={() => exportAllProducts("csv")}>
        📄 Export CSV
      </CDropdownItem>
      <CDropdownItem onClick={() => exportAllProducts("pdf")}>
        📕 Export PDF
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>

  <CButton color="primary" size="sm" onClick={() => setVisible(true)}>
    <CIcon icon={cilPlus} className="me-1" />
    Add Product
  </CButton>

</div>
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

<div className="position-relative">
  <CAvatar
    size="md"
    src={
      typeof p.image === "string" && p.image.trim() !== ""
        ? p.image
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`
    }
  />
</div>




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

      <CTableDataCell><div>
          <div>₹ {p.pricing?.sellingPrice}</div>
          <small className="text-body-secondary">
            MRP: ₹ {p.pricing?.mrp}
          </small>
        </div> </CTableDataCell>

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


      <div className="d-flex justify-content-between align-items-center mt-3">

{/* LEFT: COUNT INFO */}
<small className="text-body-secondary">
  Showing <b>{start}</b> – <b>{end}</b> of <b>{totalCount}</b> products
</small>

{/* RIGHT: BUTTONS */}
<div className="d-flex gap-2 mb-3">
  <CButton
    size="sm"
    disabled={prevKeys.length === 0}
    onClick={() => {
      const prev = [...prevKeys]
      const last = prev.pop()
      setPrevKeys(prev)
      setCurrentOffset(o => Math.max(o - pageSize, 0))
      fetchProducts(last)
    }}
  >
    ⬅ Previous
  </CButton>

  <CButton
    size="sm"
    disabled={!nextKey}
    onClick={() => fetchProducts(nextKey)}
  >
    Next ➡
  </CButton>
</div>

</div>



      {/* ADD / EDIT MODAL */}
      <CModal size="lg" visible={visible} onClose={()=>setVisible(false)}>
  <CModalHeader>
    <CModalTitle>{isEdit ? "Edit Product" : "Add Product"}</CModalTitle>
  </CModalHeader>

  <CModalBody>

    {/* BASIC INFO */}
    <h6 className="mb-2 text-primary">Basic Info</h6>
    <div className="row mb-2">
      <div className="col-md-6">
        <CFormInput label="Product Name" name="name" value={form.name} onChange={handleChange}/>
      </div>
      <div className="col-md-6">
        <CFormInput label="Brand" name="brand" value={form.brand} onChange={handleChange}/>
      </div>
    </div>

    <div className="row mb-2">
      <div className="col-md-6">
        <CFormSelect label="Category" value={form.categoryId} onChange={handleCategoryChange}>
        <option value="">Select Category</option>
        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
        </CFormSelect>
      </div>
      <div className="col-md-6">
        <CFormInput label="Sub Category" name="subCategory" value={form.subCategory} onChange={handleChange}/>
      </div>
    </div>
    
    <CFormInput className='mb-2' label="Description" name="description" value={form.description} onChange={handleChange}/>

    {/* PRICING */}
    <hr/>
    <h6 className="text-primary">Pricing</h6>
    <div className="row">
      <div className="col-md-3">
        <CFormInput label="MRP" type="number" name="mrp" value={form.pricing.mrp} onChange={handlePricingChange}/>
      </div>
      <div className="col-md-3">
        <CFormInput label="Selling Price" type="number" name="sellingPrice" value={form.pricing.sellingPrice} onChange={handlePricingChange}/>
      </div>
      <div className="col-md-3">
        <CFormInput label="Discount Percentage" type="number" name="discountPercentage" value={form.pricing.discountPercentage}
  readOnly onChange={handlePricingChange}/>
      </div>
      <div className="col-md-3">
        <CFormSelect label="Currency" name="currency" value={form.pricing.currency} onChange={handlePricingChange}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </CFormSelect>
      </div>
    </div>

    {/* Quantity */}
    <hr/>
    <h6 className="text-primary">Quantity</h6>
    <div className="row mb-2">
      <div className="col-md-4">
        <CFormInput label="Value" name="value" value={form.quantity.value} onChange={handleQuantityChange}/>
      </div>
      <div className="col-md-4">
  <CFormSelect
    label="Unit"
    name="unit"
    value={form.quantity.unit}
    onChange={handleQuantityChange}
  >
    <option value="">Select Unit</option>
    <option value="KG">KG</option>
    <option value="GM">GM</option>
    <option value="LTR">LTR</option>
    <option value="PCS">PCS</option>
  </CFormSelect>
</div>

      <div className="col-md-4">
        <CFormSelect label="Product Type" name="productType" value={form.productType} onChange={handleChange}>
        <option>FRESH</option>
        <option>PACKAGED</option>
        <option>BEVERAGE</option>
        <option>PERISHABLE</option>
        <option>GROCERY</option>
        <option>ELECTRONICS</option>
        <option>FASHION</option>
        </CFormSelect>
      </div>
    </div>

    <hr/>
<h6 className="text-primary">Stock</h6>
<div className="row mb-2">

  <div className="col-md-4">
    <CFormSelect
      label="Out Of Stock"
      name="outOfStock"
      value={String(form.stock.outOfStock)} 
      onChange={(e)=>setForm({
        ...form,
        stock:{ ...form.stock, outOfStock: e.target.value === 'true' }
      })}
    >
      <option value="false">False</option>
      <option value="true">True</option>
    </CFormSelect>
  </div>

  <div className="col-md-4">
    <CFormInput
      label="Available Quantity"
      name="availableQuantity"
      type="number"
      value={form.stock.availableQuantity}
      onChange={handleStockChange}
    />
  </div>

  <div className="col-md-4">
    <CFormInput
      label="Minimum Threshold"
      name="minimumThreshold"
      type="number"
      value={form.stock.minimumThreshold}
      onChange={handleStockChange}
    />
  </div>

</div>


    <hr/>
    <h6 className="text-primary">Tax, Expiry & Manufacturing Details</h6>
    <div className="row mb-2">
      <div className="col-md-4">
      <CFormSelect label="GST Applicable" name="gstApplicable" value={form.tax.gstApplicable} onChange={handleTaxChange}>
        <option value='false'>False</option>
        <option value='true'>True</option>
        </CFormSelect>
      </div>
      <div className="col-md-4">
      <CFormInput
      label="GST Percentage"
        name="gstPercentage"
        value={form.tax.gstPercentage}
        onChange={(e)=>setForm({
            ...form,
            tax:{ ...form.tax, gstPercentage: e.target.value }
        })}
        />

      </div>
      <div className="col-md-4">
        <CFormInput type="date" label="Expiry Date" name="expiryDate" value={form.expiry.expiryDate} onChange={handleExpiryChange}/>
      </div>
    </div>  

    <div className="row mb-2">
      <div className="col-md-4">
        <CFormSelect label="Expiry Required" name="expiryRequired" value={form.expiry.expiryRequired} onChange={(e)=>setForm({
  ...form,
  expiry:{ ...form.expiry, expiryRequired: e.target.value === 'true' }
})}>
        <option value='false'>False</option>
        <option value='true'>True</option>
        </CFormSelect>
      </div>
      <div className="col-md-4">
        <CFormInput label="Manufacturer Name" name="manufacturer" value={form.manufacturingDetails.manufacturer} onChange={handleManufacturingChange}/>
      </div>
      <div className="col-md-4">
        <CFormInput label="Country Of Origin" name="countryOfOrigin" value={form.manufacturingDetails.countryOfOrigin} onChange={handleManufacturingChange}/>
      </div>
    </div>
    

    {/* MEDIA */}
    {/* MEDIA */}
<hr />
<h6 className="text-primary">Media</h6>

<div className="mb-4">

<CFormInput
  type="file"
  label="Product Images"
  accept="image/*"
  multiple
  onChange={(e) => {
    if (e.target.files.length > 0) {
      handleMultipleFileUpload(e.target.files)
      e.target.value = null // ✅ reset input
    }
  }}
/>


  {uploading && (
    <div className="mt-1">
      <small className="text-primary">Uploading images...</small>
    </div>
  )}


{/* IMAGES */}
{/* {selectedProduct?.images?.length > 0 && (
  <div className="row mb-3">
    {selectedProduct.images.map((img, i) => (
      <div className="col-md-3 mb-2" key={i}>
        <div className="border rounded p-1">
          <img
            src={img}
            alt="product"
            style={{ height: 120, width: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    ))}
  </div>
)} */}

{/* IMAGES (EDIT MODE) */}
{form.images?.filter(Boolean).length > 0 && (
  <div className="row mb-3">
    {form.images.filter(Boolean).map((img, i) => (
      <div className="col-md-3 mb-2" key={i}>
        <div className="border rounded p-1 position-relative">
          <span
            className="position-absolute top-0 end-0 ..."
            onClick={() => handleDeleteImage(img, i)}
          >
            ×
          </span>

          <img
            src={img}
            alt="product"
            style={{ height: 120, width: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    ))}
  </div>
)}





</div>


    <div className="row mb-2 mt-2">
      <div className="col-md-4">
        <CFormInput label="Barcode" name="barcode" value={form.barcode} onChange={handleChange}/>
      </div>
      <div className="col-md-4">
        <CFormSelect label="Status" name="status" value={form.status} onChange={handleChange}>
        <option>ACTIVE</option>
        <option>INACTIVE</option>
        </CFormSelect>
      </div>
    </div>

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
  {selectedProduct?.images?.length > 0 && (
    <div className="row mt-3">
      {selectedProduct.images.map((img, i) => (
        <div className="col-md-3 mb-2" key={i}>
          <div className="border rounded p-1">
            <img
              src={img}
              alt="product"
              style={{ height: 120, width: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      ))}
    </div>
  )}
</div>


        <h5 className="text-primary">Basic Info</h5>
        <p><b>Name:</b> {selectedProduct.name}</p>
        <p><b>Brand:</b> {selectedProduct.brand}</p>
        <p><b>Description:</b> {selectedProduct.description}</p>
        <p><b>Barcode:</b> {selectedProduct.barcode}</p>

        <h6 className="text-primary">Status :  
            <CBadge color={selectedProduct.status === "ACTIVE" ? "success" : "secondary"}>
            {selectedProduct.status}
            </CBadge>
        </h6>
        <hr/>

        <h5 className="text-primary">Category</h5>
        <p><b>Category ID:</b> {selectedProduct.category?.categoryId}</p>
        <p><b>Category Name:</b> {selectedProduct.category?.name}</p>
        <p><b>Sub Category :</b> {selectedProduct.subCategory}</p>

        <hr/>

        <h5 className="text-primary">Pricing</h5>
        <p><b>Selling Price:</b> ₹ {selectedProduct.pricing?.sellingPrice}</p>
        <p><b>MRP:</b> ₹ {selectedProduct.pricing?.mrp}</p>
        <p><b>Discount Percentage:</b> {selectedProduct.pricing?.discountPercentage || "0"} % </p>
        <p><b>Tax:</b> {selectedProduct.tax?.gstPercentage} %</p>
        <p><b>Currency:</b> {selectedProduct.pricing?.currency}</p>
        <hr/>

        <h5 className="text-primary">Quantity</h5>
        <p><b>Unit:</b> {selectedProduct.quantity?.unit}</p>
        <p><b>Value:</b> {selectedProduct.quantity?.value}</p>
        <hr/>

        <h5 className="text-primary">Stock</h5>
        <p><b>Available Quantity:</b>  {selectedProduct.stock?.availableQuantity}</p>
        <p><b>Minimum Threshold:</b>  {selectedProduct.stock?.minimumThreshold}</p>
        <hr/>

        <h5 className="text-primary">Tax</h5>
        <p><b>GST Applicable:</b> {selectedProduct.tax?.gstApplicable}</p>
        <p><b>GST Percentage:</b>  {selectedProduct.tax?.gstPercentage} %</p>
        <hr/>

        <h5 className="text-primary">Expiry</h5>
        <p><b>Product Type:</b> {selectedProduct.productType}</p>
        <p><b>Expiry Required:</b> {selectedProduct.expiry?.expiryRequired}</p>
        <p><b>Expiry Date:</b> {selectedProduct.expiry?.expiryDate || "N/A"}</p>

        <hr/>

        <h5 className="text-primary">Manufacturing</h5>
        <p><b>Manufacturer:</b> {selectedProduct.manufacturingDetails?.manufacturer}</p>
        <p><b>Country:</b> {selectedProduct.manufacturingDetails?.countryOfOrigin}</p>

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

export default Products
