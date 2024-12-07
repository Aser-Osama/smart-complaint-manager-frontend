import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaEdit, FaSave } from "react-icons/fa";

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
          };
          return acc;
        }, {})
      : {},
  });

  const [editableData, setEditableData] = useState(
    initializeEditableData(receipt)
  );

  useEffect(() => {
    setEditableData(initializeEditableData(receipt));
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
          },
        ])
      ),
    };
    onSave(cleanedData);
  };

  const getCellStyle = (value) => ({
    backgroundColor: value ? "transparent" : "#f0f0f0",
  });

  return (
    <div>
      <Table bordered>
        <thead>
          <tr>
            <th>{editableData.id}</th>
            <th>Value</th>
            <th>Quantity</th>
            <th>Currency</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((col) => {
            const rowData = editableData.data[col.key] || {
              value: "",
              quantity: "",
              currency: "",
              total_price: "",
            };

            const rowTitle = col.key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <tr key={col.key}>
                <td>{rowTitle}</td>
                <td style={getCellStyle(rowData.value)}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={rowData.value}
                      onChange={(e) =>
                        handleChange(col.key, "value", e.target.value)
                      }
                    />
                  ) : (
                    rowData.value
                  )}
                </td>
                <td style={getCellStyle(rowData.quantity)}>
                  {isEditing ? (
                    <input
                      type="text"
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
