import React from "react";
import Table from "react-bootstrap/Table";

const MismatchedColumnsTable = ({ mismatchedCols }) => {
  const formatColumnName = (key) => {
    if (key === "expiration_date") {
      return "Invoice (Effective) date should be less than Contract Expiration Date";
    } else if (key === "effective_date") {
      return "Invoice (Effective) date should be greater than Contract Effective Date";
    } else {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  const getStyledValue = (value, positiveColor, negativeColor) => {
    if (value === null || value === undefined) {
      return <span style={{ color: "black" }}>N/A</span>;
    }
    return (
      <span
        style={{
          color: value > 0 ? positiveColor : negativeColor,
          fontWeight: "bold",
        }}
      >
        {value}
      </span>
    );
  };

  return (
    <Table bordered striped hover>
      <thead>
        <tr>
          <th>Charge Type</th>
          <th>Invoice Value</th>
          <th>Contract Value</th>
          <th>Overpay</th>
          <th>Quantity</th>
          <th>Total Overpay</th>
        </tr>
      </thead>
      <tbody>
        {mismatchedCols.map((col, index) => (
          <tr key={index}>
            <td>{formatColumnName(col.key)}</td>
            <td>{col.receipt_value ?? "N/A"}</td>
            <td>{col.contract_value ?? "N/A"}</td>
            <td>{getStyledValue(col.overpay, "red", "green")}</td>
            <td>{col.quantity ?? "N/A"}</td>
            <td>{getStyledValue(col.total_overpay, "red", "green")}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default MismatchedColumnsTable;
