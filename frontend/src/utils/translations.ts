import { Language } from '../types';

export interface TranslationSchema {
  // Common & Navigation
  common: {
    appName: string;
    appTagline: string;
    home: string;
    dashboard: string;
    myProfile: string;
    myQrCode: string;
    accessLogs: string;
    notifications: string;
    settings: string;
    logout: string;
    login: string;
    signup: string;
    save: string;
    saving: string;
    cancel: string;
    confirm: string;
    delete: string;
    deleting: string;
    edit: string;
    back: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    language: string;
    preferredLanguage: string;
    emergencySecondLanguage: string;
    secondLanguageNone: string;
    secondLanguageNotice: string;
  };
  // Auth (Login & Signup)
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    firstName: string;
    lastName: string;
    fullName: string;
    fullNameSecondary: string;
    fullNameSecondaryPlaceholder: string;
    email: string;
    emergencyNotificationEmail: string;
    emergencyNotificationEmailHelp: string;
    password: string;
    confirmPassword: string;
    agreeTerms: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    fillDemoAccount: string;
    orContinueWith: string;
    invalidEmailError: string;
    invalidEmergencyEmailError: string;
    passwordLengthError: string;
    passwordMismatchError: string;
    requiredFieldsError: string;
    agreeTermsError: string;
    loginSuccess: string;
    signupSuccess: string;
    selectUiLanguage: string;
    selectSecondLanguage: string;
    peaceOfMindTitle: string;
    peaceOfMindText: string;
  };
  // Dashboard Home
  dashboard: {
    welcomeBack: string;
    preparednessScore: string;
    preparednessActive: string;
    totalScans: string;
    thisMonthScans: string;
    qrStatus: string;
    activeStatus: string;
    revokedStatus: string;
    notGeneratedStatus: string;
    viewQr: string;
    generateQr: string;
    recentAccessActivity: string;
    noRecentScans: string;
    quickActions: string;
    editMedicalSnapshot: string;
    manageQrAndPrint: string;
    reviewAccessAudit: string;
    safetyChecklist: string;
    bloodGroupRecorded: string;
    emergencyContactActive: string;
    allergiesReviewed: string;
  };
  // Profile Management
  profile: {
    pageTitle: string;
    pageSubtitle: string;
    tabBasic: string;
    tabConditions: string;
    tabAllergies: string;
    tabMedications: string;
    tabContact: string;
    tabVisibility: string;
    age: string;
    bloodGroup: string;
    selectBloodGroup: string;
    conditionsTitle: string;
    conditionsSubtitle: string;
    addConditionPlaceholder: string;
    addConditionButton: string;
    noConditionsAdded: string;
    allergiesTitle: string;
    allergiesSubtitle: string;
    noKnownAllergiesCheckbox: string;
    addAllergyPlaceholder: string;
    addAllergyButton: string;
    medicationsTitle: string;
    medicationsSubtitle: string;
    medName: string;
    medDosage: string;
    medFrequency: string;
    addMedication: string;
    noMedicationsAdded: string;
    doctorDetails: string;
    doctorName: string;
    doctorContact: string;
    emergencyContactTitle: string;
    contactName: string;
    contactNameSecondary: string;
    contactRelationship: string;
    contactPhone: string;
    contactEmail: string;
    visibilityTitle: string;
    visibilitySubtitle: string;
    visibilityNotice: string;
    saveChanges: string;
    saveSuccess: string;
    showName: string;
    showAge: string;
    showBloodGroup: string;
    showAllergies: string;
    showMedications: string;
    showConditions: string;
    showDoctor: string;
    showContact: string;
  };
  // QR Management
  qr: {
    pageTitle: string;
    pageSubtitle: string;
    qrPreviewTitle: string;
    activeBanner: string;
    revokedBanner: string;
    generateQrButton: string;
    revokeQrButton: string;
    downloadPng: string;
    printPdfCard: string;
    downloadWallpaper: string;
    lockScreenPreview: string;
    howToUseTitle: string;
    walletCardInstruction: string;
    lockScreenInstruction: string;
    confirmRevokeTitle: string;
    confirmRevokeMessage: string;
    revokeWarning: string;
    copiedLink: string;
    copyLinkButton: string;
    regenerateNotice: string;
  };
  // Access Logs
  logs: {
    pageTitle: string;
    pageSubtitle: string;
    privacyNotice: string;
    totalScansLogged: string;
    timestamp: string;
    deviceCategory: string;
    browserFamily: string;
    status: string;
    statusSuccess: string;
    statusRevoked: string;
    noLogsYet: string;
  };
  // Notifications
  notifications: {
    pageTitle: string;
    pageSubtitle: string;
    sendTestAlert: string;
    sending: string;
    testAlertSent: string;
    allCaughtUp: string;
    noNotifications: string;
    alertRecipient: string;
    sentStatus: string;
    failedStatus: string;
  };
  // Settings
  settings: {
    pageTitle: string;
    pageSubtitle: string;
    accountDetails: string;
    accountName: string;
    accountEmail: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePasswordButton: string;
    languagePreferences: string;
    languagePreferencesSubtitle: string;
    dangerZone: string;
    dangerZoneSubtitle: string;
    deleteAccountButton: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: string;
  };
  // Public Emergency Page
  emergency: {
    emergencyHeader: string;
    emergencyNotice: string;
    callEmergencyContact: string;
    calling: string;
    bloodGroup: string;
    age: string;
    yearsOld: string;
    allergies: string;
    noKnownAllergies: string;
    allergiesNotProvided: string;
    medications: string;
    medicationsNotProvided: string;
    conditions: string;
    conditionsNotProvided: string;
    doctorDetails: string;
    doctorNotProvided: string;
    emergencyContact: string;
    contactNotProvided: string;
    privacyDisclaimer: string;
    viewAccessLog: string;
    scanAccessedAt: string;
    invalidTitle: string;
    invalidMessage: string;
    revokedTitle: string;
    revokedMessage: string;
    backToHome: string;
    demonstrationNotice: string;
    dosage: string;
    frequency: string;
    bilingualNotice: string;
  };
}

// Medical Terminology Dictionaries for bilingual mapping
export const CLINICAL_DICTIONARY: Record<string, { bn: string; hi: string }> = {
  // Conditions
  "Hypertension": { bn: "উচ্চ রক্তচাপ", hi: "उच्च रक्तचाप" },
  "Hypertension (Stage 2)": { bn: "উচ্চ রক্তচাপ (স্টেজ ২)", hi: "उच्च रक्तचाप (स्टेज २)" },
  "Type 2 Diabetes Mellitus": { bn: "টাইপ ২ ডায়াবেটিস মেলিটাস", hi: "टाइप २ डायबिटीज मेलिटस" },
  "Type 1 Diabetes": { bn: "টাইপ ১ ডায়াবেটিস", hi: "टाइप १ डायबिटीज" },
  "Asthma": { bn: "হাঁপানি / অ্যাজমা", hi: "दमा / अस्थमा" },
  "Coronary Artery Disease": { bn: "হৃদরোগ (করোনারি আর্টারি ডিজিজ)", hi: "हृदय रोग (कोरोनरी आर्टरी डिजीज)" },
  "Epilepsy": { bn: "মৃগীরোগ", hi: "मिर्गी" },
  "Chronic Kidney Disease": { bn: "ক্রনিক কিডনি রোগ", hi: "क्रॉनिक किडनी रोग" },
  "COPD": { bn: "সিওপিডি (ফুসফুসের রোগ)", hi: "सीओपीडी (फेफड़ों की बीमारी)" },
  "Hypothyroidism": { bn: "হাইপোথাইরয়েডিজম", hi: "हाइपोथायरायडिज्म" },

  // Allergies
  "Penicillin": { bn: "পেনিসিলিন", hi: "पेनिसिलिन" },
  "Penicillin (Severe rash)": { bn: "পেনিসিলিন (তীব্র র়্যাশ)", hi: "पेनिसिलिन (गंभीर चकत्ते)" },
  "Penicillin (Fictional Demo - Rash)": { bn: "পেনিসিলিন (র়্যাশ)", hi: "पेनिसिलिन (चकत्ते)" },
  "Peanuts": { bn: "চিনাবাদাম", hi: "मूंगफली" },
  "Peanuts (Anaphylaxis)": { bn: "চিনাবাদাম (অ্যানাফিল্যাক্সিস)", hi: "मूंगफली (एनाफिलेक्सिस)" },
  "Peanuts (Fictional Demo - Anaphylaxis)": { bn: "চিনাবাদাম (অ্যানাফিল্যাক্সিস)", hi: "मूंगफली (एनाफिलेक्सिस)" },
  "Sulfa Drugs": { bn: "সালফা ড্রাগস", hi: "सल्फा दवाएं" },
  "Aspirin": { bn: "অ্যাসপিরিন", hi: "एस्पिरिन" },
  "Shellfish": { bn: "শেলফিশ / চিংড়ি", hi: "शेलफिश / झींगा" },
  "Latex": { bn: "ল্যাটেক্স", hi: "लेटेक्स" },
  "Pollen": { bn: "পরাগরেণু", hi: "परागकण" },

  // Common Medications
  "Metformin": { bn: "মেটফর্মিন", hi: "मेटफॉर्मिन" },
  "Amlodipine": { bn: "অ্যামলোডিপাইন", hi: "एम्लोडिपिन" },
  "Atorvastatin": { bn: "অ্যাটোরভাস্ট্যাটিন", hi: "एटोरवास्टेटिन" },
  "Omeprazole": { bn: "ওমিপ্রাজল", hi: "ओमेप्राजोल" },
  "Losartan": { bn: "লোসার্টান", hi: "लोसार्टन" },
  "Paracetamol": { bn: "প্যারাসিটামল", hi: "पैरासिटामोल" },
  "Insulin": { bn: "ইনসুলিন", hi: "इंसुलिन" },

  // Dosages & Frequencies
  "Twice daily after meals": { bn: "দিনে দুইবার খাবারের পর", hi: "भोजन के बाद दिन में दो बार" },
  "Once daily in the morning": { bn: "প্রতিদিন সকালে একবার", hi: "रोजाना सुबह एक बार" },
  "Once daily at night": { bn: "প্রতিদিন রাতে একবার", hi: "रोजाना रात को एक बार" },
  "Once daily": { bn: "প্রতিদিন একবার", hi: "रोजाना एक बार" },
  "Twice daily": { bn: "দিনে দুইবার", hi: "दिन में दो बार" },
  "Three times daily": { bn: "দিনে তিনবার", hi: "दिन में तीन बार" },
  "As needed": { bn: "প্রয়োজন অনুসারে", hi: "जरूरत पड़ने पर" },

  // Relationships
  "Daughter": { bn: "কন্যা", hi: "बेटी" },
  "Son": { bn: "পুত্র", hi: "बेटा" },
  "Spouse": { bn: "স্ত্রী / স্বামী", hi: "जीवनसाथी" },
  "Wife": { bn: "স্ত্রী", hi: "पत्नी" },
  "Husband": { bn: "স্বামী", hi: "पति" },
  "Mother": { bn: "মাতা", hi: "माता" },
  "Father": { bn: "পিতা", hi: "पिता" },
  "Sister": { bn: "বোন", hi: "बहन" },
  "Brother": { bn: "ভাই", hi: "भाई" },
  "Friend": { bn: "বন্ধু", hi: "मित्र / दोस्त" },
  "Caregiver": { bn: "পরিচর্যাকারী / অভিভাবক", hi: "देखभालकर्ता" }
};

export const translateClinical = (term: string, targetLang?: Language): string | null => {
  if (!targetLang || targetLang === 'en') return null;
  const cleanTerm = (term || '').trim();
  if (CLINICAL_DICTIONARY[cleanTerm]) {
    return CLINICAL_DICTIONARY[cleanTerm][targetLang] || null;
  }
  // Try case-insensitive matching
  const lower = cleanTerm.toLowerCase();
  for (const [key, val] of Object.entries(CLINICAL_DICTIONARY)) {
    if (key.toLowerCase() === lower) {
      return val[targetLang] || null;
    }
  }
  return null;
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    common: {
      appName: "Medora",
      appTagline: "Emergency Medical ID",
      home: "Home",
      dashboard: "Dashboard",
      myProfile: "My Profile",
      myQrCode: "My QR Code",
      accessLogs: "Access Logs",
      notifications: "Notifications",
      settings: "Settings",
      logout: "Log Out",
      login: "Log In",
      signup: "Create Profile",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      deleting: "Deleting...",
      edit: "Edit",
      back: "Back",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      language: "Language",
      preferredLanguage: "Interface Language",
      emergencySecondLanguage: "Emergency Page Second Language",
      secondLanguageNone: "None (English Only)",
      secondLanguageNotice: "When a second language is chosen, emergency responders see both English and the selected language side by side."
    },
    auth: {
      loginTitle: "Log In to Medora",
      loginSubtitle: "Access your emergency safety profile and QR controls.",
      signupTitle: "Create Emergency ID",
      signupSubtitle: "Build a life-saving medical snapshot in 2 minutes.",
      firstName: "First Name",
      lastName: "Last Name",
      fullName: "Full Name",
      fullNameSecondary: "Name in Second Language (Optional)",
      fullNameSecondaryPlaceholder: "e.g. অনন্যা সেন / अनन्या सेन",
      email: "Account Email Address",
      emergencyNotificationEmail: "Emergency Notification Email",
      emergencyNotificationEmailHelp: "Where emergency scan alerts are delivered instantly (can belong to you, adult child, or caregiver).",
      password: "Password",
      confirmPassword: "Confirm Password",
      agreeTerms: "I agree to the privacy policy & medical demonstration terms.",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Need an emergency profile?",
      fillDemoAccount: "Fill Demo Account (Ananya Sen)",
      orContinueWith: "Or continue with demo",
      invalidEmailError: "Please enter a valid account email address.",
      invalidEmergencyEmailError: "Please enter a valid Emergency Notification Email address.",
      passwordLengthError: "Password must be at least 6 characters.",
      passwordMismatchError: "Passwords do not match.",
      requiredFieldsError: "Please fill in all required fields.",
      agreeTermsError: "Please agree to the privacy policy terms.",
      loginSuccess: "Welcome back!",
      signupSuccess: "Account created successfully! Your emergency profile is ready.",
      selectUiLanguage: "Preferred Interface Language",
      selectSecondLanguage: "Emergency Page Second Language (Optional)",
      peaceOfMindTitle: "Peace of Mind",
      peaceOfMindText: "Create a verified medical ID that first responders can access instantly via QR code."
    },
    dashboard: {
      welcomeBack: "Welcome back",
      preparednessScore: "Emergency Preparedness",
      preparednessActive: "Snapshot Active",
      totalScans: "Total Lifetime Scans",
      thisMonthScans: "Scans This Month",
      qrStatus: "QR Code Status",
      activeStatus: "Active & Scannable",
      revokedStatus: "Deactivated / Revoked",
      notGeneratedStatus: "Not Yet Generated",
      viewQr: "Manage QR Code",
      generateQr: "Generate QR Now",
      recentAccessActivity: "Recent Scan Audit",
      noRecentScans: "No recent scans recorded. Share your QR code or test scanning.",
      quickActions: "Quick Management",
      editMedicalSnapshot: "Edit Medical Profile",
      manageQrAndPrint: "Print Wallet Card & QR",
      reviewAccessAudit: "View Access Logs",
      safetyChecklist: "Profile Checklist",
      bloodGroupRecorded: "Blood Group Specified",
      emergencyContactActive: "Emergency Contact Configured",
      allergiesReviewed: "Allergies Confirmed"
    },
    profile: {
      pageTitle: "Medical Profile",
      pageSubtitle: "Manage the emergency health data visible to first responders.",
      tabBasic: "Basic Details",
      tabConditions: "Conditions",
      tabAllergies: "Allergies",
      tabMedications: "Medications",
      tabContact: "Contacts",
      tabVisibility: "Privacy Toggles",
      age: "Age",
      bloodGroup: "Blood Group",
      selectBloodGroup: "Select Blood Group",
      conditionsTitle: "Chronic & Pre-existing Conditions",
      conditionsSubtitle: "List active medical conditions paramedics should know about.",
      addConditionPlaceholder: "e.g. Hypertension (Stage 2)",
      addConditionButton: "Add Condition",
      noConditionsAdded: "No chronic conditions listed.",
      allergiesTitle: "Known Allergies & Drug Reactions",
      allergiesSubtitle: "Critical for preventing contraindicated treatments.",
      noKnownAllergiesCheckbox: "No Known Allergies (NKDA)",
      addAllergyPlaceholder: "e.g. Penicillin (Severe rash)",
      addAllergyButton: "Add Allergy",
      medicationsTitle: "Current Medications & Dosages",
      medicationsSubtitle: "Pharmaceuticals the patient is actively taking.",
      medName: "Medication Name",
      medDosage: "Dosage (e.g. 500 mg)",
      medFrequency: "Frequency (e.g. Twice daily)",
      addMedication: "Add Medication",
      noMedicationsAdded: "No current medications listed.",
      doctorDetails: "Attending Doctor / Physician",
      doctorName: "Doctor's Full Name",
      doctorContact: "Doctor's Phone Number",
      emergencyContactTitle: "Primary Emergency Contact",
      contactName: "Contact Full Name",
      contactNameSecondary: "Contact Name in Second Language (Optional)",
      contactRelationship: "Relationship (e.g. Daughter, Spouse)",
      contactPhone: "Contact Phone (Direct Dial)",
      contactEmail: "Contact Email",
      visibilityTitle: "Emergency Privacy Controls",
      visibilitySubtitle: "Choose exactly which fields appear on the public scan card.",
      visibilityNotice: "Only fields with active toggles will be sent to bystanders or paramedics scanning your QR code.",
      saveChanges: "Save Changes",
      saveSuccess: "Medical snapshot updated successfully!",
      showName: "Show Full Name",
      showAge: "Show Age",
      showBloodGroup: "Show Blood Group",
      showAllergies: "Show Known Allergies",
      showMedications: "Show Current Medications",
      showConditions: "Show Medical Conditions",
      showDoctor: "Show Attending Doctor",
      showContact: "Show Emergency Contact & Dial Button"
    },
    qr: {
      pageTitle: "Emergency QR Code",
      pageSubtitle: "Download, print, or set your life-saving QR code as mobile wallpaper.",
      qrPreviewTitle: "Active Emergency QR",
      activeBanner: "Your QR code is active and ready for emergency access.",
      revokedBanner: "This QR code has been revoked. Create a new QR code to resume access.",
      generateQrButton: "Generate Emergency QR",
      revokeQrButton: "Revoke QR Code",
      downloadPng: "Download QR (PNG)",
      printPdfCard: "Print Wallet Card (PDF)",
      downloadWallpaper: "Save Phone Wallpaper",
      lockScreenPreview: "Lock-Screen Wallpaper Preview",
      howToUseTitle: "How to Use Medora QR",
      walletCardInstruction: "Print the PDF on heavy paper, cut along guidelines, and place in your physical wallet.",
      lockScreenInstruction: "Save the 1080x2400 wallpaper to your phone and set it as your lock screen for 24/7 emergency visibility.",
      confirmRevokeTitle: "Revoke Emergency QR Code?",
      confirmRevokeMessage: "Are you sure? Anyone scanning your physical card will immediately receive an inactive message. You can generate a fresh QR code at any time.",
      revokeWarning: "Instant Deactivation",
      copiedLink: "Emergency scan URL copied to clipboard!",
      copyLinkButton: "Copy Public URL",
      regenerateNotice: "QR codes automatically encode the public HTTPS link for cross-device mobile scanning."
    },
    logs: {
      pageTitle: "Access Logs",
      pageSubtitle: "Privacy-conscious audit trail of every emergency QR scan event.",
      privacyNotice: "Medora never logs raw IP addresses or precise GPS coordinates. We record only the access timestamp and high-level device category.",
      totalScansLogged: "Total Access Events",
      timestamp: "Access Timestamp",
      deviceCategory: "Device Category",
      browserFamily: "Browser Family",
      status: "Access Result",
      statusSuccess: "Successful View",
      statusRevoked: "Blocked (Revoked)",
      noLogsYet: "No access logs recorded yet. Scan events will appear here automatically."
    },
    notifications: {
      pageTitle: "Safety Notifications",
      pageSubtitle: "Audit logs of emergency alerts dispatched when your QR code is accessed.",
      sendTestAlert: "Send Test Email Alert",
      sending: "Sending...",
      testAlertSent: "Test alert dispatched to your registered emergency notification email!",
      allCaughtUp: "All Caught Up",
      noNotifications: "No notifications logged yet.",
      alertRecipient: "Dispatched to",
      sentStatus: "Delivered",
      failedStatus: "Delivery Issue"
    },
    settings: {
      pageTitle: "Account Settings",
      pageSubtitle: "Manage your credentials, language preferences, and safety configuration.",
      accountDetails: "Account Details",
      accountName: "Registered Name",
      accountEmail: "Login Email",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updatePasswordButton: "Update Password",
      languagePreferences: "Language Preferences",
      languagePreferencesSubtitle: "Choose how Medora presents information to you and emergency responders.",
      dangerZone: "Danger Zone",
      dangerZoneSubtitle: "Permanently delete account and revoke all QR codes.",
      deleteAccountButton: "Delete Account",
      confirmDeleteTitle: "Permanently Delete Account?",
      confirmDeleteMessage: "This will immediately revoke all QR codes and delete all medical records. This action cannot be undone."
    },
    emergency: {
      emergencyHeader: "Emergency Medical Information",
      emergencyNotice: "This profile is for emergency assistance only.",
      callEmergencyContact: "Call Emergency Contact",
      calling: "Connecting Call...",
      bloodGroup: "Blood Group",
      age: "Age",
      yearsOld: "years",
      allergies: "Known Allergies",
      noKnownAllergies: "No Known Allergies (Confirmed by owner)",
      allergiesNotProvided: "Allergy information not provided",
      medications: "Current Medications",
      medicationsNotProvided: "No current medications listed",
      conditions: "Medical Conditions",
      conditionsNotProvided: "No conditions listed",
      doctorDetails: "Attending Physician / Doctor",
      doctorNotProvided: "Doctor details not listed",
      emergencyContact: "Registered Emergency Contact",
      contactNotProvided: "No emergency contact listed",
      privacyDisclaimer: "Essential information shared for emergency assistance only.",
      viewAccessLog: "Access Recorded",
      scanAccessedAt: "Scan Recorded",
      invalidTitle: "Invalid Emergency Link",
      invalidMessage: "This emergency QR link is not recognized or may have expired. Please verify the code or check with the individual.",
      revokedTitle: "QR Code Deactivated",
      revokedMessage: "This QR code has been revoked by the profile owner or caregiver. It can no longer display emergency medical information.",
      backToHome: "Return to Homepage",
      demonstrationNotice: "Demonstration Data: Non-operational contact number for evaluation",
      dosage: "Dosage",
      frequency: "Frequency",
      bilingualNotice: "Bilingual Emergency Display"
    }
  },

  bn: {
    common: {
      appName: "মেডোরা",
      appTagline: "জরুরি মেডিকেল আইডি",
      home: "মূলপাতা",
      dashboard: "ড্যাশবোর্ড",
      myProfile: "আমার প্রোফাইল",
      myQrCode: "আমার কিউআর কোড",
      accessLogs: "অ্যাক্সেস লগ",
      notifications: "বিজ্ঞপ্তি",
      settings: "সেটিংস",
      logout: "লগআউট",
      login: "লগইন",
      signup: "প্রোফাইল তৈরি",
      save: "সংরক্ষণ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      cancel: "বাতিল",
      confirm: "নিশ্চিত করুন",
      delete: "মুছে ফেলুন",
      deleting: "মুছে ফেলা হচ্ছে...",
      edit: "সম্পাদনা",
      back: "ফিরে যান",
      close: "বন্ধ করুন",
      loading: "লোড হচ্ছে...",
      error: "ত্রুটি",
      success: "সফল",
      language: "ভাষা",
      preferredLanguage: "ইন্টারফেস ভাষা",
      emergencySecondLanguage: "জরুরি পৃষ্ঠার দ্বিতীয় ভাষা",
      secondLanguageNone: "কোনোটি নয় (শুধুমাত্র ইংরেজি)",
      secondLanguageNotice: "দ্বিতীয় ভাষা নির্বাচন করা হলে জরুরি সেবাকর্মীরা পাশাপাশি ইংরেজি এবং নির্বাচিত ভাষা দেখতে পাবেন।"
    },
    auth: {
      loginTitle: "মেডোরায় লগইন করুন",
      loginSubtitle: "আপনার জরুরি চিকিৎসা প্রোফাইল ও কিউআর নিয়ন্ত্রণ অ্যাক্সেস করুন।",
      signupTitle: "জরুরি আইডি তৈরি করুন",
      signupSubtitle: "মাত্র ২ মিনিটে জীবনরক্ষাকারী স্বাস্থ্য প্রোফাইল তৈরি করুন।",
      firstName: "নামের প্রথম অংশ",
      lastName: "নামের শেষ অংশ",
      fullName: "পুরো নাম",
      fullNameSecondary: "দ্বিতীয় ভাষায় নাম (ঐচ্ছিক)",
      fullNameSecondaryPlaceholder: "যেমন: অনন্যা সেন",
      email: "অ্যাকাউন্ট ইমেইল",
      emergencyNotificationEmail: "জরুরি সতর্কবার্তা ইমেইল",
      emergencyNotificationEmailHelp: "কিউআর স্ক্যান করা হলে তাৎক্ষণিক সতর্কতা পাঠানো হবে (আপনার বা অভিভাবকের)।",
      password: "পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      agreeTerms: "আমি গোপনীয়তা নীতি এবং শিক্ষামূলক প্রদর্শনের শর্তাবলীতে সম্মত।",
      alreadyHaveAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
      dontHaveAccount: "জরুরি প্রোফাইল প্রয়োজন?",
      fillDemoAccount: "ডেমো অ্যাকাউন্ট পূরণ করুন (অনন্যা সেন)",
      orContinueWith: "অথবা ডেমো দিয়ে এগিয়ে যান",
      invalidEmailError: "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।",
      invalidEmergencyEmailError: "অনুগ্রহ করে একটি সঠিক জরুরি সতর্কবার্তা ইমেইল লিখুন।",
      passwordLengthError: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      passwordMismatchError: "উভয় পাসওয়ার্ড মিলছে না।",
      requiredFieldsError: "অনুগ্রহ করে সব প্রয়োজনীয় ঘর পূরণ করুন।",
      agreeTermsError: "শর্তাবলীতে সম্মতি প্রদান বাধ্যতামূলক।",
      loginSuccess: "স্বাগতম!",
      signupSuccess: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! আপনার প্রোফাইল প্রস্তুত।",
      selectUiLanguage: "পছন্দের ইন্টারফেস ভাষা",
      selectSecondLanguage: "জরুরি পৃষ্ঠার দ্বিতীয় ভাষা (ঐচ্ছিক)",
      peaceOfMindTitle: "নিরাপত্তা ও ভরসা",
      peaceOfMindText: "একটি যাচাইকৃত মেডিকেল আইডি তৈরি করুন যা কিউআর কোডের মাধ্যমে যেকোনো জরুরি কর্মী তাৎক্ষণিকভাবে দেখতে পারবেন।"
    },
    dashboard: {
      welcomeBack: "স্বাগতম",
      preparednessScore: "জরুরি প্রস্তুতি",
      preparednessActive: "প্রোফাইল সক্রিয়",
      totalScans: "সর্বমোট স্ক্যান",
      thisMonthScans: "চলতি মাসে স্ক্যান",
      qrStatus: "কিউআর কোডের অবস্থা",
      activeStatus: "সক্রিয় ও স্ক্যানযোগ্য",
      revokedStatus: "নিষ্ক্রিয় / বাতিল",
      notGeneratedStatus: "এখনও তৈরি হয়নি",
      viewQr: "কিউআর পরিচালনা করুন",
      generateQr: "এখনই কিউআর তৈরি করুন",
      recentAccessActivity: "সাম্প্রতিক স্ক্যান বিবরণ",
      noRecentScans: "সাম্প্রতিক কোনো স্ক্যান তথ্য নেই। কিউআর কোডটি শেয়ার বা পরীক্ষা করুন।",
      quickActions: "দ্রুত পদক্ষেপ",
      editMedicalSnapshot: "চিকিৎসা প্রোফাইল সম্পাদনা",
      manageQrAndPrint: "ওয়ালেট কার্ড ও কিউআর প্রিন্ট",
      reviewAccessAudit: "অ্যাক্সেস লগ দেখুন",
      safetyChecklist: "প্রোফাইল চেকলিস্ট",
      bloodGroupRecorded: "রক্তের গ্রুপ লিপিবদ্ধ",
      emergencyContactActive: "জরুরি যোগাযোগ সক্রিয়",
      allergiesReviewed: "অ্যালার্জি নিশ্চিত করা হয়েছে"
    },
    profile: {
      pageTitle: "চিকিৎসা প্রোফাইল",
      pageSubtitle: "জরুরি উদ্ধারকারীদের জন্য প্রদর্শিত স্বাস্থ্য তথ্য পরিচালনা করুন।",
      tabBasic: "প্রাথমিক বিবরণ",
      tabConditions: "রোগসমূহ",
      tabAllergies: "অ্যালার্জি",
      tabMedications: "ওষুধসমূহ",
      tabContact: "যোগাযোগ",
      tabVisibility: "গোপনীয়তা নিয়ন্ত্রণ",
      age: "বয়স",
      bloodGroup: "রক্তের গ্রুপ",
      selectBloodGroup: "রক্তের গ্রুপ নির্বাচন করুন",
      conditionsTitle: "দীর্ঘস্থায়ী শারীরিক অবস্থা / রোগ",
      conditionsSubtitle: "প্যারামেডিক বা চিকিৎসকদের জানার জন্য প্রয়োজনীয় শারীরিক অসুস্থতা।",
      addConditionPlaceholder: "যেমন: উচ্চ রক্তচাপ (স্টেজ ২)",
      addConditionButton: "রোগ যুক্ত করুন",
      noConditionsAdded: "কোনো দীর্ঘস্থায়ী রোগের তথ্য নেই।",
      allergiesTitle: "জানা অ্যালার্জি ও ওষুধের প্রতিক্রিয়া",
      allergiesSubtitle: "বিপদজনক ভুল চিকিৎসা রোধে অত্যন্ত গুরুত্বপূর্ণ।",
      noKnownAllergiesCheckbox: "কোনো পরিচিত অ্যালার্জি নেই (NKDA)",
      addAllergyPlaceholder: "যেমন: পেনিসিলিন (তীব্র র়্যাশ)",
      addAllergyButton: "অ্যালার্জি যুক্ত করুন",
      medicationsTitle: "চলমান ওষুধ ও মাত্রা",
      medicationsSubtitle: "নিয়মিত গ্রহণ করা ওষুধের তালিকা।",
      medName: "ওষুধের নাম",
      medDosage: "মাত্রা (যেমন: ৫০০ মিলিগ্রাম)",
      medFrequency: "সেবনের সময় (যেমন: দিনে দুইবার)",
      addMedication: "ওষুধ যুক্ত করুন",
      noMedicationsAdded: "চলমান কোনো ওষুধের তালিকা নেই।",
      doctorDetails: "নিয়মিত চিকিৎসক / ডাক্তার",
      doctorName: "ডাক্তারের নাম",
      doctorContact: "ডাক্তারের ফোন নম্বর",
      emergencyContactTitle: "প্রধান জরুরি যোগাযোগকারী",
      contactName: "যোগাযোগকারীর নাম",
      contactNameSecondary: "দ্বিতীয় ভাষায় যোগাযোগকারীর নাম (ঐচ্ছিক)",
      contactRelationship: "সম্পর্ক (যেমন: কন্যা, স্ত্রী)",
      contactPhone: "যোগাযোগকারীর ফোন নম্বর",
      contactEmail: "যোগাযোগকারীর ইমেইল",
      visibilityTitle: "জরুরি গোপনীয়তা নিয়ন্ত্রণ",
      visibilitySubtitle: "কোন কোন তথ্য সার্বজনীন কিউআর স্ক্যানে দেখা যাবে তা নির্বাচন করুন।",
      visibilityNotice: "শুধুমাত্র অনুমোদিত তথ্যই উদ্ধারকারী বা পথচারীরা দেখতে পাবেন।",
      saveChanges: "সংরক্ষণ করুন",
      saveSuccess: "চিকিৎসা প্রোফাইল সফলভাবে আপডেট হয়েছে!",
      showName: "পুরো নাম প্রদর্শন করুন",
      showAge: "বয়স প্রদর্শন করুন",
      showBloodGroup: "রক্তের গ্রুপ প্রদর্শন করুন",
      showAllergies: "অ্যালার্জি প্রদর্শন করুন",
      showMedications: "ওষুধের তালিকা প্রদর্শন করুন",
      showConditions: "রোগসমূহ প্রদর্শন করুন",
      showDoctor: "ডাক্তারের বিবরণ প্রদর্শন করুন",
      showContact: "জরুরি যোগাযোগ ও কল বোতাম প্রদর্শন করুন"
    },
    qr: {
      pageTitle: "জরুরি কিউআর কোড",
      pageSubtitle: "আপনার কিউআর কোড ডাউনলোড করুন, প্রিন্ট করুন বা ফোনে ওয়ালপেপার হিসেবে রাখুন।",
      qrPreviewTitle: "সক্রিয় জরুরি কিউআর",
      activeBanner: "আপনার কিউআর কোড সক্রিয় এবং স্ক্যানের জন্য প্রস্তুত।",
      revokedBanner: "এই কিউআর কোডটি বাতিল করা হয়েছে। পুনরায় সক্রিয় করতে নতুন কোড তৈরি করুন।",
      generateQrButton: "জরুরি কিউআর তৈরি করুন",
      revokeQrButton: "কিউআর কোড বাতিল করুন",
      downloadPng: "কিউআর ডাউনলোড (PNG)",
      printPdfCard: "ওয়ালেট কার্ড প্রিন্ট (PDF)",
      downloadWallpaper: "ফোন ওয়ালপেপার সংরক্ষণ",
      lockScreenPreview: "লক-স্ক্রিন ওয়ালপেপার প্রিভিউ",
      howToUseTitle: "কিউআর কোড ব্যবহারের নিয়ম",
      walletCardInstruction: "পিডিএফ ফাইলটি প্রিন্ট করে কেটে আপনার মানিব্যাগে রাখুন।",
      lockScreenInstruction: "১০৮০x২৪০০ ওয়ালপেপারটি আপনার ফোনের লক স্ক্রিনে সেট করুন যাতে জরুরি অবস্থায় দৃশ্যমান থাকে।",
      confirmRevokeTitle: "কিউআর কোডটি বাতিল করতে চান?",
      confirmRevokeMessage: "আপনি কি নিশ্চিত? এটি বাতিল করলে পূর্বের কিউআর কোডটি আর কোনো তথ্য দেখাবে না। আপনি যেকোনো সময় নতুন কোড তৈরি করতে পারবেন।",
      revokeWarning: "তাৎক্ষণিক নিষ্ক্রিয়করণ",
      copiedLink: "জরুরি স্ক্যান লিংক ক্লিপবোর্ডে কপি করা হয়েছে!",
      copyLinkButton: "পাবলিক লিংক কপি করুন",
      regenerateNotice: "কিউআর কোডে মোবাইল ফোনের জন্য সার্বজনীন HTTPS লিংক যুক্ত করা থাকে।"
    },
    logs: {
      pageTitle: "অ্যাক্সেস লগ",
      pageSubtitle: "জরুরি কিউআর কোড স্ক্যানের গোপনীয়তা-সুরক্ষিত নিরীক্ষা বিবরণ।",
      privacyNotice: "মেডোরা কখনো আইপি বা সুনির্দিষ্ট জিপিএস অবস্থান সংগ্রহ করে না। শুধুমাত্র সময় ও ডিভাইসের ধরন সংরক্ষিত হয়।",
      totalScansLogged: "সর্বমোট অ্যাক্সেস ইভেন্ট",
      timestamp: "অ্যাক্সেসের সময়",
      deviceCategory: "ডিভাইস বিভাগ",
      browserFamily: "ব্রাউজার পরিবার",
      status: "ফলাফল",
      statusSuccess: "সফল দর্শন",
      statusRevoked: "প্রতিহত (বাতিল)",
      noLogsYet: "এখনও কোনো স্ক্যান তথ্য নেই। স্ক্যান করা হলে এখানে দেখা যাবে।"
    },
    notifications: {
      pageTitle: "নিরাপত্তা বিজ্ঞপ্তি",
      pageSubtitle: "কিউআর কোড স্ক্যান করার পর প্রেরিত সতর্কবার্তার ইতিহাস।",
      sendTestAlert: "পরীক্ষামূলক সতর্কবার্তা পাঠান",
      sending: "পাঠানো হচ্ছে...",
      testAlertSent: "আপনার জরুরি ইমেইলে সতর্কবার্তা পাঠানো হয়েছে!",
      allCaughtUp: "সব হালনাগাদ",
      noNotifications: "কোনো নতুন বিজ্ঞপ্তি নেই।",
      alertRecipient: "প্রেরণ করা হয়েছে",
      sentStatus: "সফলভাবে প্রেরিত",
      failedStatus: "প্রেরণে ব্যর্থ"
    },
    settings: {
      pageTitle: "অ্যাকাউন্ট সেটিংস",
      pageSubtitle: "আপনার পাসওয়ার্ড, ভাষা পছন্দ ও নিরাপত্তা সেটিংস পরিচালনা করুন।",
      accountDetails: "অ্যাকাউন্টের বিবরণ",
      accountName: "নিবন্ধিত নাম",
      accountEmail: "লগইন ইমেইল",
      changePassword: "পাসওয়ার্ড পরিবর্তন",
      currentPassword: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      updatePasswordButton: "পাসওয়ার্ড আপডেট করুন",
      languagePreferences: "ভাষা পছন্দ",
      languagePreferencesSubtitle: "আপনার ড্যাশবোর্ড এবং জরুরি পৃষ্ঠার ভাষা নির্ধারণ করুন।",
      dangerZone: "ঝুঁকিপূর্ণ এলাকা",
      dangerZoneSubtitle: "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলুন এবং সব কিউআর কোড বাতিল করুন।",
      deleteAccountButton: "অ্যাকাউন্ট মুছে ফেলুন",
      confirmDeleteTitle: "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?",
      confirmDeleteMessage: "এটি সাথে সাথে আপনার সমস্ত কিউআর কোড এবং চিকিৎসা তথ্য মুছে ফেলবে। এটি আর ফিরিয়ে আনা যাবে না।"
    },
    emergency: {
      emergencyHeader: "জরুরি চিকিৎসা তথ্য",
      emergencyNotice: "এই তথ্য শুধুমাত্র জরুরি পরিস্থিতিতে সহায়তার জন্য প্রদর্শিত।",
      callEmergencyContact: "জরুরি যোগাযোগে কল করুন",
      calling: "কল সংযোগ করা হচ্ছে...",
      bloodGroup: "রক্তের গ্রুপ",
      age: "বয়স",
      yearsOld: "বছর",
      allergies: "অ্যালার্জি",
      noKnownAllergies: "কোনো অ্যালার্জি নেই (ব্যক্তি কর্তৃক নিশ্চিত)",
      allergiesNotProvided: "অ্যালার্জির তথ্য প্রদান করা হয়নি",
      medications: "চলমান ওষুধ",
      medicationsNotProvided: "কোনো ওষুধের তালিকা নেই",
      conditions: "শারীরিক অবস্থা / রোগসমূহ",
      conditionsNotProvided: "কোনো রোগের তথ্য নেই",
      doctorDetails: "চিকিৎসক / ডাক্তার",
      doctorNotProvided: "ডাক্তারের তথ্য প্রদান করা হয়নি",
      emergencyContact: "জরুরি যোগাযোগকারী",
      contactNotProvided: "জরুরি যোগাযোগের নম্বর নেই",
      privacyDisclaimer: "শুধুমাত্র জরুরি চিকিৎসার স্বার্থে অনুমোদিত তথ্য প্রদর্শিত হচ্ছে।",
      viewAccessLog: "স্ক্যান সফলভাবে লিপিবদ্ধ",
      scanAccessedAt: "স্ক্যানের সময়",
      invalidTitle: "অকার্যকর জরুরি লিংক",
      invalidMessage: "এই কিউআর কোড লিংকটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।",
      revokedTitle: "কিউআর কোড বাতিল করা হয়েছে",
      revokedMessage: "এই কিউআর কোডটি মালিক বা অভিভাবক কর্তৃক প্রত্যাহার করা হয়েছে। এটি আর কোনো তথ্য প্রদর্শন করবে না।",
      backToHome: "মূল পৃষ্ঠায় ফিরে যান",
      demonstrationNotice: "প্রদর্শনমূলক তথ্য: মূল্যায়নের জন্য কৃত্রিম যোগাযোগ নম্বর",
      dosage: "মাত্রা",
      frequency: "সেবনের সময়",
      bilingualNotice: "দ্বিভাষিক জরুরি তথ্য প্রদর্শন"
    }
  },

  hi: {
    common: {
      appName: "मेडोरा",
      appTagline: "आपातकालीन मेडिकल आईडी",
      home: "मुख्य पृष्ठ",
      dashboard: "डैशबोर्ड",
      myProfile: "मेरी प्रोफाइल",
      myQrCode: "मेरा क्यूआर कोड",
      accessLogs: "एक्सेस लॉग",
      notifications: "सूचनाएं",
      settings: "सेटिंग्स",
      logout: "लॉग आउट",
      login: "लॉग इन",
      signup: "प्रोफाइल बनाएं",
      save: "सहेजें",
      saving: "सहेजा जा रहा है...",
      cancel: "रद्द करें",
      confirm: "पुष्टि करें",
      delete: "हटाएं",
      deleting: "हटाया जा रहा है...",
      edit: "संपादित करें",
      back: "वापस",
      close: "बंद करें",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफल",
      language: "भाषा",
      preferredLanguage: "इंटरफेस भाषा",
      emergencySecondLanguage: "आपातकालीन पृष्ठ की दूसरी भाषा",
      secondLanguageNone: "कोई नहीं (केवल अंग्रेजी)",
      secondLanguageNotice: "दूसरी भाषा चुनने पर आपातकालीन बचाव दल को अंग्रेजी और चुनी हुई भाषा दोनों साथ-साथ दिखाई देंगी।"
    },
    auth: {
      loginTitle: "मेडोरा में लॉग इन करें",
      loginSubtitle: "अपनी आपातकालीन सुरक्षा प्रोफाइल और क्यूआर नियंत्रण तक पहुंचें।",
      signupTitle: "आपातकालीन आईडी बनाएं",
      signupSubtitle: "मात्र 2 मिनट में जीवन रक्षक स्वास्थ्य प्रोफाइल बनाएं।",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      fullName: "पूरा नाम",
      fullNameSecondary: "दूसरी भाषा में नाम (वैकल्पिक)",
      fullNameSecondaryPlaceholder: "जैसे: अनन्या सेन",
      email: "खाता ईमेल पता",
      emergencyNotificationEmail: "आपातकालीन सूचना ईमेल",
      emergencyNotificationEmailHelp: "क्यूआर स्कैन होने पर तुरंत अलर्ट भेजा जाएगा (आपका या देखभालकर्ता का)।",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      agreeTerms: "मैं गोपनीयता नीति और शैक्षणिक प्रदर्शन शर्तों से सहमत हूं।",
      alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
      dontHaveAccount: "आपातकालीन प्रोफाइल चाहिए?",
      fillDemoAccount: "डेमो खाता भरें (अनन्या सेन)",
      orContinueWith: "या डेमो के साथ जारी रखें",
      invalidEmailError: "कृपया एक वैध ईमेल पता दर्ज करें।",
      invalidEmergencyEmailError: "कृपया एक वैध आपातकालीन सूचना ईमेल दर्ज करें।",
      passwordLengthError: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      passwordMismatchError: "पासवर्ड मेल नहीं खा रहे हैं।",
      requiredFieldsError: "कृपया सभी आवश्यक फ़ील्ड भरें।",
      agreeTermsError: "कृपया गोपनीयता शर्तों को स्वीकार करें।",
      loginSuccess: "वापसी पर स्वागत है!",
      signupSuccess: "खाता सफलतापूर्वक बनाया गया! आपकी प्रोफाइल तैयार है।",
      selectUiLanguage: "पसंदीदा इंटरफेस भाषा",
      selectSecondLanguage: "आपातकालीन पृष्ठ की दूसरी भाषा (वैकल्पिक)",
      peaceOfMindTitle: "मन की शांति और सुरक्षा",
      peaceOfMindText: "एक सत्यापित मेडिकल आईडी बनाएं जिसे आपातकालीन कर्मी क्यूआर कोड के माध्यम से तुरंत देख सकें।"
    },
    dashboard: {
      welcomeBack: "स्वागत है",
      preparednessScore: "आपातकालीन तैयारी",
      preparednessActive: "प्रोफाइल सक्रिय",
      totalScans: "कुल जीवनकाल स्कैन",
      thisMonthScans: "इस महीने के स्कैन",
      qrStatus: "क्यूआर कोड स्थिति",
      activeStatus: "सक्रिय और स्कैन करने योग्य",
      revokedStatus: "निष्क्रिय / रद्द",
      notGeneratedStatus: "अभी नहीं बनाया गया",
      viewQr: "क्यूआर प्रबंधित करें",
      generateQr: "अभी क्यूआर बनाएं",
      recentAccessActivity: "हालिया स्कैन गतिविधि",
      noRecentScans: "कोई हालिया स्कैन दर्ज नहीं हुआ। अपना क्यूआर कोड साझा करें।",
      quickActions: "त्वरित कार्रवाई",
      editMedicalSnapshot: "चिकित्सा प्रोफाइल संपादित करें",
      manageQrAndPrint: "वॉलेट कार्ड और क्यूआर प्रिंट करें",
      reviewAccessAudit: "एक्सेस लॉग देखें",
      safetyChecklist: "सुरक्षा चेकलिस्ट",
      bloodGroupRecorded: "रक्त समूह दर्ज है",
      emergencyContactActive: "आपातकालीन संपर्क सक्रिय",
      allergiesReviewed: "एलर्जी सत्यापित है"
    },
    profile: {
      pageTitle: "चिकित्सा प्रोफाइल",
      pageSubtitle: "आपातकालीन कर्मियों को दिखाई देने वाला स्वास्थ्य डेटा प्रबंधित करें।",
      tabBasic: "बुनियादी विवरण",
      tabConditions: "स्वास्थ्य स्थितियां",
      tabAllergies: "एलर्जी",
      tabMedications: "दवाइयां",
      tabContact: "संपर्क",
      tabVisibility: "गोपनीयता नियंत्रण",
      age: "आयु",
      bloodGroup: "रक्त समूह",
      selectBloodGroup: "रक्त समूह चुनें",
      conditionsTitle: "दीर्घकालिक बीमारियां / स्थितियां",
      conditionsSubtitle: "चिकित्सकों को ज्ञात होने वाली सक्रिय बीमारियों की सूची।",
      addConditionPlaceholder: "जैसे: उच्च रक्तचाप (स्टेज २)",
      addConditionButton: "बीमारी जोड़ें",
      noConditionsAdded: "कोई दीर्घकालिक बीमारी दर्ज नहीं है।",
      allergiesTitle: "ज्ञात एलर्जी और प्रतिक्रियाएं",
      allergiesSubtitle: "गलत दवाओं से बचाव के लिए अत्यंत महत्वपूर्ण।",
      noKnownAllergiesCheckbox: "कोई ज्ञात एलर्जी नहीं (NKDA)",
      addAllergyPlaceholder: "जैसे: पेनिसिलिन (गंभीर चकत्ते)",
      addAllergyButton: "एलर्जी जोड़ें",
      medicationsTitle: "वर्तमान दवाइयां और खुराक",
      medicationsSubtitle: "मरीज द्वारा नियमित रूप से ली जाने वाली दवाएं।",
      medName: "दवा का नाम",
      medDosage: "खुराक (जैसे: 500 mg)",
      medFrequency: "समय (जैसे: दिन में दो बार)",
      addMedication: "दवा जोड़ें",
      noMedicationsAdded: "कोई वर्तमान दवा दर्ज नहीं है।",
      doctorDetails: "उपचारक चिकित्सक / डॉक्टर",
      doctorName: "डॉक्टर का नाम",
      doctorContact: "डॉक्टर का फोन नंबर",
      emergencyContactTitle: "प्राथमिक आपातकालीन संपर्क",
      contactName: "संपर्क का पूरा नाम",
      contactNameSecondary: "दूसरी भाषा में संपर्क का नाम (वैकल्पिक)",
      contactRelationship: "संबंध (जैसे: बेटी, जीवनसाथी)",
      contactPhone: "संपर्क फोन (सीधा डायल)",
      contactEmail: "संपर्क ईमेल",
      visibilityTitle: "आपातकालीन गोपनीयता नियंत्रण",
      visibilitySubtitle: "चुनें कि सार्वजनिक स्कैन पर कौन से फ़ील्ड दिखाई देंगे।",
      visibilityNotice: "केवल सक्षम फ़ील्ड ही क्यूआर कोड स्कैन करने वाले व्यक्ति को दिखाई देंगे।",
      saveChanges: "सहेजें",
      saveSuccess: "चिकित्सा प्रोफाइल सफलतापूर्वक सहेजी गई!",
      showName: "पूरा नाम दिखाएं",
      showAge: "आयु दिखाएं",
      showBloodGroup: "रक्त समूह दिखाएं",
      showAllergies: "एलर्जी दिखाएं",
      showMedications: "दवाइयां दिखाएं",
      showConditions: "बीमारियां दिखाएं",
      showDoctor: "डॉक्टर का विवरण दिखाएं",
      showContact: "आपातकालीन संपर्क और कॉल बटन दिखाएं"
    },
    qr: {
      pageTitle: "आपातकालीन क्यूआर कोड",
      pageSubtitle: "अपना क्यूआर कोड डाउनलोड करें, प्रिंट करें या फोन वॉलपेपर बनाएं।",
      qrPreviewTitle: "सक्रिय आपातकालीन क्यूआर",
      activeBanner: "आपका क्यूआर कोड सक्रिय है और आपातकालीन स्कैन के लिए तैयार है।",
      revokedBanner: "यह क्यूआर कोड रद्द कर दिया गया है। नया कोड बनाएं।",
      generateQrButton: "आपातकालीन क्यूआर बनाएं",
      revokeQrButton: "क्यूआर कोड रद्द करें",
      downloadPng: "क्यूआर डाउनलोड करें (PNG)",
      printPdfCard: "वॉलेट कार्ड प्रिंट करें (PDF)",
      downloadWallpaper: "फोन वॉलपेपर सहेजें",
      lockScreenPreview: "लॉक-स्क्रीन वॉलपेपर पूर्वावलोकन",
      howToUseTitle: "क्यूआर कोड का उपयोग कैसे करें",
      walletCardInstruction: "पीडीएफ को प्रिंट करके काटें और अपने बटुए में रखें।",
      lockScreenInstruction: "1080x2400 वॉलपेपर को अपने फोन पर सहेजें और लॉक स्क्रीन पर लगाएं।",
      confirmRevokeTitle: "क्या आप क्यूआर कोड रद्द करना चाहते हैं?",
      confirmRevokeMessage: "क्या आप निश्चित हैं? इसे रद्द करने पर पुराना कोड काम नहीं करेगा। आप कभी भी नया कोड बना सकते हैं।",
      revokeWarning: "तुरंत निष्क्रियता",
      copiedLink: "आपातकालीन स्कैन लिंक कॉपी किया गया!",
      copyLinkButton: "सार्वजनिक लिंक कॉपी करें",
      regenerateNotice: "क्यूआर कोड मोबाइल फोन से स्कैनिंग के लिए सार्वजनिक HTTPS लिंक संग्रहीत करता है।"
    },
    logs: {
      pageTitle: "एक्सेस लॉग",
      pageSubtitle: "क्यूआर कोड स्कैनिंग का गोपनीयता-अनुरूप ऑडिट रिकॉर्ड।",
      privacyNotice: "मेडोरा कभी भी आईपी या सटीक जीपीएस स्थान संग्रहीत नहीं करता है। केवल समय और डिवाइस श्रेणी दर्ज की जाती है।",
      totalScansLogged: "कुल एक्सेस रिकॉर्ड",
      timestamp: "एक्सेस का समय",
      deviceCategory: "डिवाइस श्रेणी",
      browserFamily: "ब्राउज़र परिवार",
      status: "परिणाम",
      statusSuccess: "सफल दृश्य",
      statusRevoked: "अवरुद्ध (रद्द)",
      noLogsYet: "अभी तक कोई स्कैन लॉग दर्ज नहीं हुआ है।"
    },
    notifications: {
      pageTitle: "सुरक्षा सूचनाएं",
      pageSubtitle: "क्यूआर कोड एक्सेस होने पर भेजे गए अलर्ट का इतिहास।",
      sendTestAlert: "टेस्ट ईमेल अलर्ट भेजें",
      sending: "भेजा जा रहा है...",
      testAlertSent: "आपके पंजीकृत आपातकालीन ईमेल पर अलर्ट भेजा गया है!",
      allCaughtUp: "सब अद्यतित है",
      noNotifications: "कोई सूचना नहीं है।",
      alertRecipient: "भेजा गया",
      sentStatus: "सफल",
      failedStatus: "असफल"
    },
    settings: {
      pageTitle: "खाता सेटिंग्स",
      pageSubtitle: "अपनी साख, भाषा प्राथमिकताएं और सुरक्षा कॉन्फ़िगरेशन प्रबंधित करें।",
      accountDetails: "खाता विवरण",
      accountName: "पंजीकृत नाम",
      accountEmail: "लॉगिन ईमेल",
      changePassword: "पासवर्ड बदलें",
      currentPassword: "वर्तमान पासवर्ड",
      newPassword: "नया पासवर्ड",
      confirmNewPassword: "नए पासवर्ड की पुष्टि करें",
      updatePasswordButton: "पासवर्ड अपडेट करें",
      languagePreferences: "भाषा प्राथमिकताएं",
      languagePreferencesSubtitle: "तय करें कि मेडोरा आपको और आपातकालीन कर्मियों को जानकारी कैसे दिखाए।",
      dangerZone: "खतरनाक क्षेत्र",
      dangerZoneSubtitle: "खाता स्थायी रूप से हटाएं और सभी क्यूआर कोड रद्द करें।",
      deleteAccountButton: "खाता हटाएं",
      confirmDeleteTitle: "खाता स्थायी रूप से हटाएं?",
      confirmDeleteMessage: "यह तुरंत आपके सभी क्यूआर कोड और स्वास्थ्य रिकॉर्ड मिटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।"
    },
    emergency: {
      emergencyHeader: "आपातकालीन चिकित्सा जानकारी",
      emergencyNotice: "यह जानकारी केवल आपातकालीन सहायता के लिए प्रदान की गई है।",
      callEmergencyContact: "आपातकालीन संपर्क पर कॉल करें",
      calling: "कॉल मिलाया जा रहा है...",
      bloodGroup: "रक्त समूह",
      age: "आयु",
      yearsOld: "वर्ष",
      allergies: "एलर्जी",
      noKnownAllergies: "कोई ज्ञात एलर्जी नहीं (व्यक्ति द्वारा प्रमाणित)",
      allergiesNotProvided: "एलर्जी की जानकारी उपलब्ध नहीं कराई गई",
      medications: "वर्तमान दवाइयां",
      medicationsNotProvided: "दवाइयों की कोई सूची नहीं है",
      conditions: "स्वास्थ्य स्थितियां / बीमारियां",
      conditionsNotProvided: "कोई स्वास्थ्य स्थिति दर्ज नहीं है",
      doctorDetails: "चिकित्सक / डॉक्टर",
      doctorNotProvided: "डॉक्टर का विवरण उपलब्ध नहीं है",
      emergencyContact: "पंजीकृत आपातकालीन संपर्क",
      contactNotProvided: "कोई आपातकालीन संपर्क दर्ज नहीं है",
      privacyDisclaimer: "केवल आपातकालीन सहायता के लिए आवश्यक जानकारी साझा की गई है।",
      viewAccessLog: "स्कैन दर्ज किया गया",
      scanAccessedAt: "स्कैन का समय",
      invalidTitle: "अमान्य आपातकालीन लिंक",
      invalidMessage: "यह क्यूआर कोड मान्य नहीं है या समाप्त हो चुका है। कृपया कोड की पुनः पुष्टि करें।",
      revokedTitle: "क्यूआर कोड निष्क्रिय कर दिया गया है",
      revokedMessage: "यह क्यूआर कोड प्रोफाइल स्वामी या देखभालकर्ता द्वारा रद्द कर दिया गया है।",
      backToHome: "मुख्य पृष्ठ पर लौटें",
      demonstrationNotice: "प्रदर्शन डेटा: मूल्यांकन के लिए गैर-परिचालन काल्पनिक नंबर",
      dosage: "खुराक",
      frequency: "समय",
      bilingualNotice: "द्विभाषी आपातकालीन प्रदर्शन"
    }
  }
};
