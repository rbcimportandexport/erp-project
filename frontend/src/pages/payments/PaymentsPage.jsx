import { useState } from "react";
import { createPayment, getPayment, updatePayment } from "../../api/paymentApi";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";

const fields = ["dutyAmount", "cgstAmount", "otherCharges", "shippingLinePayment", "clientPayment", "paidAmount", "paymentMode", "remarks"];

const PaymentsPage = () => {
  const [containerId, setContainerId] = useState("");
  const [payment, setPayment] = useState({});
  const alert = useAlert();

  const load = async () => {
    const response = await getPayment(containerId);
    setPayment(response.data || {});
  };

  const save = async () => {
    if (payment._id) await updatePayment(payment._id, payment);
    else await createPayment(containerId, payment);
    alert.success("Payment saved");
    load();
  };

  return (
    <>
      <TopBar title="Payments" />
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <Input label="Container ID" value={containerId} onChange={(event) => setContainerId(event.target.value)} />
          <div className="flex items-end gap-2"><Button variant="secondary" onClick={load}>Load</Button><Button onClick={save}>Save</Button></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {fields.map((field) => <Input key={field} label={field} type={field.includes("Amount") || field === "paidAmount" ? "number" : "text"} value={payment[field] || ""} onChange={(event) => setPayment((value) => ({ ...value, [field]: event.target.type === "number" ? Number(event.target.value) : event.target.value }))} />)}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-4"><p className="text-sm text-slate-500">Total</p><p className="text-xl font-bold">₹{payment.totalAmount || 0}</p></div>
          <div className="rounded-md bg-slate-50 p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold">₹{payment.pendingAmount || 0}</p></div>
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;
