import React, { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSwitch, CSpinner
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilPencil, cilTrash } from "@coreui/icons";

import {
  getPincodes,
  createPincode,
  updatePincode,
  deletePincode,
  togglePincodeStatus
} from "../../services/pincodeService";

const Pincodes = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editPincode, setEditPincode] = useState(null);

  const [form, setForm] = useState({
    pincode: "",
    city: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getPincodes();
    setList(res?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.pincode || !form.city) {
      alert("Pincode & City required");
      return;
    }

    const res = isEdit
      ? await updatePincode(editPincode, { city: form.city })
      : await createPincode(form);

    if (res.success) {
      setVisible(false);
      setIsEdit(false);
      setForm({ pincode: "", city: "" });
      fetchData();
    }
  };

  const handleEdit = (row) => {
    setForm({ pincode: row.pincode, city: row.city });
    setEditPincode(row.pincode);
    setIsEdit(true);
    setVisible(true);
  };

  const handleToggle = async (row) => {
    const newStatus = !row.is_active;
    setList(prev =>
      prev.map(x =>
        x.pincode === row.pincode ? { ...x, is_active: newStatus } : x
      )
    );
    await togglePincodeStatus(row.pincode, newStatus);
  };

  const handleDelete = async (pincode) => {
    if (!window.confirm("Delete this pincode?")) return;
    await deletePincode(pincode);
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
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-semibold">Service Pincodes</h5>
        <CButton size="sm" color="primary" onClick={() => setVisible(true)}>
          <CIcon icon={cilPlus} className="me-1" />
          Add
        </CButton>
      </div>

      <CTable hover responsive className="border">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Pincode</CTableHeaderCell>
            <CTableHeaderCell>City</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Active</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {list.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={5} className="text-center text-muted">
                No pincodes found
              </CTableDataCell>
            </CTableRow>
          ) : (
            list.map(row => (
              <CTableRow key={row.pincode}>
                <CTableDataCell>{row.pincode}</CTableDataCell>
                <CTableDataCell>{row.city}</CTableDataCell>

                <CTableDataCell>
                  <CBadge color={row.is_active ? "success" : "secondary"}>
                    {row.is_active ? "ACTIVE" : "INACTIVE"}
                  </CBadge>
                </CTableDataCell>

                <CTableDataCell>
                  <CFormSwitch
                    checked={row.is_active}
                    onChange={() => handleToggle(row)}
                  />
                </CTableDataCell>

                <CTableDataCell className="text-center">
                  <CIcon
                    icon={cilPencil}
                    className="text-info me-3 cursor-pointer"
                    onClick={() => handleEdit(row)}
                  />
                  <CIcon
                    icon={cilTrash}
                    className="text-danger cursor-pointer"
                    onClick={() => handleDelete(row.pincode)}
                  />
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? "Edit" : "Add"} Pincode</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {!isEdit && (
            <CFormInput
              label="Pincode"
              value={form.pincode}
              onChange={e => setForm({ ...form, pincode: e.target.value })}
              className="mb-2"
            />
          )}
          <CFormInput
            label="City"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
          />
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

export default Pincodes;