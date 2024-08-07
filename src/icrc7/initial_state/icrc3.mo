import ICRC3 "mo:icrc3-mo";

module{

  // TODO sardariuss 2024-08-07: verify parameters
  public let defaultConfig = func(_: Principal) : ICRC3.InitArgs {
    ?{
      maxActiveRecords = 4000;
      settleToRecords = 2000;
      maxRecordsInArchiveInstance = 5_000_000;
      maxArchivePages  = 62500; //allows up to 993 bytes per record
      archiveIndexType = #Stable;
      maxRecordsToArchive = 10_000;
      archiveCycles = 2_000_000_000_000; //two trillion
      archiveControllers = null;
      supportedBlocks = [];
    }
  };
};