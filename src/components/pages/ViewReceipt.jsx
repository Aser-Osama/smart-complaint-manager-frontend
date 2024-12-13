import { useState, useEffect } from "react";
import EditableReceiptTable from "../ReceiptDataTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams, NavLink } from "react-router-dom";
import { Container, Row, Col, Alert } from "react-bootstrap";
import MismatchedColumnsTable from "../mismatchedColsTable";

const ViewReceipt = () => {
  const [schema, setSchema] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contractId, setContractId] = useState(null);
  const [contract, setContract] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [editNotice, setEditNotice] = useState(null);
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

        fetchMismatch();

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
        const schemaUpdated = schemaResponse.filter(
          (schema) => schema.key !== "expiration_date"
        );
        setSchema(schemaUpdated);
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
      console.log("Mismatched Columns:", response.data);
      if (response.status === 200) {
        setMismatchedCols(response?.data[0]);
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
      const realUpdatedData = await AxiosPrivate.get(
        `/receipt/id/${params.id}`
      );

      setReceipt(realUpdatedData.data);
      await fetchMismatch();
      setIsEditing(false);
      setEditNotice(null);
      setValidationErrors(null);
    } catch (error) {
      console.error("Error saving data:", error.response.data.errors);
      setValidationErrors(error.response.data.errors);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditNotice(
      <>
        <p>If the element does not exist inside this invoice:</p>
        <ul>
          <li>
            Use <strong>-1</strong> as a default value for numbers.
          </li>
          <li>
            Use <strong>"01-01-1971"</strong> for dates.
          </li>
          <li>
            Use <strong>"NA"</strong> for strings.
          </li>
        </ul>
        <p>
          If the element is a number but not a currency (e.g., "Number of X"),
          use <strong>-1</strong> for quantity.
        </p>
      </>
    );
  };

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
          <Row style={{ maxHeight: "800px", overflowY: "auto" }}>
            <EditableReceiptTable
              receipt={receipt}
              schema={schema}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
            />
            {error && <p className="text-danger">{error}</p>}
          </Row>
          <Row className="mt-3">
            <Col className="me-auto">
              <NavLink to={`/contract/${contractId}`}>
                <button className="btn btn-danger">
                  Back to Contract {contractId}
                </button>
              </NavLink>
            </Col>
            <Col className="text-end">
              <NavLink to={`/auditinvoice/${params.id}`}>
                <button className="btn btn-primary">
                  Generate Invoice Report
                </button>
              </NavLink>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <MismatchedColumnsTable mismatchedCols={mismatchedCols} />
            </Col>
          </Row>
          <Row>
            <Col className="col-8">
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
        </Col>
        <Col md={4}>
          {pdfUrl ? (
            <>
              <Row>
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="800px"
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
          {editNotice && (
            <Alert variant="info" className="mt-3">
              <strong>Important Notice: </strong>
              {editNotice}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ViewReceipt;
