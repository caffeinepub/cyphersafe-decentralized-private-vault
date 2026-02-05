import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldNote = {
    title : Text;
    content : Text;
    createdAt : Int;
    lastModified : Int;
    selfDestructAt : ?Int;
  };

  type OldUserProfile = {
    name : Text;
    isFirstTimeUser : Bool;
    muteGreeting : Bool;
  };

  type OldExtendedNote = {
    title : Text;
    content : Text;
    createdAt : Int;
    lastModified : Int;
    selfDestructAt : ?Int;
    imagePath : ?Storage.ExternalBlob;
  };

  type OldActor = {
    userNotes : Map.Map<Principal, Map.Map<Text, OldNote>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userExtendedNotes : Map.Map<Principal, Map.Map<Text, OldExtendedNote>>;
  };

  type NewShareLink = {
    encryptedNote : Blob;
    nonce : Blob;
    createdAt : Int;
    expiresAt : ?Int;
    viewOnce : Bool;
    hasBeenAccessed : Bool;
  };

  type NewActor = {
    userNotes : Map.Map<Principal, Map.Map<Text, OldNote>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userExtendedNotes : Map.Map<Principal, Map.Map<Text, OldExtendedNote>>;
    shareLinks : Map.Map<Text, NewShareLink>;
  };

  public func run(old : OldActor) : NewActor {
    { old with shareLinks = Map.empty<Text, NewShareLink>() };
  };
};
