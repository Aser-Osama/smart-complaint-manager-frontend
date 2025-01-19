import React, { useState } from "react";
import { Form, Button, Alert, Container, Col, Row, Modal } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axios from "../../api/axios";
const CreateAppUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyEmailAddress: "",
    companyName: "",
    companyWebsiteURL: "",
    businessPhone: "",
    businessAddress: "",
    positionInCompany: "",
    typeOfBusiness: "",
    fmcLicenseNumber: "",
    mcNumber: "",
    dotNumber: "",
    subscriptionType: "",
    userToken: "",
  });
  const [showTOS, setShowTOS] = useState(false);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState("");

  // Controls whether the user can check the TOS checkbox (i.e., if they've scrolled).
  const [canAgreeToTOS, setCanAgreeToTOS] = useState(false);
  const [agreeToTOS, setAgreeToTOS] = useState(false);

  const axiosPrivate = axios.create();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTOS) {
      setErrors("You must agree to the Terms of Service before submitting.");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "companyEmailAddress",
      "companyName",
      "businessPhone",
      "businessAddress",
      "positionInCompany",
      "typeOfBusiness",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field]?.trim()
    );

    if (missingFields.length > 0) {
      setErrors(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const response = await axiosPrivate.post("/appusers", {
        username:
          formData.firstName.toLowerCase() + "." + formData.lastName.toLowerCase(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_email_address: formData.companyEmailAddress,
        company_name: formData.companyName,
        business_phone: formData.businessPhone,
        business_address: formData.businessAddress,
        position_in_company: formData.positionInCompany,
        type_of_business: formData.typeOfBusiness,
        OceanFreightForwarder_FMC_Number: formData.fmcLicenseNumber || null,
        Trucker_MC_Number: formData.mcNumber || null,
        Trucker_DOT_Number: formData.dotNumber || null,
        SubscriptionType: formData.subscriptionType,
        usertoken: formData.userToken,
      });
      console.log("User created:", response);
      setSuccess("User created successfully");
      setErrors(null);
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(
        "Error creating user: " +
        (error?.response?.data?.error ?? "Unknown error has occurred") +
        "."
      );
      setSuccess("");
    }
  };

  // Handle scroll in the TOS container
  const handleTOSScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If the user has scrolled to (or near) the bottom, allow them to agree
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setCanAgreeToTOS(true);
    }
  };

  return (
    <Container>
      <h1 className="mt-5 mb-3">Create Desktop App User</h1>
      <Button variant="info" onClick={() => setShowTOS(true)} className="mb-3">
        View Terms of Service
      </Button>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Group controlId="firstName">
              <Form.Label className="mb-0 mt-3">First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="lastName">
              <Form.Label className="mb-0 mt-3">Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group controlId="companyEmailAddress">
          <Form.Label className="mb-0 mt-3">Company Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter company email"
            name="companyEmailAddress"
            value={formData.companyEmailAddress}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="companyName">
          <Form.Label className="mb-0 mt-3">Company Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="companyWebsiteURL">
          <Form.Label className="mb-0 mt-3">Company Website URL</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company website URL"
            name="companyWebsiteURL"
            value={formData.companyWebsiteURL}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="businessPhone">
          <Form.Label className="mb-0 mt-3">Business Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter business phone number"
            name="businessPhone"
            value={formData.businessPhone}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="businessAddress">
          <Form.Label className="mb-0 mt-3">Business Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter business address"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="positionInCompany">
          <Form.Label className="mb-0 mt-3">Your Position in the Company</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter position in company"
            name="positionInCompany"
            value={formData.positionInCompany}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="typeOfBusiness">
          <Form.Label className="mb-0 mt-3">Type of Business</Form.Label>
          <Form.Control
            as="select"
            name="typeOfBusiness"
            value={formData.typeOfBusiness}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="OceanFreightForwarder_NVOCC">OceanFreightForwarder/NVOCC</option>
            <option value="Trucker">Trucker</option>
            <option value="BCO">BCO</option>
          </Form.Control>
        </Form.Group>
        {formData.typeOfBusiness === "OceanFreightForwarder_NVOCC" && (
          <Form.Group controlId="fmcLicenseNumber">
            <Form.Label className="mb-0 mt-3">FMC License Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter FMC License Number"
              name="fmcLicenseNumber"
              value={formData.fmcLicenseNumber}
              onChange={handleChange}
            />
          </Form.Group>
        )}
        {formData.typeOfBusiness === "Trucker" && (
          <>
            <Form.Group controlId="mcNumber">
              <Form.Label className="mb-0 mt-3">MC Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter MC Number"
                name="mcNumber"
                value={formData.mcNumber}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="dotNumber">
              <Form.Label className="mb-0 mt-3">DOT Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter DOT Number"
                name="dotNumber"
                value={formData.dotNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
        <Form.Group controlId="subscriptionType">
          <Form.Label className="mb-0 mt-3">I Want</Form.Label>
          <Form.Control
            as="select"
            name="subscriptionType"
            value={formData.subscriptionType}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Audit">An Audit Subscription</option>
            <option value="Screenshots">A Screenshot Subscription</option>
            <option value="Both">Both</option>
            <option value="Single Audit">Single Audit</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="userToken">
          <Form.Label className="mb-0 mt-3">Password</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Enter password"
                name="userToken"
                value={formData.userToken}
                onChange={handleChange}
              />
            </Col>
            <Col md="auto">
              <Button
                variant="secondary"
                onClick={() => setFormData((prev) => ({ ...prev, userToken: uuidv4() }))}
              >
                Generate Token
              </Button>
            </Col>
          </Row>
        </Form.Group>

        {/* Disable the TOS checkbox until the user has scrolled to the bottom */}
        <Form.Group controlId="agreeToTOS" className="mt-3">
          <Form.Check
            type="checkbox"
            label={`I have read and agree to the Terms of Service` + (canAgreeToTOS ? "" : " (scroll to the bottom of the TOS to enable)")}
            checked={agreeToTOS}
            disabled={!canAgreeToTOS}
            onChange={(e) => setAgreeToTOS(e.target.checked)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create User
        </Button>

        {success && (
          <Alert variant="success" className="mt-3">
            {success}
          </Alert>
        )}
        {errors && errors.trim() && !success && (
          <Alert variant="danger" className="mt-3">
            {errors}
          </Alert>
        )}
      </Form>

      {/* Modal that shows TOS PDF in a scrollable container */}
      <Modal show={showTOS} onHide={() => setShowTOS(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Terms of Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              height: "800px",
              overflowY: "scroll",
              border: "1px solid #ccc",
            }}
            onScroll={handleTOSScroll}
          >
            <object
              data={`provar%20TOS%20and%20EULA.pdf#page=1&view=FitH&zoom=100&scrollbar=1&toolbar=1&navpanes=1`}
              type="application/pdf"
              width="100%"
              height="800px"

            >
              <p>
                Your browser does not support PDFs. Please download the PDF to
                view it:
                <a
                  href="provar%20TOS%20and%20EULA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </p>
            </object>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTOS(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateAppUser;
