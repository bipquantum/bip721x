import { useQueryCall } from '../hooks/useQueryCall';
import { useUpdateCall } from '../hooks/useUpdateCall';
import { Backend } from "../../../declarations/backend/backend.did";

export type { Backend };

// Compatibility layer that mimics the ic-reactor backendActor API with full type safety
export const backendActor = {
  useQueryCall: useQueryCall,
  useUpdateCall: useUpdateCall
};

// Legacy export for backwards compatibility
export const BackendActorProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
