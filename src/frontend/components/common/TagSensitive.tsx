import { Principal } from "@dfinity/principal";
import { backendActor } from "../actors/BackendActor";
import VioletButton from "./VioletButton";

interface TagSensitiveProps {
  principal: Principal | undefined;
  intPropId: bigint;
};

const TagSensitive : React.FC<TagSensitiveProps> = ({ principal, intPropId }) => {

  const { data: admin } = backendActor.useQueryCall({
    functionName: "get_admin",
    args: [],
  });

  const { data: moderators } = backendActor.useQueryCall({
    functionName: "get_moderators",
    args: [],
  });

  const { data: sensitive, call: getSensitive } = backendActor.useQueryCall({
    functionName: "is_sensitive_int_prop",
    args: [{ id: intPropId }],
  });

  const { call: tagSensitive, loading } = backendActor.useUpdateCall({
    functionName: "tag_sensitive_int_prop",
  });

  return (
    principal === undefined || admin === undefined || moderators === undefined || sensitive === undefined ? (
      <div
        className="text-center text-white"
        style={{
          padding: "100px",
        }}
      >
        Loading...
      </div>
    ) : principal === admin || moderators.find((moderator) => moderator.compareTo(principal) === "eq") ? (
      <VioletButton
        onClick={() => { tagSensitive([{ id: intPropId, sensitive: !sensitive }]).then(() => getSensitive()); }}
        isLoading={loading}
      >
        {`${sensitive ? "Untag Sensitive" : "Tag Sensitive"} 👁️`}
      </VioletButton>
    ) : (
      <></>
    )
  )
}

export default TagSensitive;