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
  const [contract, setContract] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  const [mismatchedCols, setMismatchedCols] = useState([]);
  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();

  //Update Use Effect
  useEffect(() => {
    // This effect will run whenever mismatchedCols changes
    console.log("mismatchedCols updated:", mismatchedCols);
  }, [mismatchedCols]);

  // Mount Use Effect
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

        setMismatchedCols(receiptResponse?.mismatched_columns?.col ?? []);
        const contractResponse = (
          await AxiosPrivate.get(`/contract/id/${receiptResponse.contract_id}`)
        ).data;

        const transformedContractData = contractResponse.data.reduce(
          (acc, data) => {
            acc[data.key] = data.value;
            return acc;
          },
          {}
        );
        setContract(transformedContractData);

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
        const response = await AxiosPrivate.get(`/receipt/file/${params.id}`, {
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

    fetchSchemaAndReceipt();
    fetchPdf();
  }, [params.id]);
  const fetchMismatch = async () => {
    try {
      const response = await AxiosPrivate.post(`/receipt/getmismatchedcols`, {
        receipt_id: params.id,
      });
      if (response.status === 200) {
        setMismatchedCols(response?.data[0]?.col ?? []);
      } else {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSave = async (updatedData) => {
    try {
      console.log("Saving data:", updatedData);
      await AxiosPrivate.patch(`/receipt`, updatedData);
      setReceipt(updatedData);
      await fetchMismatch();
      setIsEditing(false);
      setValidationErrors(null);
    } catch (error) {
      console.error("Error saving data:", error.response.data.errors);
      setValidationErrors(error.response.data.errors);
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
        <h1>Invoice Number: {params.id}</h1>
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
            {error && <p className="text-danger">{error}</p>}
          </Row>
          <Row>
            <Col>
              {mismatchedCols.length !== 0 && (
                <h4>Mismatched Columns and their contract data:</h4>
              )}
              <Col>
                <ul>
                  {mismatchedCols.map((col, index) => (
                    <li key={index}>
                      {col} : {contract[col]}
                    </li>
                  ))}
                </ul>
              </Col>
            </Col>
            <Col>
              {validationErrors && (
                <>
                  <h6>Some validation errors occurred:</h6>
                  <p>
                    If the element does not exist inside this invoice, use -1 as
                    a default value for numbers, "01-01-1971" for dates, and
                    "NA" for strings.
                  </p>
                  <ul>
                    {Object.entries(validationErrors).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Col>
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
