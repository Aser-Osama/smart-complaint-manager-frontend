import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import ReceiptTable from "../ReceiptsTable.jsx";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.js";

const ViewContract = () => {
  const AxiosPrivate = useAxiosPrivate();
  const [receipts, setReceipts] = useState(null);
  const [id, setId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Get the URL parameters and validate them
  const params = useParams();
  if (!params.id || isNaN(params.id)) {
    return <p>Invalid contract number...</p>;
  }

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        // Fetch the schema
        const receiptsResponse = (
          await AxiosPrivate.get(
            `/receipt/contractid/${Number(params.id) ?? 0}`
          )
        ).data;
        setReceipts(receiptsResponse);
        //console.log("Contracts data fetched:", contractsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchPdf = async () => {
      try {
        const response = await fetch(
          `http://0.0.0.0:8080/www.irs.gov/pub/irs-pdf/f1040.pdf`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error fetching PDF:", error.message);
      }
    };

    setId(params.id);
    fetchReceipts();
    fetchPdf();
  }, [params.id]);

  console.log(params);

  return (
    receipts && (
      <Container className="mt-5" fluid={true}>
        <Row>
          <h1>
            Contract Number:{" "}
            {!isNaN(params.id) ? params.id : "Invalid Contract Number"}
          </h1>
          <h3></h3>
        </Row>
        <Row>
          <Col md={8}>
            <Row style={{ maxHeight: "600px", overflowY: "auto" }}>
              <ReceiptTable receipts={receipts} />
            </Row>

            <Row>
              <Col className="me-auto">
                <NavLink to="/">
                  <button className="btn btn-danger">Back to Contracts</button>
                </NavLink>
              </Col>
              <Col className="ms-auto me-0 text-end">
                {/* <NavLink to={`/edit/contract/${id}`} className="me-2">
                  <button className="btn btn-secondary">Edit Contract</button>
                </NavLink> */}
                <NavLink to={`/upload/id/${id}`}>
                  <button className="btn btn-primary">Upload Receipt(s)</button>
                </NavLink>
              </Col>
            </Row>
          </Col>
          <Col md={4}>
            {pdfUrl ? (
              <>
                <Row>
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                  />
                </Row>
                <Row className="text-end pt-1">
                  <Col>
                    <a href={pdfUrl} download={`contract_${params.id}.pdf`}>
                      Download PDF
                    </a>
                  </Col>
                </Row>
              </>
            ) : (
              <p>Loading PDF...</p>
            )}
          </Col>
        </Row>
      </Container>
    )
  );
};

export default ViewContract;
