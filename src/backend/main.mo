import Map "mo:core/Map";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Note = {
    title : Text;
    content : Text;
    createdAt : Int;
    lastModified : Int;
    selfDestructAt : ?Int;
  };

  public type UserProfile = {
    name : Text;
    isFirstTimeUser : Bool;
    muteGreeting : Bool;
  };

  public type ExtendedNote = {
    title : Text;
    content : Text;
    createdAt : Int;
    lastModified : Int;
    selfDestructAt : ?Int;
    imagePath : ?Storage.ExternalBlob;
  };

  module Note {
    public func compare(n1 : Note, n2 : Note) : Order.Order {
      switch (Text.compare(n1.title, n2.title)) {
        case (#equal) { Text.compare(n1.content, n2.content) };
        case (order) { order };
      };
    };

    public func compareByLastModified(note1 : Note, note2 : Note) : Order.Order {
      Int.compare(note1.lastModified, note2.lastModified);
    };
  };

  let userNotes = Map.empty<Principal, Map.Map<Text, Note>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userExtendedNotes = Map.empty<Principal, Map.Map<Text, ExtendedNote>>();

  // ShareLink type
  public type ShareLink = {
    encryptedNote : Blob;
    nonce : Blob;
    createdAt : Int;
    expiresAt : ?Int;
    viewOnce : Bool;
    hasBeenAccessed : Bool;
  };

  // Share links map
  let shareLinks = Map.empty<Text, ShareLink>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func markWelcomePopupSeen() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          isFirstTimeUser = false;
          muteGreeting = profile.muteGreeting;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func setMuteGreetingPreference(mute : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update preferences");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          isFirstTimeUser = profile.isFirstTimeUser;
          muteGreeting = mute;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMuteGreetingPreference() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access preferences");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile.muteGreeting };
    };
  };

  // Note Management Functions
  public shared ({ caller }) func createNote(title : Text, content : Text, selfDestructAt : ?Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create notes");
    };

    let currentTime = Time.now();

    let notes = switch (userNotes.get(caller)) {
      case (null) {
        let newNotes = Map.empty<Text, Note>();
        userNotes.add(caller, newNotes);
        newNotes;
      };
      case (?existingNotes) { existingNotes };
    };

    let newNote : Note = {
      title;
      content;
      createdAt = currentTime;
      lastModified = currentTime;
      selfDestructAt;
    };

    notes.add(title, newNote);
  };

  public query ({ caller }) func getNote(title : Text) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access notes");
    };

    switch (userNotes.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Note not found") };
          case (?note) { note };
        };
      };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access notes");
    };

    switch (userNotes.get(caller)) {
      case (null) { [] };
      case (?notes) { notes.values().toArray() };
    };
  };

  public shared ({ caller }) func updateNote(title : Text, newContent : Text, newSelfDestructAt : ?Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update notes");
    };

    switch (userNotes.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Note not found") };
          case (?existingNote) {
            let updatedNote : Note = {
              title = existingNote.title;
              content = newContent;
              createdAt = existingNote.createdAt;
              lastModified = Time.now();
              selfDestructAt = newSelfDestructAt;
            };
            notes.add(title, updatedNote);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteNote(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete notes");
    };

    switch (userNotes.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?notes) {
        if (notes.containsKey(title)) {
          notes.remove(title);
        } else {
          Runtime.trap("Note not found");
        };
      };
    };
  };

  public query ({ caller }) func searchNotes(searchTerm : Text) : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search notes");
    };

    switch (userNotes.get(caller)) {
      case (null) { [] };
      case (?notes) {
        let filteredNotes = notes.values().toArray().filter(
          func(note) {
            note.title.contains(#text searchTerm) or note.content.contains(#text searchTerm)
          }
        );
        filteredNotes;
      };
    };
  };

  public shared ({ caller }) func setSelfDestructTimer(title : Text, durationSeconds : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set self-destruct timers");
    };

    let now = Time.now();
    let expirationTime = now + (durationSeconds * 1_000_000_000);

    switch (userNotes.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Note not found") };
          case (?existingNote) {
            let updatedNote : Note = {
              title = existingNote.title;
              content = existingNote.content;
              createdAt = existingNote.createdAt;
              lastModified = existingNote.lastModified;
              selfDestructAt = ?expirationTime;
            };
            notes.add(title, updatedNote);
          };
        };
      };
    };
  };

  // Extended Note Management Functions
  public type ExtendedNoteInput = {
    title : Text;
    content : Text;
    selfDestructAt : ?Int;
    imagePath : ?Storage.ExternalBlob;
  };

  public shared ({ caller }) func createExtendedNote(noteInput : ExtendedNoteInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create extended notes");
    };

    let currentTime = Time.now();
    let notes = switch (userExtendedNotes.get(caller)) {
      case (null) {
        let map = Map.empty<Text, ExtendedNote>();
        userExtendedNotes.add(caller, map);
        map;
      };
      case (?notes) { notes };
    };

    let newNote : ExtendedNote = {
      title = noteInput.title;
      content = noteInput.content;
      createdAt = currentTime;
      lastModified = currentTime;
      selfDestructAt = noteInput.selfDestructAt;
      imagePath = noteInput.imagePath;
    };

    notes.add(noteInput.title, newNote);
  };

  public query ({ caller }) func getExtendedNote(title : Text) : async ExtendedNote {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access extended notes");
    };

    switch (userExtendedNotes.get(caller)) {
      case (null) { Runtime.trap("No extended notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Extended note not found") };
          case (?note) { note };
        };
      };
    };
  };

  public query ({ caller }) func getAllExtendedNotes() : async [ExtendedNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access extended notes");
    };

    switch (userExtendedNotes.get(caller)) {
      case (null) { [] };
      case (?notes) { notes.values().toArray() };
    };
  };

  public shared ({ caller }) func updateExtendedNote(
    title : Text,
    newContent : Text,
    newSelfDestructAt : ?Int,
    newImagePath : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update extended notes");
    };

    switch (userExtendedNotes.get(caller)) {
      case (null) { Runtime.trap("No extended notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Extended note not found") };
          case (?existingNote) {
            let updatedNote : ExtendedNote = {
              title = existingNote.title;
              content = newContent;
              createdAt = existingNote.createdAt;
              lastModified = Time.now();
              selfDestructAt = newSelfDestructAt;
              imagePath = newImagePath;
            };
            notes.add(title, updatedNote);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteExtendedNote(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete extended notes");
    };

    switch (userExtendedNotes.get(caller)) {
      case (null) { Runtime.trap("No extended notes found") };
      case (?notes) {
        if (notes.containsKey(title)) {
          notes.remove(title);
        } else {
          Runtime.trap("Extended note not found");
        };
      };
    };
  };

  public query ({ caller }) func searchExtendedNotes(searchTerm : Text) : async [ExtendedNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search extended notes");
    };

    switch (userExtendedNotes.get(caller)) {
      case (null) { [] };
      case (?notes) {
        let filteredNotes = notes.values().toArray().filter(
          func(note) {
            note.title.contains(#text searchTerm) or note.content.contains(#text searchTerm)
          }
        );
        filteredNotes;
      };
    };
  };

  public shared ({ caller }) func setExtendedNoteSelfDestructTimer(title : Text, durationSeconds : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set self-destruct timers for extended notes");
    };

    let currentTime = Time.now();
    let expirationTime : ?Int = ?(currentTime + (durationSeconds * 1_000_000_000));

    switch (userExtendedNotes.get(caller)) {
      case (null) { Runtime.trap("No extended notes found") };
      case (?notes) {
        switch (notes.get(title)) {
          case (null) { Runtime.trap("Extended note not found") };
          case (?existingNote) {
            let updatedNote = { existingNote with selfDestructAt = expirationTime };
            notes.add(title, updatedNote);
          };
        };
      };
    };
  };

  // System/Admin Functions with proper authorization
  public shared ({ caller }) func extendedNoteCleanup() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can trigger extended note cleanup");
    };

    let now = Time.now();

    userExtendedNotes.forEach(
      func(_userId, notes) {
        let expiredNotes = notes.filter(
          func(_title, note) {
            switch (note.selfDestructAt) {
              case (null) { false };
              case (?expiry) { expiry <= now };
            };
          }
        );

        expiredNotes.forEach(
          func(title, _note) {
            notes.remove(title);
          }
        );
      }
    );
  };

  public shared ({ caller }) func deleteAllExpiredExtendedNotes() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete expired extended notes");
    };

    let now = Time.now();
    userExtendedNotes.forEach(
      func(_userId, notes) {
        notes.filter(
          func(_title, note) {
            switch (note.selfDestructAt) {
              case (null) { false };
              case (?expiry) { expiry <= now };
            };
          }
        ).forEach(
            func(title, _note) {
              notes.remove(title);
            }
          );
      }
    );
  };

  // Share link functions - FIXED AUTHORIZATION
  // Creating a share link requires authentication (only users can create)
  public shared ({ caller }) func createShareLink(encryptedNote : Blob, nonce : Blob, expiresAt : ?Int, viewOnce : Bool) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create share links");
    };

    let shareId = Time.now().toText();
    let shareLink : ShareLink = {
      encryptedNote;
      nonce;
      createdAt = Time.now();
      expiresAt;
      viewOnce;
      hasBeenAccessed = false;
    };
    shareLinks.add(shareId, shareLink);
    shareId;
  };

  // Opening a share link is PUBLIC - anyone with the link (including guests) can open it
  // This is intentional: the security model is that the link itself (with decryption key in hash)
  // is the authorization token. The backend only stores encrypted data.
  public shared ({ caller }) func openShareLink(shareId : Text) : async (Blob, Blob) {
    // NO AUTHORIZATION CHECK - Public access by design
    // The decryption key is in the URL hash (client-side only), so backend data is secure

    switch (shareLinks.get(shareId)) {
      case (null) { Runtime.trap("Share link not found") };
      case (?shareLink) {
        // Check expiration
        switch (shareLink.expiresAt) {
          case (null) {};
          case (?expiry) {
            if (Time.now() > expiry) {
              shareLinks.remove(shareId);
              Runtime.trap("Share link expired");
            };
          };
        };

        // Check view-once
        if (shareLink.viewOnce) {
          // Check if already accessed
          if (shareLink.hasBeenAccessed) {
            Runtime.trap("This is a view-once link and has expired");
          } else {
            // Mark as accessed and remove
            shareLinks.remove(shareId);
          };
        };

        (shareLink.encryptedNote, shareLink.nonce);
      };
    };
  };

  // Cleanup is admin-only
  public shared ({ caller }) func cleanupExpiredShareLinks() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can cleanup expired share links");
    };

    let now = Time.now();
    let expiredLinks = shareLinks.size();

    if (expiredLinks > 0) {
      let validLinks = shareLinks.filter(
        func(_id, link) {
          switch (link.expiresAt) {
            case (null) { true };
            case (?expiry) { expiry > now };
          };
        }
      );
      shareLinks.clear();
      validLinks.forEach(func(id, link) { shareLinks.add(id, link) });
    };
  };

  public shared ({ caller }) func migrate() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can trigger migration");
    };
  };
};
