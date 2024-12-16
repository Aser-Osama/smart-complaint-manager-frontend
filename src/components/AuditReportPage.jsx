import { useEffect, useState } from "react";
import "./AuditReportPage.css"; // Add custom styles
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Col, Row } from "react-bootstrap";

const AuditReportPage = () => {
  const [mismatchedCols, setMismatchedCols] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMismatch = async () => {
      try {
        const response = await AxiosPrivate.post(`/receipt/getmismatchedcols`, {
          receipt_id: params.id,
        });
        if (response.status === 200) {
          setMismatchedCols(response?.data[0]);
          setInvoiceNumber(response?.data[1].value);
        } else {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMismatch();
  }, [params.id]);

  const formatColumnName = (key) => {
    // Handle null, undefined, or non-string input
    if (!key || typeof key !== "string") {
      return "";
    }

    // Trim whitespace and handle empty string
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      return "";
    }

    return trimmedKey
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  const notesColumn = (key) => {
    if (key === "expiration_date") {
      return "Invoice date should be less than Contract Expiration Date, it is currently after";
    } else if (key === "effective_date") {
      return "Invoice (Effective) date should be greater than Contract Effective Date it is currently before";
    } else if (key === "payment_due_date") {
      return "Payment terms are too short";
    }
    return "";
  };

  const filteredWithQuantity = mismatchedCols.filter(
    (col) => col.quantity && col.key !== "number_of_containers"
  );
  const filteredWithoutQuantity = mismatchedCols.filter(
    (col) => !col.quantity && col.key !== "number_of_containers"
  );

  const calculateTotalOverpay = () =>
    filteredWithQuantity.reduce(
      (acc, col) => acc + (col.total_overpay || 0),
      0
    );

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Audit Report for invoice ${params.id}`, 105, 20, {
      align: "center",
    });
    doc.setFontSize(16);
    doc.text(`Invoice Number: ${invoiceNumber}`, 105, 25, { align: "center" });

    // Table Styles (No Colors)
    const tableOptions = {
      margin: { top: 30 },
      theme: "plain", // No grid or color themes
      styles: {
        font: "helvetica",
        fontSize: 10,
        lineWidth: 0.1,
        textColor: [0, 0, 0], // Black text
        overflow: "linebreak",
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 255, 255], // White background for the header
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        fontSize: 11,
        halign: "center",
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Black text
        halign: "center",
        valign: "middle",
      },
    };

    // Invoice Inconsistencies Table
    doc.setFontSize(14);
    doc.text("Invoice Inconsistencies", 105, 35, { align: "center" });

    const inconsistencyRows = filteredWithoutQuantity.map((col) => [
      formatColumnName(col.key),
      col.receipt_value,
      col.contract_value,
      notesColumn(col.key),
    ]);

    doc.autoTable({
      ...tableOptions,
      startY: 40,
      styles: {
        lineWidth: 0, // No borders
        cellPadding: { top: 0, left: 5, bottom: 2, right: 5 },
        font: "helvetica",
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      head: [],
      body: inconsistencyRows.flatMap((row) =>
        [
          [
            {
              content: `-${row[0]}`,
              colSpan: 4,
              styles: { fontStyle: "bold", halign: "left" },
            },
          ],
          [
            {
              content: `- Contract Value: ${row[2]}, Invoice Value: ${row[1]}`,
              colSpan: 4,
              styles: { halign: "left" },
            },
          ],
          row[3]
            ? [
                {
                  content: `- Notes: ${row[3]}`,
                  colSpan: 4,
                  styles: { halign: "left" },
                },
              ]
            : null,
        ].filter(Boolean)
      ),
    });

    // Invoice Overcharges Table
    doc.text("Invoice Overcharges", 105, doc.lastAutoTable.finalY + 10, {
      align: "center",
    });

    const overchargeRows = filteredWithQuantity.map((col) => [
      formatColumnName(col.key),
      col.receipt_value,
      col.contract_value,
      col.overpay,
      col.quantity,
      col.total_overpay,
    ]);

    doc.autoTable({
      ...tableOptions,
      startY: doc.lastAutoTable.finalY + 15,
      head: [
        [
          "Charge Type",
          "Invoice Rate",
          "Contract Rate",
          "Overcharge",
          "Quantity",
          "Total Overcharge",
        ],
      ],
      body: overchargeRows,
    });

    // Total Overpaid Summary
    doc.setFontSize(14);
    doc.text(
      `Total Overpaid: $${calculateTotalOverpay().toFixed(2)}`,
      105,
      doc.lastAutoTable.finalY + 15,
      { align: "center" }
    );

    // Save with a Proper Filename
    const filename = `Audit_Report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);
  };
  return (
    <div className="audit-report">
      <h1 className="report-title">Audit Report for receipt {params.id}</h1>
      <Row>
        <Col>
          <Button onClick={() => navigate(-1)} className="back-button">
            Back to Receipt {params.id}
          </Button>
        </Col>
        <Col className="ms-auto text-end">
          <Button onClick={generatePDF} className="download-button">
            Download Report
          </Button>
        </Col>
      </Row>

      <section className="section">
        <h2>Invoice Inconsistencies</h2>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Charge Type</th>
              <th>Invoice Value</th>
              <th>Contract Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithoutQuantity.map((col, index) => (
              <tr key={index}>
                <td>{formatColumnName(col.key)}</td>
                <td>{col.receipt_value}</td>
                <td>{col.contract_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Invoice Overcharges</h2>
        {filteredWithQuantity.map((col, index) => (
          <div key={index} className="audit-item">
            <h3>{formatColumnName(col.key)}</h3>
            <p>
              <strong>Invoice Value:</strong> {col.receipt_value}
            </p>
            <p>
              <strong>Contract Value:</strong> {col.contract_value}
            </p>
            <p>
              <strong>Overpay:</strong>{" "}
              <span
                style={{
                  color: col.overpay > 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {col.overpay}
              </span>
            </p>
            <p>
              <strong>Quantity:</strong> {col.quantity}
            </p>
            <p>
              <strong>Total Overpay:</strong>{" "}
              <span
                style={{
                  color: col.total_overpay > 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {col.total_overpay}
              </span>
            </p>
          </div>
        ))}

        <div className="total-overpaid">
          <h2>Total Overpaid:</h2>
          <p className="total-amount">${calculateTotalOverpay().toFixed(2)}</p>
        </div>
      </section>
    </div>
  );
};

export default AuditReportPage;
