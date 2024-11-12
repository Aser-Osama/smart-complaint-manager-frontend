// src/components/Home.js
import React, { useEffect, useState } from "react";
import ContractsTable from "../ContractsTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";

const Home = () => {
  const [contracts, setContracts] = useState([]);
  const AxiosPrivate = useAxiosPrivate();
  const params = useParams();
  // Fetch schema and receipt data when the component mounts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // Fetch the schema
        if (params.filter) {
          const contractsResponse = (
            await AxiosPrivate.get(`/contract/type/${params.filter}`)
          ).data;
          setContracts(contractsResponse);
        } else {
          const contractsResponse = (await AxiosPrivate.get("/contract")).data;
          setContracts(contractsResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchContracts();
  }, [params.filter]);

  return (
    <div className="container-fluid mt-5">
      <h1>All Contracts</h1>
      <ContractsTable contracts={contracts} />
    </div>
  );
};

export default Home;
