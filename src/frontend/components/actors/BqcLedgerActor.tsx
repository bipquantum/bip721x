import { createActorContext }            from "@ic-reactor/react"
import { bqc_ledger, canisterId, idlFactory } from "../../../declarations/bqc_ledger"

export type BqcLedger = typeof bqc_ledger

export const { ActorProvider: BqcLedgerActorProvider, ...bqcLedgerActor } = createActorContext<BqcLedger>({
  canisterId,
  idlFactory,
})
