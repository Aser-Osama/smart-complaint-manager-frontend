import { useState } from "react";
import { NavLink } from "react-router-dom";
import Table from "react-bootstrap/Table";
import FormControl from "react-bootstrap/FormControl";

function ContractsTable({ contracts }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);

  const sortedContracts = [...contracts].sort((a, b) => {
    if (sortConfig) {
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredContracts = sortedContracts.filter(
    (contract) =>
      contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toString().includes(searchTerm)
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
        placeholder="Search by contract type or id"
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
              onClick={() => requestSort("contract_type")}
              className="sortable-column"
            >
              Contract Type{" "}
              <span style={{ float: "right" }}>
                {getSortIcon("contract_type")}
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
          {filteredContracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.id}</td>
              <td>{contract.contract_type}</td>
              <td>{contract.uploader}</td>
              <td>{new Date(contract.upload_date).toLocaleDateString()}</td>
              <td>
                <NavLink
                  to={`/contract/${contract.id}`}
                  className="text-decoration-none"
                >
                  View Contract Details
                </NavLink>
              </td>
              <td>
                <NavLink
                  to={`/contract/download/${contract.id}`}
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

export default ContractsTable;
