import { useChatConnection } from "./ChatConnectionContext";

const ConnectionStatusIndicator = () => {
  const { connectionState, getStatusIcon, getStatusColor } = useChatConnection();

  return (
    <div className={`flex items-center justify-center ${getStatusColor()}`} title={connectionState.status}>
      <span className="text-xl">{getStatusIcon()}</span>
    </div>
  );
};

export default ConnectionStatusIndicator;
