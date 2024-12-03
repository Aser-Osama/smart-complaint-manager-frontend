import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import {
  Container,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Alert,
} from "react-bootstrap";

const CreateSchema = () => {
  const [objects, setObjects] = useState([]);
  const [contractType, setContractType] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleAddElement = () => {
    setObjects([
      ...objects,
      {
        key_name: "",
        value_type: "",
        required: false,
        comparedOn: "eq",
        reviewedInReceipt: true,
        keyAliases: [],
        keyAliasesInput: "", // Add this line
      },
    ]);
  };

  const handleContractTypeChange = (value) => {
    setContractType(value);
  };

  const handleChange = (index, field, value) => {
    const updatedObjects = [...objects];
    updatedObjects[index][field] = value;
    setObjects(updatedObjects);
  };

  const handleRemoveElement = (index) => {
    setObjects(objects.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    if (!contractType || objects.length === 0) return false;
    for (let obj of objects) {
      if (!obj.key_name || !obj.value_type) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Assign contractType to each object and parse keyAliasesInput
      const updatedObjects = objects.map((obj) => ({
        ...obj,
        contract_type: contractType,
        keyAliases: obj.keyAliasesInput
          .split(",")
          .map((alias) => alias.trim())
          .filter((alias) => alias !== ""),
      }));
      setObjects(updatedObjects);

      const response = await axiosPrivate.post(
        "/schema/create",
        updatedObjects
      );
      console.log(updatedObjects);
      setSuccess("Schema created successfully");
      setError("");
    } catch (error) {
      console.error("Error creating schema:", error);
      setError(
        "Error creating user: " +
          (error?.response?.data?.error ?? "Unknown error has occurred") +
          "."
      );
      setSuccess("");
    }
  };

  return (
    <Container className="mt-5">
      <h1>Create Schema Array</h1>
      <div style={{ position: "sticky", top: "10px", zIndex: 1000 }}>
        <Button
          onClick={handleAddElement}
          variant="primary"
          className="mb-4 w-100"
        >
          Add New Element
        </Button>
      </div>

      {/* Contract Type Field */}
      <Form.Group className="mb-3" controlId="contract_type">
        <Form.Label>Contract Type</Form.Label>
        <InputGroup>
          <Form.Select
            value={contractType}
            onChange={(e) => handleContractTypeChange(e.target.value)}
            isInvalid={!contractType}
          >
            <option value="">Select</option>
            <option value="freight">Freight</option>
            <option value="truck">Truck</option>
          </Form.Select>
          <Form.Control
            type="text"
            placeholder="Or enter custom type"
            value={contractType}
            onChange={(e) => handleContractTypeChange(e.target.value)}
            isInvalid={!contractType}
          />
          <Form.Control.Feedback type="invalid">
            Contract Type is required.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {objects.map((obj, index) => (
        <div key={index} className="border p-3 mb-3">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId={`key_name_${index}`}>
                <Form.Label>Key Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter key name"
                  value={obj.key_name}
                  onChange={(e) =>
                    handleChange(index, "key_name", e.target.value)
                  }
                  isInvalid={!obj.key_name}
                />
                <Form.Control.Feedback type="invalid">
                  Key Name is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId={`value_type_${index}`}>
                <Form.Label>Value Type</Form.Label>
                <Form.Select
                  value={obj.value_type}
                  onChange={(e) =>
                    handleChange(index, "value_type", e.target.value)
                  }
                  isInvalid={!obj.value_type}
                >
                  <option value="">Select</option>
                  <option value="number">Number</option>
                  <option value="string">String</option>
                  <option value="date">Date</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Value Type is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {/* Rest of your form fields */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId={`required_${index}`}>
                <Form.Label>Required</Form.Label>
                <Form.Check
                  type="switch"
                  id={`required_switch_${index}`}
                  checked={obj.required}
                  onChange={(e) =>
                    handleChange(index, "required", e.target.checked)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId={`comparedOn_${index}`}>
                <Form.Label>Valid only if</Form.Label>
                <Form.Select
                  value={obj.comparedOn}
                  onChange={(e) =>
                    handleChange(index, "comparedOn", e.target.value)
                  }
                >
                  <option value="eq">Equal</option>
                  <option value="ge">Greater or Equal</option>
                  <option value="le">Less or Equal</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                  <option value="nc">Not Comparable</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId={`reviewedInReceipt_${index}`}
              >
                <Form.Label>Reviewed In Receipt</Form.Label>
                <Form.Check
                  type="switch"
                  id={`reviewedInReceipt_switch_${index}`}
                  checked={obj.reviewedInReceipt}
                  onChange={(e) =>
                    handleChange(index, "reviewedInReceipt", e.target.checked)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`keyAliases_${index}`}>
                <Form.Label>Key Aliases</Form.Label>
                <Form.Control
                  type="text"
                  placeholder='Enter aliases separated by commas (e.g., "alias1, alias2")'
                  value={obj.keyAliasesInput}
                  onChange={(e) =>
                    handleChange(index, "keyAliasesInput", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => handleRemoveElement(index)}
          >
            Remove Element
          </Button>
        </div>
      ))}
      <Button
        variant="primary"
        type="submit"
        onClick={handleSubmit}
        disabled={!isFormValid()}
      >
        Submit
      </Button>
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}

      {error && error.trim() && !success && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default CreateSchema;
