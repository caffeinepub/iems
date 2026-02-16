import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Profile {
    public type Profile = {
      name : Text;
      phone : Text;
      address : Text;
      role : Text; // "Student", "Teacher", "NonTeachingStaff", "Chairperson"
    };

    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };

    public type ProfileHistory = {
      current : Profile;
      previous : ?Profile;
    };
  };

  module Attendance {
    public type AttendanceHistory = {
      current : Bool;
      previous : ?Bool;
    };
  };

  module Homework {
    public type HomeworkEntry = {
      title : Text;
      description : Text;
      dueDate : Text;
    };

    public type HomeworkHistory = {
      current : HomeworkEntry;
      previous : ?HomeworkEntry;
    };
  };

  module Fee {
    public type Fee = {
      amount : Nat;
      status : Text; // "pending", "paid", "advance"
    };

    public type FeeHistory = {
      current : Fee;
      previous : ?Fee;
    };
  };

  module Message {
    public type Message = {
      sender : Text;
      content : Text;
      timestamp : Nat;
      recipients : [Text]; // "all", "students", "teachers", or specific phones
    };

    public type MessageHistory = {
      current : Message;
      previous : ?Message;
    };

    public func compareByTimestamp(m1 : Message, m2 : Message) : Order.Order {
      Nat.compare(m1.timestamp, m2.timestamp);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  let profiles = Map.empty<Text, Profile.ProfileHistory>();
  let principalToPhone = Map.empty<Principal, Text>();
  let attendance = Map.empty<Text, Map.Map<Text, Attendance.AttendanceHistory>>();
  let homework = Map.empty<Text, Homework.HomeworkHistory>();
  let fees = Map.empty<Text, Fee.FeeHistory>();
  let messages = Map.empty<Text, Message.MessageHistory>();
  let teacherClassAssignments = Map.empty<Text, Text>(); // teacher phone -> classId
  let formTeachers = Map.empty<Text, Text>(); // classId -> teacher phone

  include MixinAuthorization(accessControlState);

  // Helper functions
  func getCallerPhone(caller : Principal) : ?Text {
    principalToPhone.get(caller);
  };

  func getCallerProfile(caller : Principal) : ?Profile.Profile {
    switch (getCallerPhone(caller)) {
      case (null) { null };
      case (?phone) {
        switch (profiles.get(phone)) {
          case (null) { null };
          case (?history) { ?history.current };
        };
      };
    };
  };

  func isChairperson(caller : Principal) : Bool {
    switch (getCallerProfile(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "Chairperson" };
    };
  };

  func isTeacher(caller : Principal) : Bool {
    switch (getCallerProfile(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "Teacher" };
    };
  };

  func isFormTeacher(caller : Principal, classId : Text) : Bool {
    switch (getCallerPhone(caller)) {
      case (null) { false };
      case (?phone) {
        switch (formTeachers.get(classId)) {
          case (null) { false };
          case (?formTeacherPhone) { phone == formTeacherPhone };
        };
      };
    };
  };

  func isAssignedToClass(caller : Principal, classId : Text) : Bool {
    switch (getCallerPhone(caller)) {
      case (null) { false };
      case (?phone) {
        switch (teacherClassAssignments.get(phone)) {
          case (null) { false };
          case (?assignedClass) { assignedClass == classId };
        };
      };
    };
  };

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?Profile.Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    getCallerProfile(caller);
  };

  public query ({ caller }) func getUserProfile(phone : Text) : async ?Profile.Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    // Chairperson can view any profile
    if (isChairperson(caller)) {
      switch (profiles.get(phone)) {
        case (?history) { return ?history.current };
        case (null) { return null };
      };
    };

    // Users can only view their own profile
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
        switch (profiles.get(phone)) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      };
    };
  };

  public query ({ caller }) func getProfile(phone : Text) : async ?Profile.Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    // Chairperson can view any profile
    if (isChairperson(caller)) {
      switch (profiles.get(phone)) {
        case (?history) { return ?history.current };
        case (null) { return null };
      };
    };

    // Users can only view their own profile
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
        switch (profiles.get(phone)) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile.Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    // Users can only update their own profile
    switch (getCallerPhone(caller)) {
      case (null) {
        // First time profile creation - link principal to phone
        principalToPhone.add(caller, profile.phone);
      };
      case (?callerPhone) {
        if (callerPhone != profile.phone) {
          Runtime.trap("Unauthorized: Cannot change phone number");
        };
      };
    };

    let existing = profiles.get(profile.phone);
    profiles.add(
      profile.phone,
      {
        current = profile;
        previous = switch (existing) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      },
    );
  };

  public shared ({ caller }) func updateProfile(profile : Profile.Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };

    // Chairperson cannot edit user profiles
    if (isChairperson(caller)) {
      Runtime.trap("Unauthorized: Chairperson cannot edit user profiles");
    };

    // Users can only update their own profile
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != profile.phone) {
          Runtime.trap("Unauthorized: Can only update your own profile");
        };

        let existing = profiles.get(profile.phone);
        profiles.add(
          profile.phone,
          {
            current = profile;
            previous = switch (existing) {
              case (?history) { ?history.current };
              case (null) { null };
            };
          },
        );
      };
    };
  };

  // Teacher-Class Assignment Management
  public shared ({ caller }) func assignTeacherToClass(teacherPhone : Text, classId : Text) : async () {
    if (not isChairperson(caller)) {
      Runtime.trap("Unauthorized: Only Chairperson can assign teachers to classes");
    };

    teacherClassAssignments.add(teacherPhone, classId);
  };

  public shared ({ caller }) func assignFormTeacher(classId : Text, teacherPhone : Text) : async () {
    if (not isChairperson(caller)) {
      Runtime.trap("Unauthorized: Only Chairperson can assign form teachers");
    };

    formTeachers.add(classId, teacherPhone);
  };

  // Attendance Management
  public shared ({ caller }) func markAttendance(classId : Text, studentPhone : Text, present : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark attendance");
    };

    // Only form teacher can mark attendance for their class
    if (not isFormTeacher(caller, classId)) {
      Runtime.trap("Unauthorized: Only the form teacher can mark attendance for this class");
    };

    let classAttendance = switch (attendance.get(classId)) {
      case (null) { Map.empty<Text, Attendance.AttendanceHistory>() };
      case (?existing) { existing };
    };

    let existing = classAttendance.get(studentPhone);
    classAttendance.add(
      studentPhone,
      {
        current = present;
        previous = switch (existing) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      },
    );

    attendance.add(classId, classAttendance);
  };

  public query ({ caller }) func getAttendance(classId : Text, studentPhone : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };

    // Chairperson can view all attendance
    if (isChairperson(caller)) {
      switch (attendance.get(classId)) {
        case (null) { return false };
        case (?classAttendance) {
          switch (classAttendance.get(studentPhone)) {
            case (null) { return false };
            case (?history) { return history.current };
          };
        };
      };
    };

    // Teachers can view attendance for their assigned class
    if (isTeacher(caller) and isAssignedToClass(caller, classId)) {
      switch (attendance.get(classId)) {
        case (null) { return false };
        case (?classAttendance) {
          switch (classAttendance.get(studentPhone)) {
            case (null) { return false };
            case (?history) { return history.current };
          };
        };
      };
    };

    // Students can view their own attendance
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != studentPhone) {
          Runtime.trap("Unauthorized: Can only view your own attendance");
        };
        switch (attendance.get(classId)) {
          case (null) { false };
          case (?classAttendance) {
            switch (classAttendance.get(studentPhone)) {
              case (null) { false };
              case (?history) { history.current };
            };
          };
        };
      };
    };
  };

  // Homework Management
  public shared ({ caller }) func addHomework(classId : Text, entry : Homework.HomeworkEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add homework");
    };

    // Only teachers assigned to the class can add homework
    if (not isTeacher(caller)) {
      Runtime.trap("Unauthorized: Only teachers can add homework");
    };

    if (not isAssignedToClass(caller, classId)) {
      Runtime.trap("Unauthorized: Can only add homework for your assigned class");
    };

    let existing = homework.get(classId);
    homework.add(
      classId,
      {
        current = entry;
        previous = switch (existing) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      },
    );
  };

  public query ({ caller }) func getHomework(classId : Text) : async ?Homework.HomeworkEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view homework");
    };

    // Chairperson, teachers of the class, and students can view homework
    if (isChairperson(caller) or (isTeacher(caller) and isAssignedToClass(caller, classId))) {
      switch (homework.get(classId)) {
        case (null) { return null };
        case (?history) { return ?history.current };
      };
    };

    // Students can view homework for their class (assuming student profile contains class info)
    switch (homework.get(classId)) {
      case (null) { null };
      case (?history) { ?history.current };
    };
  };

  public shared ({ caller }) func deleteHomework(classId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete homework");
    };

    // Only teachers assigned to the class can delete homework
    if (not isTeacher(caller)) {
      Runtime.trap("Unauthorized: Only teachers can delete homework");
    };

    if (not isAssignedToClass(caller, classId)) {
      Runtime.trap("Unauthorized: Can only delete homework for your assigned class");
    };

    let _ = homework.remove(classId);
  };

  // Fee Management
  public shared ({ caller }) func updateFee(phone : Text, fee : Fee.Fee) : async () {
    if (not isChairperson(caller)) {
      Runtime.trap("Unauthorized: Only Chairperson can approve and update fees");
    };

    let existing = fees.get(phone);
    fees.add(
      phone,
      {
        current = fee;
        previous = switch (existing) {
          case (?history) { ?history.current };
          case (null) { null };
        };
      },
    );
  };

  public query ({ caller }) func getFees(phone : Text) : async ?Fee.Fee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fees");
    };

    // Chairperson can view all fees
    if (isChairperson(caller)) {
      switch (fees.get(phone)) {
        case (null) { return null };
        case (?history) { return ?history.current };
      };
    };

    // Users can only view their own fees
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: Can only view your own fees");
        };
        switch (fees.get(phone)) {
          case (null) { null };
          case (?history) { ?history.current };
        };
      };
    };
  };

  // Messaging
  public shared ({ caller }) func sendMessage(message : Message.Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    // Chairperson can broadcast to all or selected groups
    if (isChairperson(caller)) {
      messages.add(
        message.timestamp.toText(),
        {
          current = message;
          previous = null;
        },
      );
      return;
    };

    // Teachers can send notices to students
    if (isTeacher(caller)) {
      messages.add(
        message.timestamp.toText(),
        {
          current = message;
          previous = null;
        },
      );
      return;
    };

    Runtime.trap("Unauthorized: Only Chairperson and Teachers can send messages");
  };

  public query ({ caller }) func getMessages() : async [Message.Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };

    // Filter messages based on caller's role and recipients
    let allMessages = messages.values().map(
        func(h : Message.MessageHistory) : Message.Message { h.current }
      ).toArray();

    // Chairperson can see all messages
    if (isChairperson(caller)) {
      return allMessages.sort<Message.Message>(Message.compareByTimestamp);
    };

    // Other users see messages intended for them
    switch (getCallerPhone(caller)) {
      case (null) { [] };
      case (?phone) {
        let filtered = allMessages.filter(
          func(msg : Message.Message) : Bool {
            msg.recipients.find<Text>(func(r : Text) : Bool { r == "all" or r == phone }) != null
          }
        );
        filtered.sort<Message.Message>(Message.compareByTimestamp);
      };
    };
  };

  // Undo Capability
  public shared ({ caller }) func undoProfile(phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can undo profile changes");
    };

    // Users can only undo their own profile changes
    switch (getCallerPhone(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?callerPhone) {
        if (callerPhone != phone) {
          Runtime.trap("Unauthorized: Can only undo your own profile changes");
        };

        switch (profiles.get(phone)) {
          case (null) { Runtime.trap("No previous profile state found") };
          case (?history) {
            switch (history.previous) {
              case (null) { Runtime.trap("No previous profile state found") };
              case (?previous) {
                profiles.add(
                  phone,
                  {
                    current = previous;
                    previous = ?history.current;
                  },
                );
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func undoAttendance(classId : Text, studentPhone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can undo attendance");
    };

    // Only form teacher can undo attendance for their class
    if (not isFormTeacher(caller, classId)) {
      Runtime.trap("Unauthorized: Only the form teacher can undo attendance for this class");
    };

    switch (attendance.get(classId)) {
      case (null) { Runtime.trap("No class attendance found") };
      case (?classAttendance) {
        switch (classAttendance.get(studentPhone)) {
          case (null) { Runtime.trap("No previous attendance state found") };
          case (?history) {
            switch (history.previous) {
              case (null) { Runtime.trap("No previous attendance state found") };
              case (?previous) {
                classAttendance.add(
                  studentPhone,
                  {
                    current = previous;
                    previous = ?history.current;
                  },
                );
                attendance.add(classId, classAttendance);
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func undoHomework(classId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can undo homework");
    };

    // Only teachers assigned to the class can undo homework
    if (not isTeacher(caller)) {
      Runtime.trap("Unauthorized: Only teachers can undo homework");
    };

    if (not isAssignedToClass(caller, classId)) {
      Runtime.trap("Unauthorized: Can only undo homework for your assigned class");
    };

    switch (homework.get(classId)) {
      case (null) { Runtime.trap("No homework found") };
      case (?history) {
        switch (history.previous) {
          case (null) { Runtime.trap("No previous homework state found") };
          case (?previous) {
            homework.add(
              classId,
              {
                current = previous;
                previous = ?history.current;
              },
            );
          };
        };
      };
    };
  };

  public shared ({ caller }) func undoFee(phone : Text) : async () {
    if (not isChairperson(caller)) {
      Runtime.trap("Unauthorized: Only Chairperson can undo fee changes");
    };

    switch (fees.get(phone)) {
      case (null) { Runtime.trap("No fee found") };
      case (?history) {
        switch (history.previous) {
          case (null) { Runtime.trap("No previous fee state found") };
          case (?previous) {
            fees.add(
              phone,
              {
                current = previous;
                previous = ?history.current;
              },
            );
          };
        };
      };
    };
  };

  // Utility Functions
  public query ({ caller }) func getAllProfiles() : async [Profile.Profile] {
    if (not isChairperson(caller)) {
      Runtime.trap("Unauthorized: Only Chairperson can view all profiles");
    };

    let profileArray = profiles.values().map(
        func(h : Profile.ProfileHistory) : Profile.Profile { h.current }
      ).toArray();
    profileArray.sort<Profile.Profile>();
  };
};
