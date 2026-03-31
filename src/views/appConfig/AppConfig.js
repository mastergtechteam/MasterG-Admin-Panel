import React, { useEffect, useState } from "react";
import {
  CCard, CCardBody, CCardHeader,
  CFormInput, CButton, CRow, CCol,
  CSpinner
} from "@coreui/react";

import {
  getAppConfig,
  saveAppConfig
} from "../../services/appConfigService";

const AppConfig = () => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAppConfig();
    setForm(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    await saveAppConfig(form);
    setIsEdit(false);
    fetchData();
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <CSpinner />
      </div>
    );
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <h5>App Config</h5>
        {!isEdit ? (
          <CButton color="primary" size="sm" onClick={() => setIsEdit(true)}>
            Edit
          </CButton>
        ) : (
          <CButton size="sm" color="success" onClick={handleSave}>
            Save
          </CButton>
        )}
      </CCardHeader>

      <CCardBody>
        <CRow>
          <CCol md={4}>
            <CFormInput
              label="Delivery Start Time"
              type="time"
              value={form.deliveryStartTime || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryStartTime", e.target.value)}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Delivery End Time"
              type="time"
              value={form.deliveryEndTime || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryEndTime", e.target.value)}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Min Order Amount"
              type="number"
              value={form.minOrderAmount || ""}
              disabled={!isEdit}
              onChange={e => handleChange("minOrderAmount", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Max Order Amount"
              type="number"
              value={form.maxOrderAmount || ""}
              disabled={!isEdit}
              onChange={e => handleChange("maxOrderAmount", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Platform Fee"
              type="number"
              value={form.platformFee || ""}
              disabled={!isEdit}
              onChange={e => handleChange("platformFee", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Delivery Charge"
              type="number"
              value={form.deliveryCharge || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryCharge", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Free Delivery Above"
              type="number"
              value={form.freeDeliveryAbove || ""}
              disabled={!isEdit}
              onChange={e => handleChange("freeDeliveryAbove", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Tax Percent"
              type="number"
              value={form.taxPercent || ""}
              disabled={!isEdit}
              onChange={e => handleChange("taxPercent", Number(e.target.value))}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Support Number"
              value={form.supportNumber || ""}
              disabled={!isEdit}
              onChange={e => handleChange("supportNumber", e.target.value)}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Whatsapp Number"
              value={form.whatsappNumber || ""}
              disabled={!isEdit}
              onChange={e => handleChange("whatsappNumber", e.target.value)}
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Delivery Message (Within)"
              value={form.deliveryMessageWithin || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryMessageWithin", e.target.value)}
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Delivery Message (Outside)"
              value={form.deliveryMessageOutside || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryMessageOutside", e.target.value)}
            />
          </CCol>

          <CCol md={12}>
            <CFormInput
              label="Warning Message"
              value={form.deliveryWarningMessage || ""}
              disabled={!isEdit}
              onChange={e => handleChange("deliveryWarningMessage", e.target.value)}
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default AppConfig;