import { Principal } from "@dfinity/principal";
import WithHistory from "./WithHistory";
import { useParams } from "react-router-dom";

interface WithHistoryWrapperProps {
  principal: Principal | undefined;
}

const WithHistoryWrapper: React.FC<WithHistoryWrapperProps> = ({ principal }) => {

  let { chatId } = useParams();

  return (
    chatId === undefined ? 
    <div>Loading...</div> :
    <WithHistory principal={principal} chatId={chatId}/>
  );
}

export default WithHistoryWrapper;