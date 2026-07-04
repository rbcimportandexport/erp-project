import { Navigate, useParams } from "react-router-dom";

const ContainerDetail = () => {
  const { id } = useParams();
  return <Navigate to={`/containers?edit=${id}`} replace />;
};

export default ContainerDetail;
