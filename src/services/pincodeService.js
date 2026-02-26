import axios from "axios";
import config from "../config";

export const getPincodes = async () =>
  (await axios.get(`${config.BASE_URL}/admin/pincodes`)).data;

export const createPincode = async (data) =>
  (await axios.post(`${config.BASE_URL}/admin/pincodes`, data)).data;

export const updatePincode = async (pincode, data) =>
  (await axios.put(`${config.BASE_URL}/admin/pincodes/${pincode}`, data)).data;

export const togglePincodeStatus = async (pincode, is_active) =>
  (await axios.patch(
    `${config.BASE_URL}/admin/pincodes/status/${pincode}`,
    { is_active }
  )).data;

export const deletePincode = async (pincode) =>
  (await axios.delete(`${config.BASE_URL}/admin/pincodes/${pincode}`)).data;