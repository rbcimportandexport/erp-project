import Modal from "../common/Modal";

const AddContainerModal = ({ open, onClose, children }) => <Modal open={open} onClose={onClose} title="Add Container">{children}</Modal>;

export default AddContainerModal;
