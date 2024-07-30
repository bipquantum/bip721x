import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";

module {

  public func fromPrincipal(principal: Principal) : Blob {
    let blob_principal = Blob.toArray(Principal.toBlob(principal));
    // According to IC interface spec: "As far as most uses of the IC are concerned they are
    // opaque binary blobs with a length between 0 and 29 bytes"
    if (blob_principal.size() > 32) {
      Debug.trap("Cannot convert principal to subaccount: principal length is greater than 32 bytes");
    };
    let buffer = Buffer.Buffer<Nat8>(32);
    buffer.append(Buffer.fromArray(blob_principal));
    finalizeSubaccount(buffer);
  };

  func finalizeSubaccount(buffer : Buffer.Buffer<Nat8>) : Blob {
    // Add padding until 32 bytes
    while(buffer.size() < 32) {
      buffer.add(0);
    };
    // Verify the buffer is 32 bytes
    assert(buffer.size() == 32);
    // Return the buffer as a blob
    Blob.fromArray(Buffer.toArray(buffer));
  };

};