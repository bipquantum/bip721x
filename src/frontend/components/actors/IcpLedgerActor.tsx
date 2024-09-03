import { createActorContext }              from "@ic-reactor/react"
import { icp_ledger, canisterId, idlFactory } from "../../../declarations/icp_ledger"

export type IcpLedger = typeof icp_ledger

export const { ActorProvider: IcpLedgerActorProvider, ...icpLedgerActor } = createActorContext<IcpLedger>({
  canisterId,
  idlFactory,
})
