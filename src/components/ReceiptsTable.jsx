import { useState } from "react";
import { NavLink } from "react-router-dom";
import Table from "react-bootstrap/Table";
import FormControl from "react-bootstrap/FormControl";

function ReceiptTable({ receipts }) {
  if (!receipts.length) return <p>No receipts found...</p>;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);

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
      <FormControl
        type="text"
        placeholder="Search by receipt ID"
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
            <th>Details</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>{receipt.id}</td>
              <td>{receipt.contract_id}</td>
              <td>{receipt.uploader}</td>
              <td>{new Date(receipt.upload_date).toLocaleDateString()}</td>
              <td>
                <NavLink
                  to={`/receipt/${receipt.id}`}
                  className="text-decoration-none"
                >
                  View Receipt Details
                </NavLink>
              </td>
              <td>
                <NavLink
                  to={`/api/receipt/download/${receipt.id}`}
                  className="text-decoration-none"
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
