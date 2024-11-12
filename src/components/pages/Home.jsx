// src/components/Home.js
import React, { useEffect, useState } from "react";
import ContractsTable from "../ContractsTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Link, useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

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
    <Container fluid="xxl">
      <Row>
        <h1>
          {params.filter && params.filter.toLowerCase() !== "all"
            ? `Contracts of type ${
                params.filter.charAt(0).toUpperCase() + params.filter.slice(1)
              }`
            : "All Contracts"}
        </h1>
      </Row>
      <Row>
        <ContractsTable contracts={contracts} />
      </Row>
      <Row className="text-end">
        <Col>
          <Link to="/createcontract" className="btn btn-primary">
            Create Contract
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
