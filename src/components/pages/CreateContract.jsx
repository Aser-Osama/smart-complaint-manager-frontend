import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

const CreateContract = () => {
  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState("");
  const [contractType, setContractType] = useState("");
  const [contractTypes, setContractTypes] = useState([]); // Store contract types separately
  const [schemaFields, setSchemaFields] = useState([]); // Store fields for selected schema
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    // Fetch available contract types
    const fetchContractTypes = async () => {
      try {
        const response = await axiosPrivate.get("/schema/types"); // Endpoint to get all schemas
        const types = [
          ...new Set(response.data.map((schema) => schema.contract_type)),
        ];
        setContractTypes(types); // Store contract types separately
      } catch (error) {
        console.error("Error fetching contract types:", error);
      }
    };
    setUploader(auth.id);
    fetchContractTypes();
  }, []);

  const handleSchemaSelect = async (type) => {
    setContractType(type);
    setData({});
    try {
      const response = await axiosPrivate.get(`/schema/types/${type}`); // Get schema by type
      setSchemaFields(response.data); // Set fields only for selected schema type
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
      })
    );

    try {
      await axiosPrivate.post("/contract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setFile(null);
      setUploader("");
      setContractType("");
      setData({});
      setSchemaFields([]); // Clear schema fields on successful submission
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
        <Alert variant="success">Contract created successfully!</Alert>
      )}
      {errors.length > 0 && (
        <Alert variant="danger">
          {errors.map((err, idx) => (
            <p key={idx}>{err}</p>
          ))}
        </Alert>
      )}
      <Form.Group controlId="fileUpload">
        <Form.Label>Upload Contract File</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>
      {/* <Form.Group controlId="uploader">
        <Form.Label>Uploader ID</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter uploader ID"
          value={uploader}
          onChange={(e) => setUploader(e.target.value)}
        />
      </Form.Group> */}
      <Form.Group controlId="contractType">
        <Form.Label>Contract Type</Form.Label>
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
      {schemaFields.map((field, index) => (
        <Form.Group key={index} controlId={`dataField-${field.key_name}`}>
          <Form.Label>{field.key_name}</Form.Label>
          <Form.Control
            type={
              field.value_type === "int"
                ? "number"
                : field.value_type === "decimal"
                ? "number"
                : "text"
            }
            name={field.key_name}
            placeholder={`Enter ${field.key_name}`}
            required={field.required}
            onChange={handleInputChange}
          />
        </Form.Group>
      ))}
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default CreateContract;
