import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SortIcon = ({ state }) => {
  if (state === "asc") return <ArrowUp size={11} style={{ opacity: 0.9, color: "var(--t-navy)" }} />;
  if (state === "desc") return <ArrowDown size={11} style={{ opacity: 0.9, color: "var(--t-navy)" }} />;
  return <ArrowUpDown size={10} style={{ opacity: 0.3 }} />;
};

const getColLetter = (index) => {
  let temp = index;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
};

const CellEditor = ({ fieldConfig, initialValue, onSave, onCancel }) => {
  const [val, setVal] = useState(initialValue || "");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      if (ref.current.setSelectionRange && typeof val === "string") {
        ref.current.setSelectionRange(val.length, val.length);
      }
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSave(val);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(val);
  };

  if (fieldConfig.type === "select") {
    return (
      <select
        ref={ref}
        className="sheet-cell-editor type-select"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <option value="">Select...</option>
        {fieldConfig.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (fieldConfig.type === "date") {
    let dateStr = val;
    if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        dateStr = parsedDate.toISOString().split("T")[0];
      }
    }

    return (
      <input
        ref={ref}
        type="date"
        className="sheet-cell-editor type-date"
        value={dateStr}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <input
      ref={ref}
      type="text"
      className="sheet-cell-editor"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

const Table = ({ columns, data = [], getRowClassName, meta }) => {
  const [selectedCell, setSelectedCell] = useState(null); // { rowIndex, colIndex, colId, value, record }
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, colId, value }
  const [savingCells, setSavingCells] = useState(new Set());

  const table = useReactTable({
    data,
    columns,
    meta,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const findFieldConfig = (colId) => {
    if (!meta?.fields) return null;
    const normCol = colId.replace(/_/g, "").toLowerCase();
    return meta.fields.find(
      (f) => f.name.replace(/_/g, "").toLowerCase() === normCol
    );
  };

  const handleInlineSave = async (record, colId, newValue) => {
    const fieldConfig = findFieldConfig(colId);
    if (!fieldConfig) return;

    const recordId = record._id || record.id;
    const cellKey = `${recordId}_${colId}`;

    const oldValue = record[fieldConfig.name] ?? record[colId] ?? "";
    const normOld = oldValue && typeof oldValue === "object" ? (oldValue._id || oldValue.id || "") : String(oldValue);
    const normNew = String(newValue);

    if (normOld === normNew) {
      setEditingCell(null);
      return;
    }

    setSavingCells((prev) => {
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });

    setEditingCell(null);

    try {
      if (meta?.onInlineSave) {
        await meta.onInlineSave(record, fieldConfig.name, newValue);
      }
    } catch (err) {
      console.error("Inline save error:", err);
    } finally {
      setSavingCells((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }
  };

  // Keep FormulaBar synced when selection changes
  useEffect(() => {
    if (meta?.setActiveCell) {
      if (selectedCell) {
        const fieldConfig = findFieldConfig(selectedCell.colId);
        const colLetter = getColLetter(selectedCell.colIndex);
        const cellAddress = `${colLetter}${selectedCell.rowIndex + 1}`;

        meta.setActiveCell({
          address: cellAddress,
          value: selectedCell.value,
          fieldConfig,
          onSave: (newVal) => {
            handleInlineSave(selectedCell.record, selectedCell.colId, newVal);
            setSelectedCell((prev) => (prev ? { ...prev, value: newVal } : null));
          },
        });
      } else {
        meta.setActiveCell(null);
      }
    }
  }, [selectedCell?.rowIndex, selectedCell?.colId, selectedCell?.value]);

  // Keyboard navigation
  const handleTableKeyDown = (e) => {
    if (editingCell) return;

    if (!selectedCell) {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        const rows = table.getRowModel().rows;
        const visibleCells = rows[0]?.getVisibleCells() || [];
        if (rows.length > 0 && visibleCells.length > 0) {
          const firstColId = visibleCells[0].column.id;
          const firstRecord = rows[0].original;
          const fieldConfig = findFieldConfig(firstColId);
          const val = firstRecord[fieldConfig?.name] ?? firstRecord[firstColId] ?? "";
          setSelectedCell({
            rowIndex: 0,
            colIndex: 0,
            colId: firstColId,
            value: val && typeof val === "object" ? (val._id || val.id || "") : String(val),
            record: firstRecord,
          });
          e.preventDefault();
        }
      }
      return;
    }

    const { rowIndex, colIndex } = selectedCell;
    const rows = table.getRowModel().rows;
    const visibleCells = rows[rowIndex]?.getVisibleCells() || [];

    let nextRowIndex = rowIndex;
    let nextColIndex = colIndex;

    if (e.key === "ArrowDown") {
      nextRowIndex = Math.min(rows.length - 1, rowIndex + 1);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      nextRowIndex = Math.max(0, rowIndex - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      nextColIndex = Math.min(visibleCells.length - 1, colIndex + 1);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      nextColIndex = Math.max(0, colIndex - 1);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === "F2") {
      const fieldConfig = findFieldConfig(selectedCell.colId);
      if (fieldConfig) {
        setEditingCell({ rowIndex, colId: selectedCell.colId, value: selectedCell.value });
      }
      e.preventDefault();
      return;
    } else if (e.key === "Escape") {
      setSelectedCell(null);
      e.preventDefault();
      return;
    } else {
      return;
    }

    if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
      const nextRow = rows[nextRowIndex];
      const nextCells = nextRow.getVisibleCells();
      const nextCell = nextCells[nextColIndex];
      const nextColId = nextCell.column.id;
      const nextRecord = nextRow.original;
      const fieldConfig = findFieldConfig(nextColId);
      const val = nextRecord[fieldConfig?.name] ?? nextRecord[nextColId] ?? "";
      setSelectedCell({
        rowIndex: nextRowIndex,
        colIndex: nextColIndex,
        colId: nextColId,
        value: val && typeof val === "object" ? (val._id || val.id || "") : String(val),
        record: nextRecord,
      });
    }
  };

  return (
    <div
      className="erp-table-wrap"
      tabIndex={0}
      onKeyDown={handleTableKeyDown}
      style={{ outline: "none" }}
    >
      <div className="erp-table-inner">
        <table className="erp-table sheet-grid-table">
          <thead>
            <tr className="sheet-col-letter-row">
              <th className="sheet-col-letter" style={{ width: "40px" }}></th>
              {table.getHeaderGroups()[0]?.headers.map((header, idx) => (
                <th key={`letter-${header.id}`} className="sheet-col-letter">
                  {getColLetter(idx)}
                </th>
              ))}
            </tr>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                <th className="sheet-row-index" style={{ width: "40px" }}>#</th>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon state={header.column.getIsSorted()} />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rIdx) => (
              <tr key={row.id} className={getRowClassName ? getRowClassName(row.original) : ""}>
                <td className="sheet-row-index">{rIdx + 1}</td>
                {row.getVisibleCells().map((cell, cIdx) => {
                  const colId = cell.column.id;
                  const isEditing = editingCell && editingCell.rowIndex === rIdx && editingCell.colId === colId;
                  const isSelected = selectedCell && selectedCell.rowIndex === rIdx && selectedCell.colId === colId;
                  const recordId = row.original._id || row.original.id;
                  const isSaving = savingCells.has(`${recordId}_${colId}`);
                  const fieldConfig = findFieldConfig(colId);
                  const isEditable = Boolean(fieldConfig);

                  const cellValue = row.original[fieldConfig?.name] ?? row.original[colId] ?? "";
                  const handleCellClick = () => {
                    const normVal = cellValue && typeof cellValue === "object" ? (cellValue._id || cellValue.id || "") : String(cellValue);
                    setSelectedCell({
                      rowIndex: rIdx,
                      colIndex: cIdx,
                      colId,
                      value: normVal,
                      record: row.original,
                    });
                  };

                  const handleCellDoubleClick = () => {
                    if (isEditable) {
                      const normVal = cellValue && typeof cellValue === "object" ? (cellValue._id || cellValue.id || "") : String(cellValue);
                      setEditingCell({
                        rowIndex: rIdx,
                        colId,
                        value: normVal,
                      });
                    }
                  };

                  return (
                    <td
                      key={cell.id}
                      className={[
                        isSelected ? "cell-selected" : "",
                        isSaving ? "sheet-cell-saving" : "",
                        isEditable ? "cursor-pointer" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={handleCellClick}
                      onDoubleClick={handleCellDoubleClick}
                    >
                      {isEditing ? (
                        <CellEditor
                          fieldConfig={fieldConfig}
                          initialValue={editingCell.value}
                          onSave={(newVal) => handleInlineSave(row.original, colId, newVal)}
                          onCancel={() => setEditingCell(null)}
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="erp-table-empty">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
