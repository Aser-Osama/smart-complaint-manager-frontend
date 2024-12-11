import { useEffect, useState } from "react";
import "./AuditReportPage.css"; // Add custom styles
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Col, Row } from "react-bootstrap";

const AuditReportPageByContract = () => {
  const [mismatchedCols, setMismatchedCols] = useState([]);
  const params = useParams();
  const AxiosPrivate = useAxiosPrivate();

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
          setMismatchedCols(response?.data);
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
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Audit Report for Contract ${params.id}`, 105, 20, {
      align: "center",
    });

    mismatchedCols.forEach((receipt, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(14);
      doc.text(`Invoice ID: ${receipt.receipt_id}`, 105, 27, {
        align: "center",
      });

      const inconsistencies = receipt.mismatches.filter(
        (col) => !col.total_overpay
      );
      const overcharges = receipt.mismatches.filter((col) => col.total_overpay);

      if (inconsistencies.length > 0) {
        // Invoice Inconsistencies Table
        doc.setFontSize(14);
        doc.text("Invoice Inconsistencies", 105, 35, { align: "center" });
        const inconsistencyRows = inconsistencies.map((col) => [
          formatColumnName(col.key),
          col.receipt_value || "N/A",
          col.contract_value || "N/A",
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
                  content: `- Element: ${row[0]}`,
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
      }

      if (overcharges.length > 0) {
        // Invoice Overcharges Table
        doc.text("Invoice Overcharges", 105, doc.lastAutoTable.finalY + 10, {
          align: "center",
        });
        const overchargeRows = overcharges.map((col) => [
          formatColumnName(col.key),
          col.receipt_value || "N/A",
          col.contract_value || "N/A",
          col.total_overpay?.toFixed(2) || "-",
          col.quantity || "-",
        ]);

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 15 || 40,
          head: [
            [
              "Charge Type",
              "Invoice Value",
              "Contract Value",
              "Overpay",
              "Quantity",
            ],
          ],
          body: overchargeRows,
          styles: { font: "helvetica", fontSize: 10 },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        });
      }

      const totalOverpayForReceipt = calculateTotalOverpayForReceipt(receipt);
      doc.setFontSize(12);
      doc.text(
        `Total Overpay for Invoice: $${totalOverpayForReceipt.toFixed(2)}`,
        105,
        doc.lastAutoTable.finalY + 10,
        { align: "center" }
      );
    });

    doc.setFontSize(14);
    doc.text(
      `Total Containers: ${countTotalContainers()} | Total Overpay for Contract: $${calculateTotalOverpayForContract().toFixed(
        2
      )}`,
      105,
      290,
      { align: "center" }
    );

    const filename = `Audit_Report_Contract_${params.id}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename);
  };

  return (
    <div className="audit-report">
      <h1 className="report-title">Audit Report for Contract {params.id}</h1>
      <Row>
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
