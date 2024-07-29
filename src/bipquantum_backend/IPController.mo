import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import List "mo:base/List";
import Types "./types";

module {
  public class IPController(index: Nat, IPList: HashMap.HashMap<Nat, Types.IPEntryType>) {
    type IPEntryType = Types.IPEntryType;

    public func createIP(ipEntryInput: Types.IPEntryInputType, callerId : Principal, index: Nat): async ?Nat {

        let id : Nat = index;
        var ipEntryToBeCreated = {
        id = id;
        title = ipEntryInput.title;
        description = ipEntryInput.description;
        ipType = ipEntryInput.ipType;
        ipLicense = ipEntryInput.ipLicense;
        ipPrice = ipEntryInput.ipPrice;
        ipPriceCurrency = ipEntryInput.ipPriceCurrency;
        createdBy = callerId;
        };

        IPList.put(id, ipEntryToBeCreated);

        return ?ipEntryToBeCreated.id;
    };

    public func getIPByID(id: Nat): async ?Types.IPEntryType {
      return IPList.get(id);
    };

    public func getAllIPs(): async [Types.IPEntryType] {
        // Create an empty list to store entries
        var allEntries : List.List<IPEntryType> = List.nil();

        // Iterate through all key-value pairs in the HashMap using entries
        for ((key, value) in IPList.entries()) {
        allEntries := List.push(value, allEntries);
        };

        // Return the list of all entries
        return List.toArray(allEntries);
    };

    public func deleteIP(id: Nat, callerId : Principal): async Result.Result<?Types.IPEntryType, Types.ERROR_ENUM> {
        // Reject AnonymousIdentity
        if (Principal.toText(callerId) == "2vxsx-fae") {
        return #err(#NotAuthorized);
        };

        let maybeEntry = IPList.get(id);
        switch (maybeEntry) {
        case null {
            return #ok(null);
        };
        case (?entry) {
            // Check if caller is the creator before deleting
            if (entry.createdBy != callerId) {
            return #err(#NotAuthorized);
            };
            IPList.delete(id);
            return #ok(?entry);
        };
        };
    };

    public shared (caller) func updateIP(
      id: Nat,
      callerId : Principal,
      newTitle: ?Text,
      newDescription: ?Text,
      ipType: ?Types.IP_TYPE_ENUM,
      ipLicense: ?Types.IP_LICENSES_TYPE_ENUM,
      ipPrice: ?Float,
      ipPriceCurrency: ?Text
    ): async Result.Result<?Types.IPEntryType, Types.ERROR_ENUM> {
        

        // Reject AnonymousIdentity
        if (Principal.toText(callerId) == "2vxsx-fae") {
        return #err(#NotAuthorized);
        };

        let maybeEntry = IPList.get(id);
        switch (maybeEntry) {
        case null {
            return #ok(null);
        };
        case (?entry) {
            // Check if caller is the creator before updating
            if (entry.createdBy != caller.caller) {
            return #err(#NotAuthorized);
            };

            let updatedTitle = switch newTitle {
            case null { entry.title };
            case (?title) { title };
            };

            let updatedDescription = switch newDescription {
            case null { entry.description };
            case (?description) { description };
            };

            let updatedIPType = switch ipType {
            case null { entry.ipType };
            case (?ipType) { ipType };
            };

            let updatedIPLicense = switch ipLicense {
            case null { entry.ipLicense };
            case (?ipLicense) { ipLicense };
            };

            let updatedIPPriceCurrency = switch ipPriceCurrency {
            case null { entry.ipPriceCurrency };
            case (?ipPriceCurrency) { ipPriceCurrency };
            };

            let updatedIPPrice = switch ipPrice {
            case null { entry.ipPrice };
            case (?ipPrice) { ipPrice };
            };

            let updatedEntry : IPEntryType = {
            id = id;
            title = updatedTitle;
            description = updatedDescription;
            ipType = updatedIPType;
            ipLicense = updatedIPLicense;
            ipPrice = updatedIPPrice;
            ipPriceCurrency = updatedIPPriceCurrency;
            createdBy = entry.createdBy;
            };
            IPList.put(id, updatedEntry);
            return #ok(?updatedEntry);
        };
        };
    };
  }
}
