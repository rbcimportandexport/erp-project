import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import containerApi from "../../api/containerApi";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import TopBar from "../../components/layout/TopBar";
import { useFetch } from "../../hooks/useFetch";

const ContainerDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => containerApi.get(id), [id]);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { container, documents = [], payment, transports = [] } = data || {};

  return (
    <>
      <TopBar title={container?.containerNo || "Container"} actions={<StatusBadge status={container?.status} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-md bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Shipment</h2>
          <dl className="grid gap-4 text-sm md:grid-cols-2">
            <div><dt className="text-slate-500">Importer</dt><dd className="font-medium">{container?.importer?.name || "-"}</dd></div>
            <div><dt className="text-slate-500">Exporter</dt><dd className="font-medium">{container?.exporter?.name || "-"}</dd></div>
            <div><dt className="text-slate-500">HSN</dt><dd className="font-medium">{container?.hsnCode?.code || "-"}</dd></div>
            <div><dt className="text-slate-500">Loading</dt><dd>{container?.loadingDate ? dayjs(container.loadingDate).format("DD MMM YYYY") : "-"}</dd></div>
            <div><dt className="text-slate-500">ETA</dt><dd>{container?.etaDate ? dayjs(container.etaDate).format("DD MMM YYYY") : "-"}</dd></div>
          </dl>
        </section>
        <section className="rounded-md bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Payment</h2>
          <p className="text-3xl font-bold text-slate-950">₹{payment?.pendingAmount || 0}</p>
          <p className="text-sm text-slate-500">Pending amount</p>
        </section>
        <section className="rounded-md bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Documents</h2>
          <div className="flex flex-wrap gap-2">{documents.map((doc) => <Badge key={doc._id} tone="blue">{doc.docType}</Badge>)}</div>
        </section>
        <section className="rounded-md bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Transport</h2>
          {transports.map((item) => <p key={item._id} className="text-sm">{item.vehicleNo} · {item.transporterName}</p>)}
          {transports.length === 0 && <p className="text-sm text-slate-500">No transport records</p>}
        </section>
      </div>
    </>
  );
};

export default ContainerDetail;
