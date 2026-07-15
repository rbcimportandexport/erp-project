import Modal from "../common/Modal";

const PaymentModal = ({ open, onClose, children }) => <Modal open={open} onClose={onClose} title="Payment">{children}</Modal>;

export default PaymentModal;
