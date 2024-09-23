import { createActorContext }            from "@ic-reactor/react"
import { icrc7, canisterId, idlFactory } from "../../../declarations/icrc7"

export type Icrc7 = typeof icrc7

export const { ActorProvider: Icrc7ActorProvider, ...icrc7Actor } = createActorContext<Icrc7>({
  canisterId,
  idlFactory,
})
