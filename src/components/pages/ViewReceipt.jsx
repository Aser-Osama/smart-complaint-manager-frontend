import { useState, useEffect } from "react";
import EditableReceiptTable from "../ReceiptDataTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams, NavLink } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

const ViewReceipt = () => {
  const [schema, setSchema] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contractId, setContractId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (!params.id || isNaN(params.id)) {
      return;
    }

    const fetchSchemaAndReceipt = async () => {
      try {
        const receiptResponse = (
          await AxiosPrivate.get(`/receipt/id/${params.id}`)
        ).data;
        setReceipt(receiptResponse);
        setContractId(receiptResponse.contract_id);

        const schemaResponse = (
          await AxiosPrivate.get(`/receipt/schema/${params.id}`)
        ).data;
        setSchema(schemaResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchPdf = async () => {
      try {
        const response = await fetch(
          `http://0.0.0.0:8080/www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
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

    fetchSchemaAndReceipt();
    fetchPdf();
  }, [params.id, AxiosPrivate]);

  const handleSave = async (updatedData) => {
    try {
      console.log("Saving data:", updatedData);
      await AxiosPrivate.patch(`/receipt`, updatedData);
      setReceipt(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  if (!params.id || isNaN(params.id)) {
    return <p>Invalid contract number...</p>;
  }

  if (!schema.length || !receipt) return <p>Loading data...</p>;

  return (
    <Container className="mt-5" fluid={true}>
      <Row>
        <h1>Receipt Number: {params.id}</h1>
        <h3>for Contract Number: {contractId}</h3>
      </Row>
      <Row>
        <Col md={8}>
          <Row style={{ maxHeight: "600px", overflowY: "auto" }}>
            <EditableReceiptTable
              receipt={receipt}
              schema={schema}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
            />
          </Row>
          <Row>
            <Col className="me-auto">
              <NavLink to={`/contract/${contractId}`}>
                <button className="btn btn-danger">
                  Back to Contract {contractId}
                </button>
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
  );
};

export default ViewReceipt;
