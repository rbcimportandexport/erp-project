import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import userApi from "../../api/userApi";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  isActive: true,
};

const roleOptions = [
  { value: "masterAdmin", label: "Master Admin" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

const UsersPage = () => {
  const alert = useAlert();
  const { user: currentUser } = useAuth();
  const currentUserRole = currentUser?.role || "user";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, loading, refetch } = useFetch(() => userApi.list({ search: debouncedSearch, page }), [debouncedSearch, page]);

  const visibleRoleOptions = useMemo(() => {
    if (currentUserRole === "masterAdmin") {
      return roleOptions;
    }
    // If admin, only show 'user' option
    return roleOptions.filter((opt) => opt.value === "user");
  }, [currentUserRole]);

  const startAdd = () => {
    setSelected(null);
    setForm({
      ...emptyForm,
      role: "user",
    });
    setOpen(true);
  };

  const startEdit = (user) => {
    setSelected(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      isActive: Boolean(user.isActive),
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form };
      if (selected && !payload.password) delete payload.password;

      // Force role to user if non-masterAdmin tries to set it otherwise
      if (currentUserRole !== "masterAdmin") {
        payload.role = "user";
      }

      if (selected?._id) await userApi.update(selected._id, payload);
      else await userApi.create(payload);

      alert.success("User saved");
      setOpen(false);
      refetch();
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    }
  };

  const remove = async () => {
    try {
      await userApi.remove(confirmId);
      alert.success("User deleted");
      setConfirmId(null);
      refetch();
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Role", accessorKey: "role", cell: ({ row }) => <Badge tone="blue">{row.original.role}</Badge> },
      { header: "Status", accessorKey: "isActive", cell: ({ row }) => <Badge tone={row.original.isActive ? "green" : "red"}>{row.original.isActive ? "Active" : "Inactive"}</Badge> },
      {
        header: "Actions",
        cell: ({ row }) => {
          const targetRole = row.original.role;
          const canManage = currentUserRole === "masterAdmin" || (currentUserRole === "admin" && targetRole === "user");

          if (!canManage) return null;

          return (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => startEdit(row.original)}>Edit</Button>
              <Button variant="danger" className="h-10 w-10 p-0 flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all" onClick={() => setConfirmId(row.original._id)} aria-label="Delete user">
                <Trash2 className="h-5 w-5 shrink-0" />
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUserRole]
  );

  return (
    <>
      <TopBar title="Users" actions={<Button onClick={startAdd}><Plus className="h-4 w-4" />Add User</Button>} />
      <div className="mb-4 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users" />
      </div>
      {loading ? <Loader /> : <Table columns={columns} data={data?.items || []} />}
      <Pagination page={data?.page || page} pages={data?.pages || 1} onPageChange={setPage} />

      <Modal
        open={open}
        title={selected ? "Edit User" : "Add User"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} />
          <Input label={selected ? "New Password" : "Password"} type="password" value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} />
          <Select label="Role" value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value }))} options={visibleRoleOptions} />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} />
            Active user
          </label>
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)} onConfirm={remove} message="Delete this user?" />
    </>
  );
};

export default UsersPage;
