import axios from "axios";
import config from "../config";

export const getPriceChanges = async () =>
  (await axios.get(`${config.BASE_URL}/admin/price-changes`)).data;

export const createPriceChange = async (data) =>
  (await axios.post(`${config.BASE_URL}/admin/price-changes`, data)).data;

export const updatePriceChange = async (id, data) =>
  (await axios.put(`${config.BASE_URL}/admin/price-changes/${id}`, data)).data;

export const togglePriceChangeStatus = async (id, status) =>
  (await axios.patch(`${config.BASE_URL}/admin/price-changes/status/${id}`, { status })).data;

export const deletePriceChange = async (id) =>
  (await axios.delete(`${config.BASE_URL}/admin/price-changes/${id}`)).data;
