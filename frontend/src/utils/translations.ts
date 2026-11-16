import { Language } from '../types';

export interface TranslationSchema {
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
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
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
  },
  bn: {
    emergencyHeader: "জরুরি চিকিৎসা তথ্য",
    emergencyNotice: "এই তথ্য শুধুমাত্র জরুরি পরিস্থিতিতে সহায়তার জন্য প্রদর্শিত।",
    callEmergencyContact: "জরুরি যোগাযোগ নম্বরে কল করুন",
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
    invalidMessage: "এই কিউআর কোড লিংকটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে কোডটি পুনরায় যাচাই করুন।",
    revokedTitle: "কিউআর কোড বাতিল করা হয়েছে",
    revokedMessage: "এই কিউআর কোডটি মালিক বা অভিভাবক কর্তৃক প্রত্যাহার করা হয়েছে। এটি আর কোনো তথ্য প্রদর্শন করবে না।",
    backToHome: "মূল পৃষ্ঠায় ফিরে যান",
    demonstrationNotice: "প্রদর্শনমূলক তথ্য: মূল্যায়নের জন্য কৃত্রিম যোগাযোগ নম্বর",
    dosage: "মাত্রা",
    frequency: "সেবনের সময়",
  },
  hi: {
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
    revokedMessage: "यह क्यूआर कोड प्रोफाइल स्वामी या देखभालकर्ता द्वारा रद्द कर दिया गया है। अब यह जानकारी नहीं दिखाएगा।",
    backToHome: "मुख्य पृष्ठ पर लौटें",
    demonstrationNotice: "प्रदर्शन डेटा: मूल्यांकन के लिए गैर-परिचालन काल्पनिक नंबर",
    dosage: "खुराक",
    frequency: "समय",
  }
};

