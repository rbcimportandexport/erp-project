import { useMemo, useState } from "react";
import approvalApi from "../../api/approvalApi";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";
import { useFetch } from "../../hooks/useFetch";
import dayjs from "dayjs";

const DiffViewer = ({ original, requested, action }) => {
  if (action === "delete") {
    const origObj = original instanceof Map ? Object.fromEntries(original) : original || {};
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold text-rose-600">The following record will be deleted:</p>
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 max-h-60 overflow-y-auto">
          {Object.entries(origObj).map(([key, val]) => (
            <div key={key} className="text-xs mb-1.5 flex gap-2">
              <span className="font-semibold text-slate-500 min-w-[120px]">{key}:</span>
              <span className="text-slate-800 break-all">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (action === "create") {
    const reqObj = requested instanceof Map ? Object.fromEntries(requested) : requested || {};
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold text-emerald-600">The following record will be created:</p>
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 max-h-60 overflow-y-auto">
          {Object.entries(reqObj).map(([key, val]) => (
            <div key={key} className="text-xs mb-1.5 flex gap-2">
              <span className="font-semibold text-slate-500 min-w-[120px]">{key}:</span>
              <span className="text-slate-800 break-all">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // action === "update"
  const origObj = original instanceof Map ? Object.fromEntries(original) : original || {};
  const reqObj = requested instanceof Map ? Object.fromEntries(requested) : requested || {};

  const allKeys = Array.from(new Set([...Object.keys(origObj), ...Object.keys(reqObj)])).filter(
    (key) => !["createdAt", "updatedAt", "__v", "_id", "id"].includes(key)
  );

  const changedKeys = allKeys.filter((key) => {
    const origVal = origObj[key];
    const reqVal = reqObj[key];
    return JSON.stringify(origVal) !== JSON.stringify(reqVal);
  });

  if (changedKeys.length === 0) {
    return <p className="text-xs text-slate-500 italic">No fields were changed.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-blue-600">Field modifications:</p>
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 max-h-80 overflow-y-auto space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-400 border-b border-slate-200 pb-1.5">
          <span>Field Name</span>
          <span>Original Value</span>
          <span>Requested Value</span>
        </div>
        {changedKeys.map((key) => {
          const origVal = origObj[key];
          const reqVal = reqObj[key];
          return (
            <div key={key} className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-slate-200/50 last:border-0 items-center">
              <span className="font-bold text-slate-600 break-all">{key}</span>
              <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded break-all border border-rose-100">
                {origVal !== undefined ? (typeof origVal === "object" ? JSON.stringify(origVal) : String(origVal)) : <em className="text-slate-400">None</em>}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded break-all border border-emerald-100">
                {reqVal !== undefined ? (typeof reqVal === "object" ? JSON.stringify(reqVal) : String(reqVal)) : <em className="text-slate-400">None</em>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Approvals = () => {
  const alert = useAlert();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectComments, setRejectComments] = useState("");

  const { data, loading, refetch } = useFetch(
    () => approvalApi.list({ status: statusFilter, page }),
    [statusFilter, page]
  );

  const handleApprove = async (id) => {
    try {
      await approvalApi.approve(id);
      alert.success("Request approved and changes applied successfully!");
      refetch();
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      await approvalApi.reject(rejectId, rejectComments);
      alert.success("Request rejected.");
      setRejectId(null);
      setRejectComments("");
      refetch();
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "create":
        return <Badge tone="green">CREATE</Badge>;
      case "update":
        return <Badge tone="blue">UPDATE</Badge>;
      case "delete":
        return <Badge tone="red">DELETE</Badge>;
      default:
        return <Badge tone="gray">{action.toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge tone="amber">Pending</Badge>;
      case "approved":
        return <Badge tone="green">Approved</Badge>;
      case "rejected":
        return <Badge tone="red">Rejected</Badge>;
      default:
        return <Badge tone="gray">{status}</Badge>;
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) => dayjs(row.original.createdAt).format("DD MMM YYYY, hh:mm A"),
      },
      {
        header: "Requested By",
        accessorKey: "requestedBy.name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-800">{row.original.requestedBy?.name || "Unknown"}</p>
            <p className="text-[10px] text-slate-400">{row.original.requestedBy?.email}</p>
          </div>
        ),
      },
      {
        header: "Resource / Module",
        accessorKey: "moduleName",
        cell: ({ row }) => <span className="font-bold text-slate-700">{row.original.moduleName}</span>,
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: ({ row }) => getActionBadge(row.original.action),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelectedRequest(row.original)}>
              View Details
            </Button>
            {row.original.status === "pending" && (
              <>
                <Button onClick={() => handleApprove(row.original._id)}>Approve</Button>
                <Button variant="danger" onClick={() => setRejectId(row.original._id)}>
                  Reject
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [statusFilter]
  );

  return (
    <>
      <TopBar title="Approval Requests" />
      
      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-px">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize -mb-[2px] ${
              statusFilter === status
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {status} Requests
          </button>
        ))}
      </div>

      {loading ? <Loader /> : <Table columns={columns} data={data?.items || []} />}
      <Pagination page={data?.page || page} pages={data?.pages || 1} onPageChange={setPage} />

      {/* Details View Modal */}
      <Modal
        open={Boolean(selectedRequest)}
        title="Review Request Details"
        onClose={() => setSelectedRequest(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            {selectedRequest && selectedRequest.status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    handleApprove(selectedRequest._id);
                    setSelectedRequest(null);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setRejectId(selectedRequest._id);
                    setSelectedRequest(null);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">Module</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRequest.moduleName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">Action Type</p>
                <p className="mt-0.5">{getActionBadge(selectedRequest.action)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">Requested By</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.requestedBy?.name} ({selectedRequest.requestedBy?.role})</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">Requested At</p>
                <p className="font-semibold text-slate-800 mt-0.5">{dayjs(selectedRequest.createdAt).format("DD MMM YYYY, hh:mm A")}</p>
              </div>
              {selectedRequest.status !== "pending" && (
                <>
                  <div>
                    <p className="font-semibold text-slate-400 uppercase tracking-wider">Processed By</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.approvedBy?.name || "System"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400 uppercase tracking-wider">Processed At</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{dayjs(selectedRequest.approvedAt).format("DD MMM YYYY, hh:mm A")}</p>
                  </div>
                </>
              )}
            </div>

            {selectedRequest.comments && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-800">
                <span className="font-bold">Rejection Reason / Comments:</span> {selectedRequest.comments}
              </div>
            )}

            <DiffViewer
              original={selectedRequest.originalData}
              requested={selectedRequest.requestedData}
              action={selectedRequest.action}
            />
          </div>
        )}
      </Modal>

      {/* Reject Comments Modal */}
      <Modal
        open={Boolean(rejectId)}
        title="Reject Approval Request"
        onClose={() => {
          setRejectId(null);
          setRejectComments("");
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRejectId(null);
                setRejectComments("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectSubmit}>
              Submit Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Please provide a reason for rejecting this changes request:</p>
          <Input
            label="Rejection Comments"
            value={rejectComments}
            onChange={(e) => setRejectComments(e.target.value)}
            placeholder="e.g. Invalid HSN rate or description spelling mistake"
            required
          />
        </div>
      </Modal>
    </>
  );
};

export default Approvals;
