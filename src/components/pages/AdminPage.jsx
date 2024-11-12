// src/components/AdminPage.js
import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AdminPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axiosPrivate.get("/admin/data");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      }
    };

    fetchAdminData();
  }, [axiosPrivate]);

  return (
    <div className="container-fluid mt-5">
      <h2>Admin Page</h2>
      <p>This page is only accessible by admin users.</p>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default AdminPage;
