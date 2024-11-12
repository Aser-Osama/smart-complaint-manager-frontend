import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { FaSync } from "react-icons/fa";

import {
  Button,
  Col,
  Container,
  Modal,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import ReceiptTable from "../ReceiptsTable.jsx";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.js";

const ViewContract = () => {
  const AxiosPrivate = useAxiosPrivate();
  const [receipts, setReceipts] = useState(null);
  const [id, setId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showToast, setShowToast] = useState(false);
  // Get the URL parameters and validate them
  const params = useParams();
  if (!params.id || isNaN(params.id)) {
    return <p>Invalid contract number...</p>;
  }
  const handleFileUpload = async () => {
    if (!selectedFiles) {
      setShowModal(false);
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    try {
      const response = await AxiosPrivate.post(
        `/receipt/upload/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 202) {
        setShowToast(true); // Show the toast notification
      } else {
        console.error("Error uploading files:", response.data.message);
      }
    } catch (error) {
      console.error("Error uploading files:", error.message);
    } finally {
      setShowModal(false);
    }
  };
  const fetchReceipts = async () => {
    try {
      // Fetch the schema
      const receiptsResponse = (
        await AxiosPrivate.get(`/receipt/contractid/${Number(params.id) ?? 0}`)
      ).data;
      setReceipts(receiptsResponse);

      //console.log("Contracts data fetched:", contractsResponse);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(new Error(error.response.data.message));
      } else {
        console.error("Error fetching data:", error);
        setError(error);
      }
    }
  };
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await AxiosPrivate.get(`/contract/file/${params.id}`, {
          responseType: "blob",
        });
        if (response.status === 200) {
          const url = URL.createObjectURL(response.data);
          setPdfUrl(url);
        } else {
          console.error("Error fetching PDF:", response.data.message);
        }
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
    (receipts && (
      <Container className="m-5" fluid={true}>
        <Row className="align-items-center mb-3">
          <Col xxl="auto" className="border-end border-2 ">
            <FaSync
              onClick={fetchReceipts}
              style={{ cursor: "pointer" }}
              size={20}
            />
          </Col>
          <Col>
            <h1 className="mb-0 ms-0">
              Contract Number:{" "}
              {!isNaN(params.id) ? params.id : "Invalid Contract Number"}
            </h1>
          </Col>
        </Row>
        <Row>
          <ToastContainer position="top-end" className="p-3">
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={5000}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">File Uploading</strong>
              </Toast.Header>
              <Toast.Body>
                <h6>Files received and processing has started.</h6>
                <p>
                  Refreshing using the refrsh button in a few seconds is
                  recommended.
                </p>
              </Toast.Body>
            </Toast>
          </ToastContainer>
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
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(true)}
                >
                  Upload Receipt(s)
                </button>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Upload Receipt(s)</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleFileUpload}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
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
    )) ||
    (error && (
      <Container>
        <Row className="py-5">
          <h1 className="text-danger">Error fetching data</h1>
          <h5>{error.message}</h5>
        </Row>
        <Row>
          <Col className="me-auto">
            <NavLink to="/">
              <button className="btn btn-danger">Back to Contracts</button>
            </NavLink>
          </Col>
          <Col className="ms-auto me-0 text-end">
            <NavLink to={`/upload/id/${id}`}>
              <button className="btn btn-primary">Upload Receipt(s)</button>
            </NavLink>
          </Col>
        </Row>
      </Container>
    )) || <p>Loading data...</p>
  );
};

export default ViewContract;
