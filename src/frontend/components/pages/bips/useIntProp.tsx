import { useEffect, useMemo } from "react";
import { backendActor } from "../../actors/BackendActor";
import { useActors } from "../../common/ActorsContext";

export function useIntProp(intPropId: bigint | undefined) {

  const { unauthenticated, authenticated } = useActors();

  const { data: unauthIntProp, call: refreshUnauthIntProp } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_int_prop",
    args: intPropId !== undefined ? [{ token_id: intPropId }] : undefined,
  });

  const { data: authIntProp, call: refreshAuthIntProp } = backendActor.authenticated.useQueryCall({
    functionName: "get_int_prop",
    args: intPropId !== undefined ? [{ token_id: intPropId }] : undefined,
  });

  useEffect(() => {
    refreshUnauthIntProp();
    refreshAuthIntProp();
  }, [intPropId]);

  useEffect(() => {
    refreshUnauthIntProp();
  }, [unauthenticated]);

  useEffect(() => {
    refreshAuthIntProp();
  }, [authenticated]);

  const intProp = useMemo(() => {
    if (authIntProp !== undefined) {
      return authIntProp;
    }
    return unauthIntProp;
  }, [authIntProp, unauthIntProp]);

  return intProp;
}