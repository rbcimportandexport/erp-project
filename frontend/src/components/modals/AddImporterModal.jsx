import Modal from "../common/Modal";

const AddImporterModal = ({ open, onClose, children }) => <Modal open={open} onClose={onClose} title="Add Importer">{children}</Modal>;

export default AddImporterModal;
