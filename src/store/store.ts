import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import productSlice from "../slices/productSlice";
import customerSlice from "../slices/customerSlice";
import vendorSlice from "../slices/vendorSlice";
import inventorySlice from "../slices/inventorySlice";
import warehouseSlice from "../slices/warehouseSlice";
import salesOrderSlice from "../slices/salesOrderSlice";
import quotationSlice from "../slices/quotationSlice";
import invoiceSlice from "../slices/invoiceSlice";
import purchaseOrderSlice from "../slices/purchaseOrderSlice";
import vendorBillSlice from "../slices/vendorBillSlice";
import paymentSlice from "../slices/paymentSlice";
import paymentMadeSlice from "../slices/paymentMadeSlice";
import expenseSlice from "../slices/expenseSlice";
import dashboardSlice from "../slices/dashboardSlice";
import brandSlice from "../slices/brandSlice";
import challanSlice from "../slices/challanSlice";
import dispatchSlice from "../slices/dispatchSlice";
import userSlice from "../slices/userSlice";
import roleSlice from "../slices/roleSlice";
import settingsSlice from "../slices/settingsSlice";
import leadSlice from "../slices/leadSlice";
import reportSlice from "../slices/reportSlice";
import auditLogSlice from "../slices/auditLogSlice";
import automationSlice from "../slices/automationSlice";
import journalSlice from "../slices/journalSlice";
import templateSlice from "../slices/templateSlice";
import uiSlice from "../slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    customers: customerSlice,
    vendors: vendorSlice,
    inventory: inventorySlice,
    warehouses: warehouseSlice,
    salesOrders: salesOrderSlice,
    quotations: quotationSlice,
    invoices: invoiceSlice,
    purchaseOrders: purchaseOrderSlice,
    vendorBills: vendorBillSlice,
    payments: paymentSlice,
    paymentsMade: paymentMadeSlice,
    expenses: expenseSlice,
    dashboard: dashboardSlice,
    brands: brandSlice,
    challans: challanSlice,
    dispatch: dispatchSlice,
    users: userSlice,
    roles: roleSlice,
    settings: settingsSlice,
    leads: leadSlice,
    reports: reportSlice,
    auditLogs: auditLogSlice,
    automation: automationSlice,
    journal: journalSlice,
    templates: templateSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
