import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Loader from "../components/common/Loader";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import SearchBar from "../components/common/SearchBar";
import Table from "../components/common/Table";
import FormulaBar from "../components/common/FormulaBar";
import TopBar from "../components/layout/TopBar";
import { useAlert } from "../hooks/useAlert";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import { canEdit, canDelete } from "../utils/permissions";

const ResourcePage = ({ title, api, fields, columns, getRowClassName, openEditId, onEditClosed, tableVariant, renderHeader, filters = {}, initialCustomFilters = {}, initialSort = "-createdAt" }) => {
  const alert = useAlert();
  const { user } = useAuth();
  const lastAutoEditId = useRef(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState(initialSort);
  const [customFilters, setCustomFilters] = useState(initialCustomFilters);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const debouncedSearch = useDebounce(search);
  const [activeCell, setActiveCell] = useState(null);

  const [form, setForm] = useState({});
  const hasEditPermission = canEdit(user?.role);
  const hasDeletePermission = canDelete(user?.role);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, JSON.stringify(customFilters)]);

  const { data, loading, refetch } = useFetch(
    () => api.list({ search: debouncedSearch, page, limit, sort, ...filters, ...customFilters }),
    [api, debouncedSearch, page, limit, sort, JSON.stringify(filters), JSON.stringify(customFilters)]
  );

  const openEditor = (record) => {
    setSelected(record);
    setForm(record);
    setOpen(true);
  };

  const closeEditor = () => {
    setOpen(false);
    if (onEditClosed) onEditClosed();
  };

  useEffect(() => {
    if (!openEditId || loading || lastAutoEditId.current === openEditId) return;

    let cancelled = false;
    const items = data?.items || [];
    const existingRecord = items.find((item) => item._id === openEditId || item.id === openEditId);

    const openRequestedRecord = async () => {
      try {
        const record = existingRecord || (await api.get(openEditId)).data;
        if (!cancelled && record) {
          lastAutoEditId.current = openEditId;
          openEditor(record);
        }
      } catch (error) {
        if (!cancelled) alert.error(error.message || "Could not open this record for editing");
      }
    };

    openRequestedRecord();

    return () => {
      cancelled = true;
    };
  }, [api, alert, data, loading, openEditId]);

  const tableColumns = useMemo(
    () => {
      const baseColumns = [...columns];
      if (hasEditPermission || hasDeletePermission) {
        baseColumns.push({
          header: "Actions",
          cell: ({ row }) => (
            <div className="flex gap-2">
              {hasEditPermission && (
                <Button variant="secondary" onClick={() => openEditor(row.original)}>Edit</Button>
              )}
              {hasDeletePermission && (
                <Button variant="danger" className="h-10 w-10 p-0 flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all" onClick={() => setConfirmId(row.original._id)} aria-label="Delete"><Trash2 className="h-5 w-5 shrink-0" /></Button>
              )}
            </div>
          ),
        });
      }
      return baseColumns;
    },
    [columns, hasEditPermission, hasDeletePermission]
  );

  const save = async () => {
    try {
      if (selected?._id) await api.update(selected._id, form);
      else await api.create(form);
      alert.success(`${title} saved`);
      closeEditor();
      setSelected(null);
      setForm({});
      refetch();
    } catch (error) {
      const rawMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Something went wrong";
      const message = rawMessage.includes('row-level security')
        ? "Database permission blocked this save. Run the Supabase RLS policies for this table."
        : rawMessage;
      alert.error(message);
    }
  };

  const handleInlineSave = async (record, fieldName, newValue) => {
    try {
      const id = record._id || record.id;
      const updatedPayload = {
        ...record,
        [fieldName]: newValue === "" ? null : newValue,
      };

      if (updatedPayload.importer && typeof updatedPayload.importer === "object") {
        updatedPayload.importer = updatedPayload.importer._id || updatedPayload.importer.id;
      }
      if (updatedPayload.exporter && typeof updatedPayload.exporter === "object") {
        updatedPayload.exporter = updatedPayload.exporter._id || updatedPayload.exporter.id;
      }
      if (updatedPayload.hsnCode && typeof updatedPayload.hsnCode === "object") {
        updatedPayload.hsnCode = updatedPayload.hsnCode._id || updatedPayload.hsnCode.id;
      }

      await api.update(id, updatedPayload);
      alert.success(`Saved successfully`);
      refetch();
    } catch (error) {
      const rawMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save inline edit";
      alert.error(rawMessage);
      throw error;
    }
  };
  const remove = async () => {
    try {
      await api.remove(confirmId);
      alert.success(`${title} deleted`);
      setConfirmId(null);
      refetch();
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      {renderHeader ? (
        renderHeader({
          items: data?.items || [],
          total: data?.total || 0,
          loading,
          openAdd: () => { setSelected(null); setForm({ ...customFilters }); setOpen(true); },
          search,
          setSearch,
          title,
          sort,
          setSort,
          customFilters,
          setCustomFilters,
          hasEditPermission,
        })
      ) : (
        <>
          <TopBar
            title={title}
            actions={hasEditPermission && <Button onClick={() => { setSelected(null); setForm({}); setOpen(true); }}><Plus className="h-4 w-4" />Add</Button>}
          />
          <div className="mb-4 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}`} /></div>
        </>
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className="animate-fade-in-up animation-delay-75">
          <FormulaBar activeCell={activeCell} onSave={activeCell?.onSave} />
          <Table 
            columns={tableColumns} 
            data={data?.items || []} 
            getRowClassName={getRowClassName} 
            meta={{ 
              openEdit: openEditor, 
              fields, 
              onInlineSave: handleInlineSave, 
              activeCell, 
              setActiveCell 
            }} 
            variant={tableVariant} 
          />
        </div>
      )}
      <Pagination
        page={data?.page || page}
        pages={data?.pages || 1}
        total={data?.total || 0}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <Modal
        open={open}
        title={selected ? (hasEditPermission ? `Edit ${title}` : `View ${title}`) : `Add ${title}`}
        onClose={closeEditor}
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={closeEditor}>{hasEditPermission ? "Cancel" : "Close"}</Button>{hasEditPermission && <Button onClick={save}>Save</Button>}</div>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => {
            const val = form[field.name];
            let displayValue = val && typeof val === "object" ? (val._id || "") : (val ?? "");
            if (field.type === "date" && val) {
              const d = dayjs(val);
              if (d.isValid()) {
                displayValue = d.format("YYYY-MM-DD");
              }
            }
            if (field.type === "select") {
              return (
                <Select
                  key={field.name}
                  label={field.label}
                  options={field.options}
                  value={displayValue}
                  onChange={(event) => setForm((value) => ({ ...value, [field.name]: event.target.value }))}
                  required={field.required}
                  disabled={!hasEditPermission}
                />
              );
            }
            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type || "text"}
                value={displayValue}
                onChange={(event) => setForm((value) => ({ ...value, [field.name]: field.type === "number" ? Number(event.target.value) : event.target.value }))}
                required={field.required}
                disabled={!hasEditPermission}
              />
            );
          })}
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)} onConfirm={remove} message={`Delete this ${title.toLowerCase()} record?`} />
    </>
  );
};

export default ResourcePage;
