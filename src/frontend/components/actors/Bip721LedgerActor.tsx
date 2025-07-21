import { createActorContext } from "@ic-reactor/react";
import {
  bip721_ledger,
  canisterId,
  idlFactory,
} from "../../../declarations/bip721_ledger";

export type Bip721Ledger = typeof bip721_ledger;

export const {
  ActorProvider: Bip721LedgerActorProvider,
  ...bip721LedgerActor
} = createActorContext<Bip721Ledger>({
  canisterId,
  idlFactory,
});
