import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handlePageSizeChange = (event) => {
    onPageSizeChange(Number(event.target.value));
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Row className="align-items-center mt-0 pt-0">
      {/* Page Size Selection */}
      <Col xs={12} md={4} className="">
        <Form.Group controlId="pageSize" className="d-flex align-items-center">
          <Form.Label className="me-2 mb-0">Page Size:</Form.Label>
          <Form.Select
            className="w-25"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Custom Pagination */}
      <Col
        xs={12}
        md={4}
        className="d-flex justify-content-center align-items-center"
      >
        <Button
          variant="outline-primary"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="d-flex align-items-center justify-content-center me-3"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
        >
          <FaChevronLeft />
        </Button>
        <span className="text-center mx-3">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          variant="outline-primary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="d-flex align-items-center justify-content-center ms-3"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
        >
          <FaChevronRight />
        </Button>
      </Col>

      {/* Items Info */}
      <Col xs={12} md={4} className="text-md-end text-center">
        <div>
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      </Col>
    </Row>
  );
};

export default Pagination;
