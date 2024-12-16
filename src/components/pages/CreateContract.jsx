import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { NavLink } from "react-router-dom";

const CreateContract = () => {
  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState("");
  const [contractType, setContractType] = useState("");
  const [contract_name, setContractName] = useState("");
  const [company_name, setCompanyName] = useState("");
  const [contractTypes, setContractTypes] = useState([]);
  const [schemaFields, setSchemaFields] = useState([]);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [contractCreatedId, setContractCreatedId] = useState(null);
  const fileInputRef = useRef(null);
  const formatName = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        const response = await axiosPrivate.get("/schema/types");
        const types = [
          ...new Set(response.data.map((schema) => schema.contract_type)),
        ];
        setContractTypes(types);
      } catch (error) {
        console.error("Error fetching contract types:", error);
      }
    };
    setUploader(auth.id);
    fetchContractTypes();
  }, []);

  const clearFields = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploader(auth.id);
    setContractType("");
    setContractName("");
    setCompanyName("");
    setData({});
    setSchemaFields([]);
  };

  const handleSchemaSelect = async (type) => {
    clearFields();
    setContractType(type);
    try {
      const response = await axiosPrivate.get(`/schema/types/${type}`);
      const sortedFields = response.data.sort((a, b) => {
        const order = { text: 1, date: 2, number: 3 };
        return order[a.value_type] - order[b.value_type];
      });
      setSchemaFields(sortedFields);
    } catch (error) {
      console.error("Error fetching schema fields:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    if (!file || !uploader || !contractType) {
      setErrors(["Please provide all required fields."]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "reqdata",
      JSON.stringify({
        uploader,
        contract_type: contractType,
        data,
        contract_name,
        company_name,
      })
    );

    try {
      const contract = await axiosPrivate.post("/contract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      clearFields();
      setContractCreatedId(contract.data[0].id);
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(["An error occurred while creating the contract."]);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3>Create Contract</h3>
      {success && (
        <Alert variant="success">
          <Row>
            <Col className="me-auto">Contract created successfully!</Col>
            <Col className="text-end">
              <NavLink
                to={contractCreatedId ? `/contract/${contractCreatedId}` : `/`}
              >
                <button className="btn btn-success">Go To Contract</button>
              </NavLink>
            </Col>
          </Row>
        </Alert>
      )}
      {errors.length > 0 && (
        <Alert variant="danger">
          {errors.map((err, idx) => (
            <p key={idx}>{err}</p>
          ))}
        </Alert>
      )}

      <Form.Group controlId="contractType">
        <Form.Label className="mb-0 mt-3">Contract Type</Form.Label>
        <Form.Control
          as="select"
          value={contractType}
          onChange={(e) => handleSchemaSelect(e.target.value)}
        >
          <option value="">Select contract type</option>
          {contractTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="fileUpload">
        <Form.Label className="mb-0 mt-3">Upload Contract File</Form.Label>
        <Form.Control
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
        />
      </Form.Group>
      <Form.Group controlId="ContractName">
        <Form.Label className="mb-0 mt-3">Contract name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Contract Name"
          value={contract_name}
          onChange={(e) => setContractName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="ClientName">
        <Form.Label className="mb-0 mt-3">Client name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Company Name"
          value={company_name}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </Form.Group>
      <hr className="mt-3 mb-0" />
      <Row>
        {schemaFields.map((field, index) => (
          <Col md={6} key={index}>
            <Form.Group controlId={`dataField-${field.key_name}`}>
              <Form.Label className="mb-0 mt-3">
                {formatName(field.key_name)}
              </Form.Label>
              <Form.Control
                type={
                  field.value_type === "number"
                    ? "number"
                    : field.value_type === "date"
                    ? "date"
                    : "text"
                }
                step={field.value_type === "number" ? "any" : ""}
                name={field.key_name}
                placeholder={`Enter ${field.key_name}${
                  field.key_name === "payment_due_date"
                    ? "; ##d, ##m, and ##y for days, months, and years accordingly, ex: 15d"
                    : ""
                }`}
                required={field.required}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        ))}
      </Row>

      <Button variant="primary" type="submit" className="mt-3">
        Submit
      </Button>
    </Form>
  );
};

export default CreateContract;
