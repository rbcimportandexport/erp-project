import Modal from "../common/Modal";

const AddExporterModal = ({ open, onClose, children }) => <Modal open={open} onClose={onClose} title="Add Exporter">{children}</Modal>;

export default AddExporterModal;
