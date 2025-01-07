import { useEffect, useState } from "react";
import "./AuditReportPage.css"; // Add custom styles
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Col, Row } from "react-bootstrap";
import { arial, arial_bold } from "../../public/fonts.js"

const AuditReportPageByContract = () => {
  const [mismatchedCols, setMismatchedCols] = useState([]);
  const [contract, setContract] = useState({});
  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMismatch = async () => {
      try {
        const response = await AxiosPrivate.post(
          `/contract/getmismatchedcols`,
          {
            contract_id: params.id,
          }
        );
        if (response.status === 200) {
          setMismatchedCols(response?.data[0]);
          setContract(response?.data[1]);
        } else {
          console.error(response.error);
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

  const calculateTotalOverpayForReceipt = (receipt) => {
    return receipt.mismatches.reduce(
      (sum, col) => sum + (col.total_overpay || 0),
      0
    );
  };

  const calculateTotalOverpayForContract = () =>
    mismatchedCols.reduce(
      (acc, receipt) => acc + calculateTotalOverpayForReceipt(receipt),
      0
    );

  const countTotalContainers = () =>
    mismatchedCols.reduce(
      (acc, receipt) =>
        acc +
        receipt.mismatches.reduce(
          (sum, col) =>
            col.key === "number_of_containers"
              ? sum + parseInt(col.receipt_value, 10)
              : sum,
          0
        ),
      0
    );

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    doc.addFileToVFS("arial.ttf", arial);
    doc.addFont("arial.ttf", "arial", "normal");
    doc.addFileToVFS("arial-bold.ttf", arial_bold);
    doc.addFont("arial-bold.ttf", "arial", "bold");


    doc.setFont("arial");
    // Match the overall text color from func1
    doc.setTextColor(0, 0, 128);

    // --- Add Header (taken from func1) ---
    const addHeader = () => {
      doc.setFont("arial", "bold");
      doc.setFontSize(32);
      doc.text("provar", 105, 28, { align: "center" });

      doc.setFontSize(32);
      doc.text("Audit Results", 105, 40, { align: "center" });

      doc.setFont("arial", "normal");
      doc.setFontSize(12);
      doc.text("provar.io", 10, 10, { align: "left" });
      doc.text("fouroneone.io", 200, 10, { align: "right" });

      // You can tweak or remove these if your func2 doesn't have `params.id`
      doc.text(`Contract Number: ${params.id}`, 10, 57, { align: "left" });
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 10, 62, {
        align: "left",
      });

      doc.setLineWidth(0.4);
      doc.setDrawColor(0, 0, 128);
      doc.line(10, 70, 200, 70);
    };

    // --- Add Footer (taken from func1) ---
    const addFooter = (doc) => {
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 10;

      doc.setFont("arial", "normal");
      doc.setFontSize(10);

      // Footer Text 1 (Top Line)
      doc.text("Provar by FourOneOne, LLC", 105, pageHeight - marginBottom - 5, {
        align: "center",
      });

      // Footer Text 2 (Bottom Line)
      doc.text("provar.io | fouroneone.io", 105, pageHeight - marginBottom, {
        align: "center",
      });
    };

    // -- (The rest of func2’s helper functions, unchanged) --
    const safeString = (value) => {
      if (value === null || value === undefined) return "N/A";
      return String(value);
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

    // -- Draw the Header first --
    addHeader();

    // If you still want a separate "Audit Report" line, you can keep this,
    // but it will appear *under* the new header
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(24);
    // doc.text(`Audit Report`, 105, 80, { align: "center" });

    // Contract details section
    doc.setFont("arial", "bold");
    doc.setFontSize(16);
    doc.text(`Contract Details`, 20, 85);

    doc.setFontSize(12);
    doc.setFont("arial", "normal");
    const contractDetails = [
      { label: "Contract Number:", value: params.id },
      { label: "Contract Name:", value: contract.contract_name },
      { label: "Contract Type:", value: contract.contract_type },
      { label: "Company:", value: contract.company_name },
      { label: "Created By:", value: contract.user?.name || "Unknown" },
    ];

    let yPos = 95;
    contractDetails.forEach((detail) => {
      doc.setFont("arial", "bold");
      doc.text(detail.label, 25, yPos);
      doc.setFont("arial", "normal");
      doc.text(detail.value || "N/A", 80, yPos);
      yPos += 8;
    });

    // Report metadata section
    doc.setFontSize(16);
    doc.setFont("arial", "bold");
    doc.text(`Report Summary`, 20, yPos + 10);

    doc.setFontSize(12);
    doc.setFont("arial", "normal");
    const reportMetadata = [
      { label: "Generated On:", value: new Date().toLocaleString() },
      { label: "Total Containers:", value: countTotalContainers().toString() },
      {
        label: "Total Contract Overpay:",
        value: `$${calculateTotalOverpayForContract().toFixed(2)}`,
      },
    ];

    yPos += 20;
    reportMetadata.forEach((metadata) => {
      doc.setFont("arial", "bold");
      doc.text(metadata.label, 25, yPos);
      doc.setFont("arial", "normal");
      doc.text(metadata.value, 80, yPos);
      doc.setTextColor(0, 0, 128); // Reset to blue
      yPos += 8;
    });

    // Add first page footer
    addFooter(doc);

    // Next page for the mismatched columns
    doc.addPage();

    mismatchedCols.forEach((receipt, index) => {
      const invoiceNumber = receipt?.receipt_number;
      if (index > 0) {
        doc.addPage();
      }
      doc.lastAutoTable = undefined; // Reset the last table reference
      // Add a page-level header or sub-header if you want
      const headerText = `Invoice ID: ${safeString(receipt?.receipt_id)}`;

      doc.setFontSize(14);
      doc.setFont("arial", "bold");
      doc.text(headerText, 105, 27, {
        align: "center",
      });

      // Inconsistencies
      const inconsistencies =
        receipt?.mismatches?.filter((col) => col && !col.total_overpay) || [];
      const overcharges =
        receipt?.mismatches?.filter((col) => col && col.total_overpay) || [];

      if (inconsistencies.length > 0) {
        doc.setFontSize(14);
        doc.text("Invoice Inconsistencies", 105, 35, { align: "center" });

        const inconsistencyRows = inconsistencies.map((col) => [
          formatColumnName(col.key || ""),
          safeString(col.receipt_value),
          safeString(col.contract_value),
          notesColumn(col.key || ""),
        ]);

        doc.autoTable({
          ...tableOptions,
          startY: 40,
          styles: {
            ...tableOptions.styles,
            lineWidth: 0, // No borders
            cellPadding: { top: 0, left: 5, bottom: 2, right: 5 },
          },
          head: [],
          body: inconsistencyRows.flatMap((row) => {
            const sections = [];

            if (row[0]) {
              sections.push([
                {
                  content: `- ${row[0]}`,
                  colSpan: 4,
                  styles: { fontStyle: "bold", halign: "left" },
                },
              ]);
            }

            sections.push([
              {
                content: `- Contract Value: ${row[2]}, Invoice Value: ${row[1]}`,
                colSpan: 4,
                styles: { halign: "left" },
              },
            ]);

            if (row[3]) {
              sections.push([
                {
                  content: `- Notes: ${row[3]}`,
                  colSpan: 4,
                  styles: { halign: "left" },
                },
              ]);
            }

            return sections;
          }),
          didDrawPage: () => {
            addFooter(doc);
          },
        });
      }

      // Overcharges
      if (overcharges.length > 0) {
        const yPosition = doc.lastAutoTable
          ? doc.lastAutoTable.finalY + 10
          : 35;

        doc.setFont("arial", "bold");
        doc.setFontSize(14);
        doc.text("Invoice Overcharges", 105, yPosition, {
          align: "center",
        });

        const overchargeRows = overcharges.map((col) => [
          safeString(formatColumnName(col.key)),
          safeString(col.receipt_value),
          safeString(col.contract_value),
          safeString(col.overpay),
          safeString(col.quantity),
          safeString(col.total_overpay),
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
      }

      // Total overpay for invoice
      const totalOverpayForReceipt = calculateTotalOverpayForReceipt(receipt);
      const pageHeight = doc.internal.pageSize.height; // A4 height
      const marginBottom = 20; // Space above the footer

      const yPosition = doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 10
        : pageHeight - marginBottom;

      // Check if the "Total Overpay" text will overlap with the footer
      if (yPosition + 10 > pageHeight - marginBottom && doc.lastAutoTable) {
        doc.addPage(); // Add a new page if there's not enough space
        addFooter(doc); // Add footer to the new page
        doc.setFontSize(12);
        doc.setFont("arial", "bold");
        doc.text(
          `Total Overpay for Invoice  ${safeString(receipt?.receipt_id)}: $${totalOverpayForReceipt.toFixed(2)}`,
          105,
          20,
          { align: "center" }
        ); // Place the text at the top of the new page
      } else {
        doc.setFontSize(12);
        doc.setFont("arial", "bold");
        doc.text(
          `Total Overpay for Invoice ${safeString(receipt?.receipt_id)}: $${totalOverpayForReceipt.toFixed(2)}`,
          105,
          yPosition,
          { align: "center" }
        ); // Place the text below the table
      }


      addFooter(doc);
    });

    const filename = `Audit_Report_Contract_${params.id}_${new Date().toISOString().split("T")[0]
      }.pdf`;
    doc.save(filename);
  };


  return (
    <div className="audit-report">
      <h1 className="report-title">Audit Report for Contract {params.id}</h1>
      <Row>
        <Col>
          <Button onClick={() => navigate(-1)} className="back-button">
            Back to Contract {params.id}
          </Button>
        </Col>
        <Col className="ms-auto text-end">
          <Button onClick={generatePDF} className="download-button">
            Download Report
          </Button>
        </Col>
      </Row>

      <section className="section">
        {mismatchedCols.map((receipt) => (
          <div key={receipt.receipt_id} className="audit-section">
            <h2>Invoice ID: {receipt.receipt_id}</h2>
            <h3>Inconsistencies</h3>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Charge Type</th>
                  <th>Invoice Value</th>
                  <th>Contract Value</th>
                </tr>
              </thead>
              <tbody>
                {receipt.mismatches
                  .filter((col) => !col.total_overpay)
                  .map((col, index) => (
                    <tr key={index}>
                      <td>{formatColumnName(col.key)}</td>
                      <td>{col.receipt_value || "N/A"}</td>
                      <td>{col.contract_value || "N/A"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <h3>Overcharges</h3>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Charge Type</th>
                  <th>Invoice Value</th>
                  <th>Contract Value</th>
                  <th>Overpay</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {receipt.mismatches
                  .filter((col) => col.total_overpay)
                  .map((col, index) => (
                    <tr key={index}>
                      <td>{formatColumnName(col.key)}</td>
                      <td>{col.receipt_value || "N/A"}</td>
                      <td>{col.contract_value || "N/A"}</td>
                      <td>{col.total_overpay?.toFixed(2) || "-"}</td>
                      <td>{col.quantity || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <hr></hr>
          </div>
        ))}

        <div className="total-summary">
          <h2>Total Summary</h2>
          <p>Total Containers: {countTotalContainers()}</p>
          <p>
            Total Overpay for Contract: $
            {calculateTotalOverpayForContract().toFixed(2)}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AuditReportPageByContract;
