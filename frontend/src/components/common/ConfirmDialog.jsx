import Button from "./Button";
import Modal from "./Modal";

const ConfirmDialog = ({ open, title = "Confirm action", message, onConfirm, onClose }) => (
  <Modal
    open={open}
    title={title}
    onClose={onClose}
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    }
  >
    <p className="text-sm text-slate-600">{message || "This action cannot be undone."}</p>
  </Modal>
);

export default ConfirmDialog;
