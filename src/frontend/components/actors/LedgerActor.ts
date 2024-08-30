import {
  canisterId,
  idlFactory,
  icp_ledger,
} from "../../../declarations/icp_ledger";
import { createActorContext } from "@ic-reactor/react";

type IcpLedger = typeof icp_ledger;

export const { ActorProvider: LedgerActorProvider, ...ledgerActor } =
  createActorContext<IcpLedger>({
    canisterId,
    idlFactory,
  });
