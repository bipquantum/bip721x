import { useParams } from "react-router-dom";

import IPItem from "../../IPItem";

function IP() {
  const { id } = useParams();

  if (id === undefined) {
    return <div>Invalid IP</div>;
  }

  return (
    <IPItem intPropId={BigInt(id)} />
  )
}

export default IP;
