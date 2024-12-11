import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/pages/Login";
import Logout from "./components/pages/Logout";
import RequireAuth from "./components/RequireAuth";
import Home from "./components/pages/Home";
import CreateUser from "./components/pages/CreateUser.jsx";
import CreateAppUser from "./components/pages/CreateAppUser.jsx";
import AdminPage from "./components/pages/AdminPage";
import Unauthorized from "./components/pages/Unauthorized.jsx";
import ViewContract from "./components/pages/ViewContract";
import ViewReceipt from "./components/pages/ViewReceipt";
import ViewAppUser from "./components/pages/ViewAppUsers.jsx";
import ViewAppImages from "./components/pages/ViewAppImages.jsx";
import { AuthProvider } from "./context/AuthContext";
import React from "react";
import DownloadPage from "./components/DownloadFile.jsx";
import CreateContract from "./components/pages/CreateContract.jsx";
import CreateSchema from "./components/pages/CreateSchema.jsx";
import AuditReportPage from "./components/AuditReportPage.jsx";
import AuditContractPage from "./components/AuditContractPage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      // Protected routes
      {
        path: "/",
        element: (
          <RequireAuth>
            <Home />
          </RequireAuth>
        ),
      },
      {
        path: "/contracts/:filter?",
        element: (
          <RequireAuth>
            <Home />
          </RequireAuth>
        ),
      },
      {
        path: "/contract/:id",
        element: (
          <RequireAuth>
            <ViewContract />
          </RequireAuth>
        ),
      },
      {
        path: "/auditInvoice/:id",
        element: (
          <RequireAuth>
            <AuditReportPage />
          </RequireAuth>
        ),
      },
      {
        path: "/auditcontract/:id",
        element: (
          <RequireAuth>
            <AuditContractPage />
          </RequireAuth>
        ),
      },
      {
        path: "/receipt/:id",
        element: (
          <RequireAuth>
            <ViewReceipt />
          </RequireAuth>
        ),
      },
      {
        path: "/receipt/download/:id",
        element: (
          <RequireAuth>
            <DownloadPage downloadType="receipt" />
          </RequireAuth>
        ),
      },
      {
        path: "/contract/download/:id",
        element: (
          <RequireAuth>
            <DownloadPage downloadType="contract" />
          </RequireAuth>
        ),
      },
      {
        path: "/createcontract",
        element: (
          <RequireAuth>
            <CreateContract />
          </RequireAuth>
        ),
      },
      {
        path: "/createuser",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <CreateUser />
          </RequireAuth>
        ),
      },
      {
        path: "/createappuser",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <CreateAppUser />
          </RequireAuth>
        ),
      },
      {
        path: "/createschema",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <CreateSchema />
          </RequireAuth>
        ),
      },
      {
        path: "/viewappusers",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <ViewAppUser />
          </RequireAuth>
        ),
      },
      {
        path: "/viewappimages",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <ViewAppImages />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAuth allowedRoles={["admin"]}>
            <AdminPage />
          </RequireAuth>
        ),
      },
      {
        path: "*",
        element: <p>Page not found...</p>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
