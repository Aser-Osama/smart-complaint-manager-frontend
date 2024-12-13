import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { FaSync } from "react-icons/fa";
import EditableContractTable from "../ContractDataTable.jsx";
import Pagination from "../Pagination.jsx";
import {
  Button,
  Col,
  Container,
  Modal,
  Row,
  Toast,
  ToastContainer,
  ToggleButton,
  ToggleButtonGroup,
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
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showContractData, setShowContractData] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [schema, setSchema] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [mismatchOnly, setMismatchOnly] = useState(false);
  const [contract_name, setContractName] = useState(null);
  // Get the URL parameters and validate them
  const params = useParams();
  if (!params.id || isNaN(params.id)) {
    return <p>Invalid contract number...</p>;
  }

  const handleEdit = () => setIsEditing(true);

  const handleSave = async (updatedData) => {
    try {
      await AxiosPrivate.patch(`/contract`, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const fetchSchemaAndContract = async () => {
    try {
      const response = await AxiosPrivate.get(`/contract/id/${id}`);
      setContractData(response.data);
      setShowContractData(true);

      const schemaResponse = (
        await AxiosPrivate.get(`/schema/types/${response.data.contract_type}`)
      ).data;

      const schemaResponseAdjustedNaming = schemaResponse.map((item) => {
        return {
          key: item.key_name,
          value_type: item.value_type,
        };
      });
      console.log("Schema data fetched:", schemaResponseAdjustedNaming);
      setSchema(schemaResponseAdjustedNaming);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
        setShowErrorToast(true);
      }
    } catch (error) {
      console.error("Error uploading files:", error.message);
      setShowErrorToast(true);
    } finally {
      setShowModal(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      //setReceipts([]);
      // Fetch the schema
      const receiptsResponse = (
        await AxiosPrivate.get(
          `/receipt/contractid/${
            Number(params.id) ?? 0
          }?page=${pageNumber}&pageSize=${pageSize}&mismatchOnly=${mismatchOnly}`
        )
      ).data;
      setContractName(receiptsResponse.contract_name);
      setReceipts(receiptsResponse);
      setReceipts(receiptsResponse.data);
      setTotalItems(receiptsResponse.metadata.totalItems);
      setTotalPages(receiptsResponse.metadata.totalPages);
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

  // onChange Use Effect
  useEffect(() => {
    setId(params.id);
    fetchReceipts();
  }, [pageNumber, pageSize, mismatchOnly]);

  return (
    (receipts && (
      <Container className="m-5" fluid={true}>
        <Row className="align-items-center mb-3">
          <Col xxl="8">
            <Row className="align-items-center">
              <Col xxl="auto" className="border-end border-2">
                <FaSync
                  onClick={fetchReceipts}
                  style={{ cursor: "pointer" }}
                  size={20}
                />
              </Col>
              <Col xxl="10">
                {contract_name === null ? (
                  <h1 className="mb-0 ms-0">
                    Contract Number:{" "}
                    {!isNaN(params.id) ? params.id : "Invalid Contract Number"}
                  </h1>
                ) : (
                  <h1 className="mb-0 ms-0">Contract Name: {contract_name}</h1>
                )}
              </Col>
              <Col xxl="auto" className="text-end">
                <ToggleButtonGroup type="checkbox" className="mb-2">
                  <ToggleButton
                    id="tbg-check-1"
                    variant="outline-secondary"
                    value={0}
                    onClick={() => setMismatchOnly(!mismatchOnly)}
                  >
                    Mismatched Only
                  </ToggleButton>
                </ToggleButtonGroup>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <ToastContainer position="top-end" className="p-3">
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={10000}
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
          <ToastContainer position="top-end" className="p-3">
            <Toast
              onClose={() => setShowErrorToast(false)}
              show={showErrorToast}
              delay={5000}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">File Uploading Error</strong>
              </Toast.Header>
              <Toast.Body>
                <h6>Error Uploading Files.</h6>
                <p>
                  An error has occured while attempting to upload the files.
                  Ensure your files are in PDF format and under 25mbs in size.
                </p>
              </Toast.Body>
            </Toast>
          </ToastContainer>
          <Col md={8}>
            <Row style={{ maxHeight: "600px", overflowY: "auto" }}>
              <ReceiptTable receipts={receipts} />
            </Row>
            <Row className="mb-2">
              <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPageNumber}
                onPageSizeChange={setPageSize}
              />
            </Row>
            <Row>
              <Col className="me-auto">
                <NavLink to="/">
                  <button className="btn btn-danger">Back to Contracts</button>
                </NavLink>
              </Col>
              <Col className="ms-auto me-0 text-end">
                <NavLink to={`/auditcontract/${params.id}`}>
                  <button className="btn btn-primary me-2">
                    Generate Contract Report
                  </button>
                </NavLink>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(true)}
                >
                  Upload Invoice(s)
                </button>
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Upload Invoice(s)</Modal.Title>
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

                <Modal
                  show={showContractData}
                  onHide={() => setShowContractData(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Contract Data</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <EditableContractTable
                      receipt={contractData}
                      schema={schema}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onSave={handleSave}
                    />
                    {/* <pre>{JSON.stringify(contractData, null, 2)}</pre> */}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowContractData(false)}
                    >
                      Close
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
                    height="700px"
                    title="PDF Viewer"
                  />
                </Row>
                <Row className="text-end pt-1">
                  <Col className="me-auto text-start">
                    <a
                      href="#"
                      className=" text-start"
                      onClick={() => fetchSchemaAndContract()}
                    >
                      Stored Contract Details
                    </a>
                  </Col>
                  <Col>
                    <a href={pdfUrl} download={`contract_${params.id}.pdf`}>
                      Download PDF
                    </a>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <p>Loading PDF...</p>
                <Row className="text-end pt-1">
                  <Col className="me-auto text-start">
                    <a
                      href="#"
                      className=" text-start"
                      onClick={() => fetchSchemaAndContract()}
                    >
                      Stored Contract Details
                    </a>
                  </Col>
                  <Col>
                    <a href={pdfUrl} download={`contract_${params.id}.pdf`}>
                      Download PDF
                    </a>
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    )) ||
    (error && (
      <Container>
        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={10000}
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
        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowErrorToast(false)}
            show={showErrorToast}
            delay={5000}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">File Uploading Error</strong>
            </Toast.Header>
            <Toast.Body>
              <h6>Error Uploading Files.</h6>
              <p>
                An error has occured while attempting to upload the files.
                Ensure your files are in PDF format and under 25mbs in size.
              </p>
            </Toast.Body>
          </Toast>
        </ToastContainer>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Invoice(s)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleFileUpload}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
        <Row className="py-5">
          <Col xxl="auto" className="border-end border-2 ">
            <FaSync
              onClick={fetchReceipts}
              style={{ cursor: "pointer" }}
              size={20}
            />
          </Col>
          <h2>{error.message}</h2>
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
              Upload Invoice(s)
            </button>
          </Col>
        </Row>
      </Container>
    )) || <p>Loading data...</p>
  );
};

export default ViewContract;
