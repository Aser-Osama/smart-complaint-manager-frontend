import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaEdit, FaSave } from "react-icons/fa";

function EditableReceiptTable({ receipt, schema, isEditing, onEdit, onSave }) {
  // Convert receipt.data to a structure keyed by 'key'
  // that holds value, quantity, currency, total_price
  const [editableData, setEditableData] = useState({
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

  // Ensure all schema keys are present in editableData.data with all fields
  useEffect(() => {
    const updatedData = { ...editableData.data };
    schema.forEach((col) => {
      if (!(col.key in updatedData)) {
        updatedData[col.key] = {
          value: "",
          quantity: "",
          currency: "",
          total_price: "",
        };
      } else {
        // Ensure all fields exist for each key
        const existing = updatedData[col.key];
        updatedData[col.key] = {
          value: existing.value || "",
          quantity: existing.quantity || "",
          currency: existing.currency || "",
          total_price: existing.total_price || "",
        };
      }
    });
    setEditableData((prevData) => ({ ...prevData, data: updatedData }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, receipt]);

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
            value: fields.value === "" ? null : fields.value,
            quantity: fields.quantity === "" ? null : fields.quantity,
            currency: fields.currency === "" ? null : fields.currency,
            total_price: fields.total_price === "" ? null : fields.total_price,
          },
        ])
      ),
    };
    console.log(cleanedData);
    onSave(cleanedData);
  };

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

            // Format the row title
            const rowTitle = col.key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <tr key={col.key}>
                <td>{rowTitle}</td>
                <td>
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
                <td>
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
                <td>
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
                <td>
                  {/* total_price is NOT editable */}
                  {rowData.total_price}
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
