import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaEdit, FaSave } from "react-icons/fa";

function EditableContractTable({ receipt, schema, isEditing, onEdit, onSave }) {
  const initializeEditableData = (receipt) => ({
    id: receipt.id,
    data: Array.isArray(receipt.data)
      ? receipt.data.reduce((acc, field) => {
          acc[field.key] = {
            value: field.value || "",
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
          },
        ])
      ),
    };
    console.log("cleanedData", cleanedData);
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
          </tr>
        </thead>
        <tbody>
          {schema.map((col) => {
            const rowData = editableData.data[col.key] || {
              value: "",
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
                      type={
                        col.value_type === "number"
                          ? "number"
                          : col.value_type === "date"
                          ? "date"
                          : "text"
                      }
                      step={col.value_type === "number" ? "any" : ""}
                      value={
                        col.value_type === "date" && rowData.value
                          ? new Date(rowData.value).toLocaleDateString("en-CA")
                          : rowData.value || ""
                      }
                      onChange={(e) =>
                        handleChange(col.key, "value", e.target.value)
                      }
                    />
                  ) : col.value_type === "date" ? (
                    rowData.value ? (
                      new Date(rowData.value).toLocaleDateString("en-US")
                    ) : (
                      ""
                    )
                  ) : (
                    rowData.value
                  )}
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

export default EditableContractTable;
