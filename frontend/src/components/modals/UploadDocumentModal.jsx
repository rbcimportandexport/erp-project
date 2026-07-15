import Modal from "../common/Modal";

const UploadDocumentModal = ({ open, onClose, children }) => <Modal open={open} onClose={onClose} title="Upload Document">{children}</Modal>;

export default UploadDocumentModal;
