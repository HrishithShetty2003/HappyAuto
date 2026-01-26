import API from "./api";

export const getAllCustomers = () =>
  API.get("/api/v1/admin/customers");

export const getAllDrivers = () =>
  API.get("/api/v1/admin/drivers");
