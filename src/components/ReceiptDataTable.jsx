import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { FaEdit, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";

function EditableReceiptTable({ receipt, schema, isEditing, onEdit, onSave }) {
  const initializeEditableData = (receipt) => ({
    id: receipt.id,
    data: Array.isArray(receipt.data)
      ? receipt.data.reduce((acc, field) => {
          acc[field.key] = {
            value: field.value || "",
            quantity: field.quantity || "",
            currency: field.currency || "",
            total_price: field.total_price || "",
            value_type: field.value_type || "",
          };
          return acc;
        }, {})
      : {},
  });

  const [editableData, setEditableData] = useState(
    initializeEditableData(receipt)
  );
  const [hideMinusOnes, setHideMinusOnes] = useState(false);

  useEffect(() => {
    setEditableData(initializeEditableData(receipt));
    console.log("receipt updated:", receipt);
  }, [receipt]);

  useEffect(() => {
    setEditableData((prevData) => {
      const updatedData = { ...prevData.data };
      schema.forEach((col) => {
        if (!(col.key in updatedData)) {
          updatedData[col.key] = {
            value: "",
            quantity: "",
            currency: "",
            total_price: "",
            value_type: "text",
          };
        }
      });
      return { ...prevData, data: updatedData };
    });
  }, [schema]);

  const handleChange = (key, fieldName, newValue) => {
    setEditableData((prevData) => ({
      ...prevData,
      data: {
        ...prevData.data,
        [key]: {
          ...prevData.data[key],
          [fieldName]: newValue,
        },
      },
    }));
  };

  const handleSaveClick = () => {
    const cleanedData = {
      ...editableData,
      data: Object.fromEntries(
        Object.entries(editableData.data).map(([key, fields]) => [
          key,
          {
            ...fields,
            value: fields.value || null,
            quantity: fields.quantity || null,
            currency: fields.currency || null,
            total_price: fields.total_price || null,
            value_type: fields.value_type || "",
          },
        ])
      ),
    };
    onSave(cleanedData);
  };

  const getCellStyle = (value) => ({
    backgroundColor: value ? "transparent" : "#f0f0f0",
  });

  const groupedSchema = [...schema].reduce(
    (acc, col) => {
      const valueType =
        col.key === "payment_due_date"
          ? "date"
          : editableData.data[col.key]?.value_type || "string";
      acc[valueType] = acc[valueType] || [];
      acc[valueType].push(col);
      return acc;
    },
    { string: [], date: [], number: [] }
  );

  const sortedSchema = [
    ...groupedSchema.string,
    ...groupedSchema.date,
    ...groupedSchema.number,
  ];

  return (
    <div>
      <Table bordered>
        <thead>
          <tr>
            <th>
              Attributes
              <Button
                variant="link"
                onClick={() => setHideMinusOnes((prev) => !prev)}
                style={{ float: "right", padding: 0 }}
              >
                {hideMinusOnes ? <FaEye /> : <FaEyeSlash />}
              </Button>
            </th>
            <th>Value</th>
            <th>Quantity</th>
            <th>Currency</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {sortedSchema.map((col) => {
            const rowData = editableData.data[col.key] || {
              value: "",
              quantity: "",
              currency: "",
              total_price: "",
              value_type: "text",
            };

            // If hiding -1 rows is enabled and this row's value is -1, skip rendering
            if (hideMinusOnes && rowData.value === "-1") {
              return null;
            }

            const rowTitle = col.key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <tr key={col.key}>
                <td>{rowTitle}</td>
                <td style={getCellStyle(rowData.value)}>
                  {isEditing ? (
                    <input
                      type={
                        rowData.value_type === "number"
                          ? "number"
                          : rowData.value_type === "date" ||
                            col.key === "payment_due_date"
                          ? "date"
                          : "text"
                      }
                      step={rowData.value_type === "number" ? "any" : ""}
                      value={
                        rowData.value_type === "date" ||
                        col.key === "payment_due_date"
                          ? rowData.value
                            ? new Date(rowData.value)
                                .toISOString()
                                .split("T")[0]
                            : ""
                          : rowData.value
                      }
                      onChange={(e) =>
                        handleChange(col.key, "value", e.target.value)
                      }
                    />
                  ) : rowData.value_type === "date" ? (
                    rowData.value ? (
                      new Date(rowData.value).toLocaleDateString("en-US")
                    ) : (
                      ""
                    )
                  ) : (
                    rowData.value
                  )}
                </td>
                {rowData.value_type === "number" && (
                  <>
                    <td style={getCellStyle(rowData.quantity)}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={rowData.quantity}
                          onChange={(e) =>
                            handleChange(col.key, "quantity", e.target.value)
                          }
                        />
                      ) : (
                        rowData.quantity
                      )}
                    </td>
                    <td style={getCellStyle(rowData.currency)}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={rowData.currency}
                          onChange={(e) =>
                            handleChange(col.key, "currency", e.target.value)
                          }
                        />
                      ) : (
                        rowData.currency
                      )}
                    </td>
                    <td
                      style={getCellStyle(
                        rowData.total_price && rowData.total_price !== "0.00"
                          ? rowData.total_price
                          : ""
                      )}
                    >
                      {rowData.total_price && rowData.total_price !== "0.00"
                        ? rowData.total_price
                        : ""}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
          <tr>
            <td>Actions</td>
            <td colSpan={4}>
              {isEditing ? (
                <FaSave
                  onClick={handleSaveClick}
                  style={{ cursor: "pointer", color: "green" }}
                />
              ) : (
                <FaEdit
                  onClick={onEdit}
                  style={{ cursor: "pointer", color: "blue" }}
                />
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default EditableReceiptTable;
