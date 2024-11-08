import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/Login";
import Logout from "./components/Logout";
import RequireAuth from "./components/RequireAuth";
import Home from "./components/Home";
import AdminPage from "./components/AdminPage";
import Unauthorized from "./components/Unauthorized";
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
