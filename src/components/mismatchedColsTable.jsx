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

  const financialMismatches = mismatchedCols.filter(
    (col) => col.overpay !== undefined && col.key !== "shipper_bco_name"
  );

  const nonFinancialMismatches = mismatchedCols.filter(
    (col) => col.overpay === undefined && col.key !== "shipper_bco_name"
  );

  return (
    <div>
      {financialMismatches.length > 0 && (
        <>
          <h4>Financial Mismatches</h4>
          <Table bordered striped hover className="mb-4">
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
              {financialMismatches.map((col, index) => (
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
        </>
      )}

      {nonFinancialMismatches.length > 0 && (
        <>
          <h4>Other Mismatches</h4>
          <Table bordered striped hover>
            <thead>
              <tr>
                <th>Field</th>
                <th>Invoice Value</th>
                <th>Contract Value</th>
              </tr>
            </thead>
            <tbody>
              {nonFinancialMismatches.map((col, index) => (
                <tr key={index}>
                  <td>{formatColumnName(col.key)}</td>
                  <td>{col.receipt_value ?? "N/A"}</td>
                  <td>{col.contract_value ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default MismatchedColumnsTable;
