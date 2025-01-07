import { useEffect, useState } from "react";
import "./AuditReportPage.css"; // Add custom styles
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Col, Row } from "react-bootstrap";
import { arial, arial_bold } from "../../public/fonts.js"
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
    doc.setTextColor(0, 0, 128); // Blue color

    doc.addFileToVFS("arial.ttf", arial);
    doc.addFont("arial.ttf", "arial", "normal");
    doc.addFileToVFS("arial-bold.ttf", arial_bold);
    doc.addFont("arial-bold.ttf", "arial", "bold");

    // Add Header
    const addHeader = () => {
      doc.setFont("arial", "bold");
      doc.setFontSize(32);
      doc.text("provar", 105, 28, { align: "center" });
      doc.setFontSize(32);
      doc.text("Invoice Audit Results", 105, 40, { align: "center" });


      doc.setFont("arial", "normal");
      doc.setFontSize(12);
      doc.text("provar.io", 10, 10, { align: "left" });
      doc.text("fouroneone.io", 200, 10, { align: "right" });

      doc.text(`Invoice Number: ${params.id}`, 10, 57, { align: "left" });
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 10, 62, { align: "left" })
      doc.setLineWidth(0.4);
      doc.setDrawColor(0, 0, 128);
      doc.line(10, 70, 200, 70);

    };

    // Footer Function
    const addFooter = (doc) => {
      const pageHeight = doc.internal.pageSize.height; // A4 height
      const marginBottom = 10;

      // Footer Text 1 (Top Line)
      doc.setFontSize(10);
      doc.text("Provar by FourOneOne, LLC", 105, pageHeight - marginBottom - 5, { align: "center" });

      // Footer Text 2 (Bottom Line)
      doc.setFontSize(10);
      doc.text("provar.io | fouroneone.io", 105, pageHeight - marginBottom, { align: "center" });
    };

    // Total Overpaid Summary
    const addTotalOverpaidSummary = (doc, totalText) => {
      const pageHeight = doc.internal.pageSize.height; // A4 height
      const marginBottom = 20; // Margin to ensure space above the footer
      const summaryPositionY = doc.lastAutoTable.finalY + 15;

      // Check if the summary text overlaps with the footer
      if (summaryPositionY + 10 > pageHeight - marginBottom) {
        doc.addPage(); // Add a new page if there's not enough space
        doc.setFontSize(14);
        doc.text(totalText, 105, 20, { align: "center" }); // Position it at the top of the new page
        addFooter(doc); // Add footer to the new page
      } else {
        doc.setFontSize(14);
        doc.text(totalText, 105, summaryPositionY, { align: "center" }); // Position it below the table
      }
    };

    // Draw Header and Footer
    addHeader();

    // Title
    doc.setFont("arial", "bold");

    doc.setFontSize(16);

    // Table Styles (now with the same text color approach from func1)
    const tableOptions = {
      margin: { top: 30 },
      theme: "plain", // No grid or color themes
      styles: {
        font: "arial",           // changed to match func1
        fontSize: 10,
        lineWidth: 0.1,
        textColor: [0, 0, 128],         // blue text
        overflow: "linebreak",
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 255, 255],     // White background
        textColor: [0, 0, 128],         // blue text
        fontStyle: "bold",
        fontSize: 11,
        halign: "center",
      },
      bodyStyles: {
        textColor: [0, 0, 128],         // blue text
        halign: "center",
        valign: "middle",
      },
    };

    // Invoice Inconsistencies Table
    doc.setFontSize(14);
    doc.text("Invoice Inconsistencies", 105, 80, { align: "center" });

    const inconsistencyRows = filteredWithoutQuantity.map((col) => [
      formatColumnName(col.key),
      col.receipt_value,
      col.contract_value,
      notesColumn(col.key),
    ]);

    doc.autoTable({
      ...tableOptions,
      startY: 85,
      styles: {
        lineWidth: 0, // No borders
        cellPadding: { top: 0, left: 5, bottom: 2, right: 5 },
        font: "arial",
        fontSize: 10,
        textColor: [0, 0, 128],
      },
      didDrawPage: () => {
        // Add footer after each page is drawn
        addFooter(doc);
      },
      head: [],
      body: inconsistencyRows.flatMap((row) =>
        [
          [
            {
              content: `-${row[0]}`,
              colSpan: 4,
              styles: { fontStyle: "bold", halign: "left", textColor: [0, 0, 128] },
            },
          ],
          [
            {
              content: `- Contract Value: ${row[2]}, Invoice Value: ${row[1]}`,
              colSpan: 4,
              styles: { halign: "left", textColor: [0, 0, 128] },
            },
          ],
          row[3]
            ? [
              {
                content: `- Notes: ${row[3]}`,
                colSpan: 4,
                styles: { halign: "left", textColor: [0, 0, 128] },
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
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 40,
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
      styles: {
        font: "arial",
        fontSize: 10,
        textColor: [0, 0, 128],
      },
      headStyles: {
        fillColor: [230, 230, 250],
        textColor: [0, 0, 128],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [0, 0, 128],
        halign: "center",
        valign: "middle",
      },
      didDrawPage: () => {
        addFooter(doc);
      },
    });



    addTotalOverpaidSummary(
      doc,
      `Total Overpaid: $${calculateTotalOverpay().toFixed(2)}`
    );

    // Save with a Proper Filename
    const filename = `Audit_Report_${new Date().toISOString().split("T")[0]
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
