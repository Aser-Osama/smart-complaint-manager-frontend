import { useState } from "react";
import { NavLink } from "react-router-dom";
import Table from "react-bootstrap/Table";
import FormControl from "react-bootstrap/FormControl";
import { Button, Modal } from "react-bootstrap";

function ReceiptTable({ receipts, pageNum, pageSize }) {
  if (!receipts.length) return <p>No invoices found...</p>;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [showMismatch, setShowMismatch] = useState(false);
  const [mismatchedColumns, setMismatchedColumns] = useState([]);

  const handleShowMismatch = (data) => {
    setShowMismatch(true);
    setMismatchedColumns(data);
  };
  const sortedReceipts = [...receipts].sort((a, b) => {
    if (sortConfig) {
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredReceipts = sortedReceipts.filter(
    (receipt) =>
      receipt.contract_id.toString().includes(searchTerm) ||
      receipt.id.toString().includes(searchTerm)
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  return (
    <div>
      <Modal show={showMismatch} onHide={() => setShowMismatch(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Mismatched Columns for invoice {mismatchedColumns.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{mismatchedColumns.data}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMismatch(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <FormControl
        type="text"
        placeholder="Search by invoice ID"
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table responsive>
        <thead>
          <tr>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => requestSort("id")}
              className="sortable-column"
            >
              # <span style={{ float: "right" }}>{getSortIcon("id")}</span>
            </th>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => requestSort("contract_id")}
              className="sortable-column"
            >
              Contract ID{" "}
              <span style={{ float: "right" }}>
                {getSortIcon("contract_id")}
              </span>
            </th>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => requestSort("uploader")}
              className="sortable-column"
            >
              Uploader{" "}
              <span style={{ float: "right" }}>{getSortIcon("uploader")}</span>
            </th>
            <th
              style={{ cursor: "pointer" }}
              onClick={() => requestSort("upload_date")}
              className="sortable-column"
            >
              Upload Date{" "}
              <span style={{ float: "right" }}>
                {getSortIcon("upload_date")}
              </span>
            </th>
            <th>Has Mismatch</th>
            <th>Details</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map((receipt, index) => (
            <tr
              key={index}
              style={{
                backgroundColor:
                  receipt?.mismatched_columns?.col?.length > 0
                    ? "#f8d7da"
                    : "#ffffff", // Ensure valid hex color for fallback
              }}
            >
              <td>{receipt.id}</td>
              <td>{receipt.contract_id}</td>
              <td>{receipt.user.name}</td>
              <td>{new Date(receipt.upload_date).toLocaleDateString()}</td>
              <td>
                {receipt.has_mismatch && (
                  <>
                    <a
                      href="#"
                      onClick={() =>
                        handleShowMismatch({
                          id: receipt.id,
                          data: receipt?.mismatched_columns?.col?.join(", "),
                        })
                      }
                    >
                      View Mismatch
                    </a>
                  </>
                )}
              </td>
              <td>
                <NavLink
                  to={`/receipt/${receipt.id}`}
                  className="text-decoration-none"
                >
                  View Invoice Details
                </NavLink>
              </td>
              <td>
                <NavLink
                  to={`/receipt/download/${receipt.id}`}
                  className="text-decoration-none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <style>
        {`
          .sortable-column {
            transition: background-color 0.2s;
          }
          .sortable-column:hover {
            background-color: #f1f1f1;
          }
          .text-decoration-none {
            color: #007bff;
            text-decoration: none;
          }
          .text-decoration-none:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
}

export default ReceiptTable;
