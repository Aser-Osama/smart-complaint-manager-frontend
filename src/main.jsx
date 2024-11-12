import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/pages/Login";
import Logout from "./components/pages/Logout";
import RequireAuth from "./components/RequireAuth";
import Home from "./components/pages/Home";
import AdminPage from "./components/pages/AdminPage";
import Unauthorized from "./components/pages/Unauthorized.jsx";
import ViewContract from "./components/pages/ViewContract";
import ViewReceipt from "./components/pages/ViewReceipt";
import { AuthProvider } from "./context/AuthContext";
import React from "react";

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
        path: "/receipt/:id",
        element: (
          <RequireAuth>
            <ViewReceipt />
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
