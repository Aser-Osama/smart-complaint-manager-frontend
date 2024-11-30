import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaEdit, FaSave } from "react-icons/fa";

function EditableReceiptTable({ receipt, schema, isEditing, onEdit, onSave }) {
  // Ensure receipt.data is an array before attempting to reduce
  const [editableData, setEditableData] = useState({
    id: receipt.id,
    data: Array.isArray(receipt.data)
      ? receipt.data.reduce((acc, field) => {
          acc[field.key] = field.value;
          return acc;
        }, {})
      : {}, // Default to an empty object if receipt.data is not an array
  });

  // Ensure all schema keys are present in editableData.data
  useEffect(() => {
    const updatedData = { ...editableData.data };
    schema.forEach((col) => {
      if (!(col.key in updatedData)) {
        updatedData[col.key] = ""; // Add missing keys with empty values
      }
    });
    setEditableData((prevData) => ({ ...prevData, data: updatedData }));
  }, [schema, receipt]);

  const handleChange = (key, newValue) => {
    setEditableData((prevData) => ({
      ...prevData,
      data: { ...prevData.data, [key]: newValue },
    }));
  };

  const handleSaveClick = () => {
    console.log(editableData);
    onSave(editableData);
  };

  return (
    <div>
      <Table bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>{editableData.id}</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((col) => {
            const value = editableData.data[col.key] || ""; // Fallback if no value found
            return (
              <tr key={col.key}>
                <td>
                  {col.key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(col.key, e.target.value)}
                    />
                  ) : (
                    value
                  )}
                </td>
              </tr>
            );
          })}
          <tr>
            <td>Actions</td>
            <td>
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
