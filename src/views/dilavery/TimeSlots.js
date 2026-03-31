import React, { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CBadge, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSwitch, CSpinner
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilPencil } from "@coreui/icons";

import {
  getTimeSlots,
  saveTimeSlots
} from "../../services/timeSlotService";

const TimeSlots = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    id: "",
    label: "",
    start: "",
    end: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getTimeSlots();
    setList(res || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.label || !form.start || !form.end) {
      alert("All fields required");
      return;
    }
  
    const updatedList = [...list];
  
    let newId = form.id;
  
    // 🔥 if new slot → auto id generate
    if (!newId) {
      const maxId = list.length > 0 ? Math.max(...list.map(x => x.id)) : 0;
      newId = maxId + 1;
    }
  
    const existingIndex = updatedList.findIndex(x => x.id === newId);
  
    if (existingIndex !== -1) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...form,
        id: newId
      };
    } else {
      updatedList.push({
        ...form,
        id: newId,
        isActive: true
      });
    }
  
    await saveTimeSlots({ timeSlots: updatedList });
  
    setVisible(false);
    setForm({ id: "", label: "", start: "", end: "" });
    fetchData();
  };

  const handleEdit = (row) => {
    setForm(row);
    setVisible(true);
  };

  const handleToggle = async (row) => {
    const updatedList = list.map(x =>
      x.id === row.id ? { ...x, isActive: !x.isActive } : x
    );

    setList(updatedList);

    await saveTimeSlots({ timeSlots: updatedList });
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <CSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h5>Delivery Time Slots</h5>
        <CButton size="sm" color="primary"  onClick={() => setVisible(true)}>
          <CIcon icon={cilPlus} className="me-1" /> Add
        </CButton>
      </div>


      <CTable hover responsive className="border">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Label</CTableHeaderCell>
            <CTableHeaderCell>Start</CTableHeaderCell>
            <CTableHeaderCell>End</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Active</CTableHeaderCell>
            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {list.map(row => (
            <CTableRow key={row.id}>
              <CTableDataCell>{row.label}</CTableDataCell>
              <CTableDataCell>{row.start}</CTableDataCell>
              <CTableDataCell>{row.end}</CTableDataCell>

              <CTableDataCell>
                <CBadge color={row.isActive ? "success" : "secondary"}>
                  {row.isActive ? "ACTIVE" : "INACTIVE"}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                <CFormSwitch
                  checked={row.isActive}
                  onChange={() => handleToggle(row)}
                />
              </CTableDataCell>

              <CTableDataCell>
                <CIcon
                  icon={cilPencil}
                  className="text-info cursor-pointer"
                  onClick={() => handleEdit(row)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
        <CModalTitle>
  {form.id ? "Edit Slot" : "Add Slot"}
</CModalTitle>
        </CModalHeader>

        <CModalBody>
         
          <CFormInput
            label="Label"
            value={form.label}
            onChange={e => setForm({ ...form, label: e.target.value })}
            className="mb-2"
          />
          <CFormInput
            label="Start Time"
            type="time"
            value={form.start}
            onChange={e => setForm({ ...form, start: e.target.value })}
            className="mb-2"
          />
          <CFormInput
            label="End Time"
            type="time"
            value={form.end}
            onChange={e => setForm({ ...form, end: e.target.value })}
          />
        </CModalBody>

        <CModalFooter>
          <CButton onClick={() => setVisible(false)}>Cancel</CButton>
          <CButton onClick={handleSubmit}>Save</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default TimeSlots;