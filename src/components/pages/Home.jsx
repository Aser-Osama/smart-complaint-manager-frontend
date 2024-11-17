// src/components/Home.js
import React, { useEffect, useState } from "react";
import ContractsTable from "../ContractsTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Link, useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import Pagination from "../Pagination";

const Home = () => {
  const [contracts, setContracts] = useState([]);
  const AxiosPrivate = useAxiosPrivate();
  const params = useParams();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch schema and receipt data when the component mounts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // Fetch the schema
        if (params.filter) {
          const contractsResponse = (
            await AxiosPrivate.get(
              `/contract/type/${params.filter}?page=${pageNumber}&pageSize=${pageSize}`
            )
          ).data;
          setContracts(contractsResponse.data);
          setTotalItems(contractsResponse.metadata.totalItems);
          setTotalPages(contractsResponse.metadata.totalPages);
        } else {
          const contractsResponse = (
            await AxiosPrivate.get(
              `/contract?page=${pageNumber}&pageSize=${pageSize}`
            )
          ).data;
          setContracts(contractsResponse.data);
          setTotalItems(contractsResponse.metadata.totalItems);
          setTotalPages(contractsResponse.metadata.totalPages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchContracts();
  }, [params.filter, pageNumber, pageSize]);

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
      <Row className="mb-2">
        <Col xl="10">
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
          />
        </Col>
        <Col xl="2" className="ms-auto text-end">
          <Link to="/createcontract" className="btn btn-primary">
            Create Contract
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
