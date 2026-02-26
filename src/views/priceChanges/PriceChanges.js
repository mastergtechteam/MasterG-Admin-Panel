import React, { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSelect, CFormSwitch, CSpinner
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilPencil, cilTrash } from "@coreui/icons";
import Select from "react-select";
import config from "../../config";

import {
  getPriceChanges,
  createPriceChange,
  updatePriceChange,
  deletePriceChange,
  togglePriceChangeStatus
} from "../../services/priceChangeService";

const PriceChanges = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [options, setOptions] = useState([]);
  const [nextKey, setNextKey] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);


  const [form, setForm] = useState({
    productId: "",
    productName: "",
    changePercent: "",
    expectedDate: "",
    type: "INCREASE",
    status: "ACTIVE"
  });
  

  const fetchData = async () => {
    try {
      setLoading(true);
  
      const res = await getPriceChanges();
  
      if (res?.success && Array.isArray(res.data)) {
        setList(res.data);
      } else {
        // ✅ API success but no data
        setList([]);
      }
    } catch (err) {
      console.error("Fetch price changes failed:", err);
      setList([]); // ✅ fallback
    } finally {
      setLoading(false); // 🔥 MOST IMPORTANT
    }
  };

  const fetchProducts = async (lastKey = null) => {
    let url = `${config.BASE_URL}/products/select?pageSize=20`;
    if (lastKey) {
      url += `&lastKey=${encodeURIComponent(lastKey)}`;
    }
  
    const res = await fetch(url);
    const data = await res.json();
  
    if (data.success) {
      setOptions(prev => lastKey ? [...prev, ...data.data] : data.data);
      setNextKey(data.nextKey || null);
    }
  };
  
  
  const loadProductOptions = async (inputValue) => {
    try {
      const res = await fetch(
        `${config.BASE_URL}/products/select?search=${encodeURIComponent(inputValue)}`
      );
      const data = await res.json();
  
      if (data.success && Array.isArray(data.data)) {
        return data.data; // [{ value, label }]
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  

  useEffect(() => {
    fetchData();
    fetchProducts(); 
  }, []);

  const handleSubmit = async () => {
    if (!form.productName || !form.changePercent || !form.expectedDate) {
      alert("Required fields missing");
      return;
    }

    const res = isEdit
      ? await updatePriceChange(editId, form)
      : await createPriceChange(form);

    if (res.success) {
      setVisible(false);
      setIsEdit(false);
      setEditId(null);
      setForm({
        productName: "",
        changePercent: "",
        expectedDate: "",
        type: "INCREASE",
        status: "ACTIVE"
      });
      fetchData();
    }
  };

  const handleEdit = (row) => {
    setForm({
      productId: row.productId,
      productName: row.productName,
      changePercent: row.changePercent,
      expectedDate: row.expectedDate,
      type: row.type,
      status: row.status
    });
    setEditId(row.priceChangeId);
    setIsEdit(true);
    setVisible(true);
  };
  

  

  const handleToggle = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setList(prev =>
      prev.map(x =>
        x.priceChangeId === row.priceChangeId
          ? { ...x, status: newStatus }
          : x
      )
    );
    await togglePriceChangeStatus(row.priceChangeId, newStatus);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this price change?")) return;
    await deletePriceChange(id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-semibold">Upcoming Price Changes</h5>
        <CButton size="sm" color="primary" onClick={() => setVisible(true)}>
          <CIcon icon={cilPlus} className="me-1" />
          Add
        </CButton>
      </div>

      {/* TABLE */}
<CTable align="middle" className="mb-0 border" hover responsive>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>Product</CTableHeaderCell>
      <CTableHeaderCell>Change %</CTableHeaderCell>
      <CTableHeaderCell>Expected Date</CTableHeaderCell>
      <CTableHeaderCell>Type</CTableHeaderCell>
      <CTableHeaderCell>Status</CTableHeaderCell>
      <CTableHeaderCell>Active</CTableHeaderCell>
      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
    </CTableRow>
  </CTableHead>

  <CTableBody>
    {list.length === 0 ? (
      <CTableRow>
        <CTableDataCell colSpan={7} className="text-center text-muted py-4">
          No price changes added yet. Click <b>Add</b> to create one.
        </CTableDataCell>
      </CTableRow>
    ) : (
      list.map((row) => (
        <CTableRow key={row.priceChangeId}>
          
          <CTableDataCell className="fw-semibold">
            {row.productName}
          </CTableDataCell>

          <CTableDataCell>{row.changePercent}%</CTableDataCell>

          <CTableDataCell>{row.expectedDate}</CTableDataCell>

          <CTableDataCell>
            <CBadge color={row.type === "INCREASE" ? "danger" : "success"}>
              {row.type}
            </CBadge>
          </CTableDataCell>

          <CTableDataCell>
            <CBadge color={row.status === "ACTIVE" ? "success" : "secondary"}>
              {row.status}
            </CBadge>
          </CTableDataCell>

          <CTableDataCell>
            <CFormSwitch
              checked={row.status === "ACTIVE"}
              onChange={() => handleToggle(row)}
            />
          </CTableDataCell>

          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <CIcon
                icon={cilPencil}
                className="text-info cursor-pointer"
                size="lg"
                onClick={() => handleEdit(row)}
              />
              <CIcon
                icon={cilTrash}
                className="text-danger cursor-pointer"
                size="lg"
                onClick={() => handleDelete(row.priceChangeId)}
              />
            </div>
          </CTableDataCell>

        </CTableRow>
      ))
    )}
  </CTableBody>
</CTable>


      {/* MODAL */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? "Edit" : "Add"} Price Change</CModalTitle>
        </CModalHeader>

        <CModalBody>
        <label className="form-label">Select Product</label>

<Select
  options={options}
  isLoading={loadingMore}
  placeholder="Select product..."
  className="mb-3"

  value={
    form.productId
      ? { value: form.productId, label: form.productName }
      : null
  }

  onChange={(selected) => {
    if (!selected) {
      setForm({ ...form, productId: "", productName: "" });
    } else {
      setForm({
        ...form,
        productId: selected.value,
        productName: selected.label,
      });
    }
  }}

  onMenuScrollToBottom={async () => {
    if (!nextKey || loadingMore) return;
    setLoadingMore(true);
    await fetchProducts(nextKey);
    setLoadingMore(false);
  }}

  styles={{
    control: (base) => ({ ...base, backgroundColor: "#fff" }),
    menu: (base) => ({ ...base, backgroundColor: "#fff", zIndex: 9999 }),
    option: (base, s) => ({
      ...base,
      backgroundColor: s.isFocused ? "#e9ecef" : "#fff",
      color: "#000",
    }),
    input: (b) => ({ ...b, color: "#000" }),
  }}
/>


          <CFormInput
            type="number"
            label="Change Percentage"
            value={form.changePercent}
            onChange={(e) => setForm({ ...form, changePercent: e.target.value })}
            className="mb-2"
          />
          <CFormInput
            type="date"
            label="Expected Date"
            value={form.expectedDate}
            onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
            className="mb-2"
          />
          <CFormSelect
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="INCREASE">INCREASE</option>
            <option value="DECREASE">DECREASE</option>
          </CFormSelect>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {isEdit ? "Update" : "Save"}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default PriceChanges;
