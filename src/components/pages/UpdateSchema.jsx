import React, { useState, useEffect } from "react";
import { Table, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { axiosPrivate } from "../../api/axios";

const UpdateSchemasPage = () => {
  const [schemas, setSchemas] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [contractType, setContractType] = useState("");
  const [newContractType, setNewContractType] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [onNewType, setOnNewType] = useState(false);
  useEffect(() => {
    fetchContractTypes();
  }, []);

  useEffect(() => {
    if (contractType) fetchSchemas();
  }, [contractType]);

  const fetchContractTypes = async () => {
    try {
      const response = await axiosPrivate.get(`/schema/types`);
      const types = response.data.map((schema) => schema.contract_type);
      setContractTypes(types);
      setContractType(types[0] || "");
    } catch (err) {
      setError("Failed to fetch contract types. Please try again later.");
    }
  };

  const fetchSchemas = async () => {
    try {
      const response = await axiosPrivate.get(`/schema/types/${contractType}`);
      setSchemas(response.data);
    } catch (err) {
      setError("Failed to fetch schemas. Please try again later.");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedSchemas = [...schemas];
    updatedSchemas[index][field] = value;
    setSchemas(updatedSchemas);
  };

  const handleAddSchema = () => {
    const newSchema = {
      id: Date.now(),
      key_name: "",
      value_type: "number",
      required: false,
      comparedOn: "eq",
      reviewedInReceipt: false,
      keyAliases: [],
    };
    setSchemas([...schemas, newSchema]);
  };

  const handleStartNewType = () => {
    setSchemas([]);
    setContractType(newContractType);
    setNewContractType("");
    setOnNewType(true);
  };

  const handleSave = async () => {
    try {
      const response = await axiosPrivate.patch(
        `/schema/update/${contractType}`,
        schemas
      );
      setSuccess(response.data.message);
      setError(null);
      window.scrollTo(0, 0); // Scroll back to top of page on successful save
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to update schemas. Please try again."
      );
      setSuccess(null);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Update Schemas</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {!onNewType && (
        <Form.Group className="mb-3">
          <Form.Label>Select Contract Type</Form.Label>
          <Form.Select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}
      {onNewType && (
        <Form.Group className="mb-3">
          <Form.Label>New Contract Type</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter new contract type"
            value={newContractType}
            onChange={(e) => {
              setNewContractType(e.target.value);
            }}
          />
        </Form.Group>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Key Name</th>
            <th>Value Type</th>
            <th>Required</th>
            <th>Receipt Valid if _ Contract</th>
            <th>Reviewed In Receipt</th>
            <th>Aliases</th>
          </tr>
        </thead>
        <tbody>
          {schemas.map((schema, index) => (
            <tr key={schema.id}>
              <td>
                <Form.Control
                  type="text"
                  value={schema.key_name}
                  onChange={(e) =>
                    handleInputChange(index, "key_name", e.target.value)
                  }
                />
              </td>
              <td>
                <Form.Select
                  value={schema.value_type}
                  onChange={(e) =>
                    handleInputChange(index, "value_type", e.target.value)
                  }
                >
                  <option value="number">Number</option>
                  <option value="string">String</option>
                  <option value="date">Date</option>
                </Form.Select>
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={schema.required}
                  onChange={(e) =>
                    handleInputChange(index, "required", e.target.checked)
                  }
                />
              </td>
              <td>
                <Form.Select
                  value={schema.comparedOn}
                  onChange={(e) =>
                    handleInputChange(index, "comparedOn", e.target.value)
                  }
                >
                  <option value="eq">Equal</option>
                  <option value="lt">Less Than</option>
                  <option value="gt">Greater Than</option>
                  <option value="le">Less or Equal</option>
                  <option value="ge">Greater or Equal</option>
                  <option value="nc">No Comparison</option>
                </Form.Select>
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={schema.reviewedInReceipt}
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "reviewedInReceipt",
                      e.target.checked
                    )
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  placeholder="Comma-separated aliases"
                  value={
                    schema.keyAliases && schema.keyAliases != "null"
                      ? schema.keyAliases?.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "keyAliases",
                      e.target.value.split(",").map((alias) => alias.trim())
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={handleAddSchema} className="me-2 mb-5">
        Add New Schema Element
      </Button>
      {!onNewType && (
        <Button
          variant="secondary"
          onClick={handleStartNewType}
          className="me-2 mb-5"
        >
          Start New Type
        </Button>
      )}
      {onNewType && (
        <Button
          variant="secondary"
          onClick={() => {
            setOnNewType(false);
            fetchContractTypes();
            setContractType(contractType[0]);
            fetchSchemas();
          }}
          className="me-2 mb-5"
        >
          use Existing Types
        </Button>
      )}
      <Button variant="primary" onClick={handleSave} className="mb-5">
        Save Changes
      </Button>
    </div>
  );
};

export default UpdateSchemasPage;
