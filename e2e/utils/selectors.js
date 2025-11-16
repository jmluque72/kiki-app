const Selectors = {
  // Login Screen
  loginScreen: by.id('login-screen'),
  emailInput: by.id('email-input'),
  passwordInput: by.id('password-input'),
  loginButton: by.id('login-button'),
  rememberMeToggle: by.id('remember-me-toggle'),
  forgotPasswordButton: by.id('forgot-password-button'),
  biometricButton: by.id('biometric-button'),
  
  // Register Screen
  registerScreen: by.id('register-screen'),
  registerNameInput: by.id('register-name-input'),
  registerEmailInput: by.id('register-email-input'),
  registerPasswordInput: by.id('register-password-input'),
  registerConfirmPasswordInput: by.id('register-confirm-password-input'),
  registerButton: by.id('register-button'),
  
  // Account Selection
  accountSelectionScreen: by.id('account-selection-screen'),
  accountItem: by.id('account-item'),
  accountName: by.id('account-name'),
  accountRole: by.id('account-role'),
  
  // Home Screen
  homeScreen: by.id('home-screen'),
  homeHeader: by.id('home-header'),
  homeTitle: by.id('home-title'),
  activitiesList: by.id('activities-list'),
  activityCard: by.id('activity-card'),
  activityTitle: by.id('activity-title'),
  activityDate: by.id('activity-date'),
  activityTime: by.id('activity-time'),
  activityLocation: by.id('activity-location'),
  activityType: by.id('activity-type'),
  
  // Activity Details
  activityDetailsScreen: by.id('activity-details-screen'),
  activityDetailsTitle: by.id('activity-details-title'),
  activityDetailsDescription: by.id('activity-details-description'),
  activityDetailsDate: by.id('activity-details-date'),
  activityDetailsTime: by.id('activity-details-time'),
  activityDetailsLocation: by.id('activity-details-location'),
  activityDetailsType: by.id('activity-details-type'),
  activityDetailsCapacity: by.id('activity-details-capacity'),
  activityDetailsAttendees: by.id('activity-details-attendees'),
  joinActivityButton: by.id('join-activity-button'),
  leaveActivityButton: by.id('leave-activity-button'),
  editActivityButton: by.id('edit-activity-button'),
  deleteActivityButton: by.id('delete-activity-button'),
  
  // Create Activity
  createActivityScreen: by.id('create-activity-screen'),
  activityTitleInput: by.id('activity-title-input'),
  activityDescriptionInput: by.id('activity-description-input'),
  activityDateInput: by.id('activity-date-input'),
  activityTimeInput: by.id('activity-time-input'),
  activityLocationInput: by.id('activity-location-input'),
  activityTypePicker: by.id('activity-type-picker'),
  activityCapacityInput: by.id('activity-capacity-input'),
  activityVirtualToggle: by.id('activity-virtual-toggle'),
  activityLinkInput: by.id('activity-link-input'),
  createActivityButton: by.id('create-activity-button'),
  
  // Profile Screen
  profileScreen: by.id('profile-screen'),
  profileName: by.id('profile-name'),
  profileEmail: by.id('profile-email'),
  profileRole: by.id('profile-role'),
  profileImage: by.id('profile-image'),
  editProfileButton: by.id('edit-profile-button'),
  logoutButton: by.id('logout-button'),
  
  // Edit Profile
  editProfileScreen: by.id('edit-profile-screen'),
  editNameInput: by.id('edit-name-input'),
  editEmailInput: by.id('edit-email-input'),
  editPhoneInput: by.id('edit-phone-input'),
  editBioInput: by.id('edit-bio-input'),
  saveProfileButton: by.id('save-profile-button'),
  changePasswordButton: by.id('change-password-button'),
  
  // Navigation
  bottomTabBar: by.id('bottom-tab-bar'),
  homeTab: by.id('home-tab'),
  activitiesTab: by.id('activities-tab'),
  createTab: by.id('create-tab'),
  profileTab: by.id('profile-tab'),
  
  // Common Elements
  loadingIndicator: by.id('loading-indicator'),
  errorMessage: by.id('error-message'),
  successMessage: by.id('success-message'),
  backButton: by.id('back-button'),
  closeButton: by.id('close-button'),
  confirmButton: by.id('confirm-button'),
  cancelButton: by.id('cancel-button'),
  
  // Modal Elements
  modalContainer: by.id('modal-container'),
  modalTitle: by.id('modal-title'),
  modalMessage: by.id('modal-message'),
  modalConfirmButton: by.id('modal-confirm-button'),
  modalCancelButton: by.id('modal-cancel-button'),
  
  // Search Elements
  searchBar: by.id('search-bar'),
  searchInput: by.id('search-input'),
  searchButton: by.id('search-button'),
  searchResults: by.id('search-results'),
  searchClearButton: by.id('search-clear-button'),
  
  // Filter Elements
  filterButton: by.id('filter-button'),
  filterModal: by.id('filter-modal'),
  filterTypePicker: by.id('filter-type-picker'),
  filterDateFromInput: by.id('filter-date-from-input'),
  filterDateToInput: by.id('filter-date-to-input'),
  filterLocationInput: by.id('filter-location-input'),
  filterApplyButton: by.id('filter-apply-button'),
  filterClearButton: by.id('filter-clear-button'),
  
  // Form Elements
  textInput: by.type('android.widget.EditText').withAncestor(by.id('form-container')),
  picker: by.type('android.widget.Spinner').withAncestor(by.id('form-container')),
  checkbox: by.type('android.widget.CheckBox').withAncestor(by.id('form-container')),
  radioButton: by.type('android.widget.RadioButton').withAncestor(by.id('form-container')),
  
  // Image Elements
  imagePicker: by.id('image-picker'),
  cameraButton: by.id('camera-button'),
  galleryButton: by.id('gallery-button'),
  imagePreview: by.id('image-preview'),
  removeImageButton: by.id('remove-image-button'),
  
  // Notification Elements
  notificationBadge: by.id('notification-badge'),
  notificationButton: by.id('notification-button'),
  notificationList: by.id('notification-list'),
  notificationItem: by.id('notification-item'),
  notificationTitle: by.id('notification-title'),
  notificationMessage: by.id('notification-message'),
  
  // Settings Elements
  settingsScreen: by.id('settings-screen'),
  settingsList: by.id('settings-list'),
  settingsItem: by.id('settings-item'),
  settingsToggle: by.id('settings-toggle'),
  languagePicker: by.id('language-picker'),
  themePicker: by.id('theme-picker'),
  
  // Calendar Elements
  calendarContainer: by.id('calendar-container'),
  calendarDay: by.id('calendar-day'),
  calendarMonth: by.id('calendar-month'),
  calendarYear: by.id('calendar-year'),
  calendarToday: by.id('calendar-today'),
  calendarSelected: by.id('calendar-selected'),
  
  // Time Picker Elements
  timePickerContainer: by.id('time-picker-container'),
  timePickerHour: by.id('time-picker-hour'),
  timePickerMinute: by.id('time-picker-minute'),
  timePickerAmPm: by.id('time-picker-am-pm'),
  timePickerConfirm: by.id('time-picker-confirm'),
  timePickerCancel: by.id('time-picker-cancel'),
  
  // Map Elements
  mapContainer: by.id('map-container'),
  mapMarker: by.id('map-marker'),
  mapCurrentLocation: by.id('map-current-location'),
  mapSearchButton: by.id('map-search-button'),
  mapDirectionsButton: by.id('map-directions-button'),
  
  // Chat Elements
  chatContainer: by.id('chat-container'),
  chatInput: by.id('chat-input'),
  chatSendButton: by.id('chat-send-button'),
  chatMessage: by.id('chat-message'),
  chatMessageText: by.id('chat-message-text'),
  chatMessageTime: by.id('chat-message-time'),
  
  // Share Elements
  shareButton: by.id('share-button'),
  shareModal: by.id('share-modal'),
  shareCopyButton: by.id('share-copy-button'),
  shareWhatsAppButton: by.id('share-whatsapp-button'),
  shareEmailButton: by.id('share-email-button'),
  
  // QR Code Elements
  qrCodeContainer: by.id('qr-code-container'),
  qrCodeImage: by.id('qr-code-image'),
  qrCodeScanner: by.id('qr-code-scanner'),
  qrCodeScanButton: by.id('qr-code-scan-button'),
  
  // File Upload Elements
  fileUploadButton: by.id('file-upload-button'),
  fileUploadInput: by.id('file-upload-input'),
  fileUploadProgress: by.id('file-upload-progress'),
  fileUploadCancel: by.id('file-upload-cancel'),
  
  // Video Elements
  videoPlayer: by.id('video-player'),
  videoPlayButton: by.id('video-play-button'),
  videoPauseButton: by.id('video-pause-button'),
  videoFullscreenButton: by.id('video-fullscreen-button'),
  videoProgressBar: by.id('video-progress-bar'),
  
  // Audio Elements
  audioPlayer: by.id('audio-player'),
  audioPlayButton: by.id('audio-play-button'),
  audioPauseButton: by.id('audio-pause-button'),
  audioVolumeSlider: by.id('audio-volume-slider'),
  
  // Payment Elements
  paymentScreen: by.id('payment-screen'),
  paymentCardInput: by.id('payment-card-input'),
  paymentAmountInput: by.id('payment-amount-input'),
  paymentConfirmButton: by.id('payment-confirm-button'),
  paymentCancelButton: by.id('payment-cancel-button'),
  
  // Analytics Elements
  analyticsButton: by.id('analytics-button'),
  analyticsChart: by.id('analytics-chart'),
  analyticsFilter: by.id('analytics-filter'),
  analyticsExportButton: by.id('analytics-export-button'),
  
  // Accessibility Elements
  accessibilityButton: by.id('accessibility-button'),
  screenReaderToggle: by.id('screen-reader-toggle'),
  highContrastToggle: by.id('high-contrast-toggle'),
  fontSizeSlider: by.id('font-size-slider'),
  
  // Network Status
  networkStatusBar: by.id('network-status-bar'),
  networkStatusText: by.id('network-status-text'),
  networkRetryButton: by.id('network-retry-button'),
  
  // Error Elements
  errorScreen: by.id('error-screen'),
  errorTitle: by.id('error-title'),
  errorDescription: by.id('error-description'),
  errorRetryButton: by.id('error-retry-button'),
  errorGoHomeButton: by.id('error-go-home-button'),
  
  // Empty State Elements
  emptyStateContainer: by.id('empty-state-container'),
  emptyStateTitle: by.id('empty-state-title'),
  emptyStateMessage: by.id('empty-state-message'),
  emptyStateActionButton: by.id('empty-state-action-button'),
  
  // Loading State Elements
  loadingContainer: by.id('loading-container'),
  loadingText: by.id('loading-text'),
  loadingProgress: by.id('loading-progress'),
  
  // Pull to Refresh
  refreshControl: by.id('refresh-control'),
  refreshIndicator: by.id('refresh-indicator'),
  
  // Infinite Scroll
  infiniteScrollContainer: by.id('infinite-scroll-container'),
  loadMoreButton: by.id('load-more-button'),
  endOfListIndicator: by.id('end-of-list-indicator'),
  
  // Swipe Actions
  swipeActionLeft: by.id('swipe-action-left'),
  swipeActionRight: by.id('swipe-action-right'),
  swipeDeleteButton: by.id('swipe-delete-button'),
  swipeEditButton: by.id('swipe-edit-button'),
  
  // Tabs
  tabContainer: by.id('tab-container'),
  tabItem: by.id('tab-item'),
  tabIndicator: by.id('tab-indicator'),
  
  // Drawer
  drawerContainer: by.id('drawer-container'),
  drawerMenu: by.id('drawer-menu'),
  drawerItem: by.id('drawer-item'),
  drawerHeader: by.id('drawer-header'),
  drawerToggle: by.id('drawer-toggle'),
  
  // Header Elements
  headerContainer: by.id('header-container'),
  headerTitle: by.id('header-title'),
  headerBackButton: by.id('header-back-button'),
  headerMenuButton: by.id('header-menu-button'),
  headerSearchButton: by.id('header-search-button'),
  
  // Footer Elements
  footerContainer: by.id('footer-container'),
  footerButton: by.id('footer-button'),
  footerText: by.id('footer-text'),
  
  // Toast Elements
  toastContainer: by.id('toast-container'),
  toastMessage: by.id('toast-message'),
  toastIcon: by.id('toast-icon'),
  
  // Alert Elements
  alertContainer: by.id('alert-container'),
  alertTitle: by.id('alert-title'),
  alertMessage: by.id('alert-message'),
  alertButton: by.id('alert-button'),
  
  // Progress Elements
  progressBar: by.id('progress-bar'),
  progressText: by.id('progress-text'),
  progressCircle: by.id('progress-circle'),
  
  // Badge Elements
  badgeContainer: by.id('badge-container'),
  badgeText: by.id('badge-text'),
  badgeIcon: by.id('badge-icon'),
  
  // Tooltip Elements
  tooltipContainer: by.id('tooltip-container'),
  tooltipText: by.id('tooltip-text'),
  tooltipArrow: by.id('tooltip-arrow'),
  
  // Popover Elements
  popoverContainer: by.id('popover-container'),
  popoverContent: by.id('popover-content'),
  popoverArrow: by.id('popover-arrow'),
  
  // Dropdown Elements
  dropdownContainer: by.id('dropdown-container'),
  dropdownTrigger: by.id('dropdown-trigger'),
  dropdownMenu: by.id('dropdown-menu'),
  dropdownItem: by.id('dropdown-item'),
  
  // Multi-select Elements
  multiSelectContainer: by.id('multi-select-container'),
  multiSelectTrigger: by.id('multi-select-trigger'),
  multiSelectItem: by.id('multi-select-item'),
  multiSelectSelected: by.id('multi-select-selected'),
  
  // Date Range Elements
  dateRangeContainer: by.id('date-range-container'),
  dateRangeStart: by.id('date-range-start'),
  dateRangeEnd: by.id('date-range-end'),
  dateRangeApply: by.id('date-range-apply'),
  dateRangeClear: by.id('date-range-clear'),
  
  // Color Picker Elements
  colorPickerContainer: by.id('color-picker-container'),
  colorPickerPalette: by.id('color-picker-palette'),
  colorPickerInput: by.id('color-picker-input'),
  colorPickerConfirm: by.id('color-picker-confirm'),
  
  // Slider Elements
  sliderContainer: by.id('slider-container'),
  sliderTrack: by.id('slider-track'),
  sliderThumb: by.id('slider-thumb'),
  sliderValue: by.id('slider-value'),
  
  // Switch Elements
  switchContainer: by.id('switch-container'),
  switchTrack: by.id('switch-track'),
  switchThumb: by.id('switch-thumb'),
  switchLabel: by.id('switch-label'),
  
  // Rating Elements
  ratingContainer: by.id('rating-container'),
  ratingStar: by.id('rating-star'),
  ratingText: by.id('rating-text'),
  ratingSubmit: by.id('rating-submit'),
  
  // Comment Elements
  commentContainer: by.id('comment-container'),
  commentInput: by.id('comment-input'),
  commentSubmit: by.id('comment-submit'),
  commentList: by.id('comment-list'),
  commentItem: by.id('comment-item'),
  commentText: by.id('comment-text'),
  commentAuthor: by.id('comment-author'),
  commentTime: by.id('comment-time'),
  
  // Like Elements
  likeButton: by.id('like-button'),
  likeCount: by.id('like-count'),
  likeIcon: by.id('like-icon'),
  
  // Share Elements
  shareButton: by.id('share-button'),
  shareCount: by.id('share-count'),
  shareIcon: by.id('share-icon'),
  
  // Bookmark Elements
  bookmarkButton: by.id('bookmark-button'),
  bookmarkIcon: by.id('bookmark-icon'),
  bookmarkCount: by.id('bookmark-count'),
  
  // Follow Elements
  followButton: by.id('follow-button'),
  followCount: by.id('follow-count'),
  followingButton: by.id('following-button'),
  
  // Subscription Elements
  subscribeButton: by.id('subscribe-button'),
  subscribeCount: by.id('subscribe-count'),
  subscribedButton: by.id('subscribed-button'),
  
  // Notification Elements
  notificationToggle: by.id('notification-toggle'),
  notificationSettings: by.id('notification-settings'),
  notificationEmail: by.id('notification-email'),
  notificationPush: by.id('notification-push'),
  notificationSms: by.id('notification-sms'),
  
  // Privacy Elements
  privacyToggle: by.id('privacy-toggle'),
  privacySettings: by.id('privacy-settings'),
  privacyProfile: by.id('privacy-profile'),
  privacyActivity: by.id('privacy-activity'),
  privacyLocation: by.id('privacy-location'),
  
  // Security Elements
  securitySettings: by.id('security-settings'),
  securityTwoFactor: by.id('security-two-factor'),
  securitySessions: by.id('security-sessions'),
  securityPassword: by.id('security-password'),
  securityPin: by.id('security-pin'),
  
  // Backup Elements
  backupButton: by.id('backup-button'),
  backupSettings: by.id('backup-settings'),
  backupNow: by.id('backup-now'),
  backupSchedule: by.id('backup-schedule'),
  backupRestore: by.id('backup-restore'),
  
  // Sync Elements
  syncButton: by.id('sync-button'),
  syncSettings: by.id('sync-settings'),
  syncNow: by.id('sync-now'),
  syncStatus: by.id('sync-status'),
  syncError: by.id('sync-error'),
  
  // Export Elements
  exportButton: by.id('export-button'),
  exportSettings: by.id('export-settings'),
  exportFormat: by.id('export-format'),
  exportData: by.id('export-data'),
  exportConfirm: by.id('export-confirm'),
  
  // Import Elements
  importButton: by.id('import-button'),
  importSettings: by.id('import-settings'),
  importFormat: by.id('import-format'),
  importData: by.id('import-data'),
  importConfirm: by.id('import-confirm'),
  
  // Print Elements
  printButton: by.id('print-button'),
  printSettings: by.id('print-settings'),
  printPreview: by.id('print-preview'),
  printConfirm: by.id('print-confirm'),
  
  // Help Elements
  helpButton: by.id('help-button'),
  helpScreen: by.id('help-screen'),
  helpSearch: by.id('help-search'),
  helpCategory: by.id('help-category'),
  helpArticle: by.id('help-article'),
  helpContact: by.id('help-contact'),
  
  // Tutorial Elements
  tutorialButton: by.id('tutorial-button'),
  tutorialScreen: by.id('tutorial-screen'),
  tutorialStep: by.id('tutorial-step'),
  tutorialNext: by.id('tutorial-next'),
  tutorialSkip: by.id('tutorial-skip'),
  tutorialComplete: by.id('tutorial-complete'),
  
  // Feedback Elements
  feedbackButton: by.id('feedback-button'),
  feedbackScreen: by.id('feedback-screen'),
  feedbackInput: by.id('feedback-input'),
  feedbackSubmit: by.id('feedback-submit'),
  feedbackRating: by.id('feedback-rating'),
  
  // Support Elements
  supportButton: by.id('support-button'),
  supportScreen: by.id('support-screen'),
  supportTicket: by.id('support-ticket'),
  supportChat: by.id('support-chat'),
  supportPhone: by.id('support-phone'),
  supportEmail: by.id('support-email'),
  
  // About Elements
  aboutButton: by.id('about-button'),
  aboutScreen: by.id('about-screen'),
  aboutVersion: by.id('about-version'),
  aboutBuild: by.id('about-build'),
  aboutLicense: by.id('about-license'),
  aboutPrivacy: by.id('about-privacy'),
  aboutTerms: by.id('about-terms'),
  
  // Terms Elements
  termsButton: by.id('terms-button'),
  termsScreen: by.id('terms-screen'),
  termsAccept: by.id('terms-accept'),
  termsDecline: by.id('terms-decline'),
  
  // Privacy Policy Elements
  privacyButton: by.id('privacy-button'),
  privacyScreen: by.id('privacy-screen'),
  privacyAccept: by.id('privacy-accept'),
  privacyDecline: by.id('privacy-decline'),
  
  // Cookie Elements
  cookieBanner: by.id('cookie-banner'),
  cookieAccept: by.id('cookie-accept'),
  cookieDecline: by.id('cookie-decline'),
  cookieSettings: by.id('cookie-settings'),
  
  // Age Verification Elements
  ageVerification: by.id('age-verification'),
  ageInput: by.id('age-input'),
  ageConfirm: by.id('age-confirm'),
  ageDecline: by.id('age-decline'),
  
  // Location Elements
  locationButton: by.id('location-button'),
  locationPermission: by.id('location-permission'),
  locationAllow: by.id('location-allow'),
  locationDeny: by.id('location-deny'),
  locationSettings: by.id('location-settings'),
  
  // Camera Elements
  cameraButton: by.id('camera-button'),
  cameraPermission: by.id('camera-permission'),
  cameraAllow: by.id('camera-allow'),
  cameraDeny: by.id('camera-deny'),
  cameraSettings: by.id('camera-settings'),
  
  // Microphone Elements
  microphoneButton: by.id('microphone-button'),
  microphonePermission: by.id('microphone-permission'),
  microphoneAllow: by.id('microphone-allow'),
  microphoneDeny: by.id('microphone-deny'),
  microphoneSettings: by.id('microphone-settings'),
  
  // Contacts Elements
  contactsButton: by.id('contacts-button'),
  contactsPermission: by.id('contacts-permission'),
  contactsAllow: by.id('contacts-allow'),
  contactsDeny: by.id('contacts-deny'),
  contactsSettings: by.id('contacts-settings'),
  
  // Calendar Elements
  calendarButton: by.id('calendar-button'),
  calendarPermission: by.id('calendar-permission'),
  calendarAllow: by.id('calendar-allow'),
  calendarDeny: by.id('calendar-deny'),
  calendarSettings: by.id('calendar-settings'),
  
  // Photos Elements
  photosButton: by.id('photos-button'),
  photosPermission: by.id('photos-permission'),
  photosAllow: by.id('photos-allow'),
  photosDeny: by.id('photos-deny'),
  photosSettings: by.id('photos-settings'),
  
  // Media Elements
  mediaButton: by.id('media-button'),
  mediaPermission: by.id('media-permission'),
  mediaAllow: by.id('media-allow'),
  mediaDeny: by.id('media-deny'),
  mediaSettings: by.id('media-settings'),
  
  // Storage Elements
  storageButton: by.id('storage-button'),
  storagePermission: by.id('storage-permission'),
  storageAllow: by.id('storage-allow'),
  storageDeny: by.id('storage-deny'),
  storageSettings: by.id('storage-settings'),
  
  // Phone Elements
  phoneButton: by.id('phone-button'),
  phonePermission: by.id('phone-permission'),
  phoneAllow: by.id('phone-allow'),
  phoneDeny: by.id('phone-deny'),
  phoneSettings: by.id('phone-settings'),
  
  // SMS Elements
  smsButton: by.id('sms-button'),
  smsPermission: by.id('sms-permission'),
  smsAllow: by.id('sms-allow'),
  smsDeny: by.id('sms-deny'),
  smsSettings: by.id('sms-settings'),
  
  // Network Elements
  networkButton: by.id('network-button'),
  networkPermission: by.id('network-permission'),
  networkAllow: by.id('network-allow'),
  networkDeny: by.id('network-deny'),
  networkSettings: by.id('network-settings'),
  
  // Bluetooth Elements
  bluetoothButton: by.id('bluetooth-button'),
  bluetoothPermission: by.id('bluetooth-permission'),
  bluetoothAllow: by.id('bluetooth-allow'),
  bluetoothDeny: by.id('bluetooth-deny'),
  bluetoothSettings: by.id('bluetooth-settings'),
  
  // NFC Elements
  nfcButton: by.id('nfc-button'),
  nfcPermission: by.id('nfc-permission'),
  nfcAllow: by.id('nfc-allow'),
  nfcDeny: by.id('nfc-deny'),
  nfcSettings: by.id('nfc-settings'),
  
  // Biometric Elements
  biometricButton: by.id('biometric-button'),
  biometricPermission: by.id('biometric-permission'),
  biometricAllow: by.id('biometric-allow'),
  biometricDeny: by.id('biometric-deny'),
  biometricSettings: by.id('biometric-settings'),
  
  // Face ID Elements
  faceIdButton: by.id('face-id-button'),
  faceIdPermission: by.id('face-id-permission'),
  faceIdAllow: by.id('face-id-allow'),
  faceIdDeny: by.id('face-id-deny'),
  faceIdSettings: by.id('face-id-settings'),
  
  // Touch ID Elements
  touchIdButton: by.id('touch-id-button'),
  touchIdPermission: by.id('touch-id-permission'),
  touchIdAllow: by.id('touch-id-allow'),
  touchIdDeny: by.id('touch-id-deny'),
  touchIdSettings: by.id('touch-id-settings'),
  
  // Voice Elements
  voiceButton: by.id('voice-button'),
  voicePermission: by.id('voice-permission'),
  voiceAllow: by.id('voice-allow'),
  voiceDeny: by.id('voice-deny'),
  voiceSettings: by.id('voice-settings'),
  
  // Gesture Elements
  gestureButton: by.id('gesture-button'),
  gesturePermission: by.id('gesture-permission'),
  gestureAllow: by.id('gesture-allow'),
  gestureDeny: by.id('gesture-deny'),
  gestureSettings: by.id('gesture-settings'),
  
  // Motion Elements
  motionButton: by.id('motion-button'),
  motionPermission: by.id('motion-permission'),
  motionAllow: by.id('motion-allow'),
  motionDeny: by.id('motion-deny'),
  motionSettings: by.id('motion-settings'),
  
  // Health Elements
  healthButton: by.id('health-button'),
  healthPermission: by.id('health-permission'),
  healthAllow: by.id('health-allow'),
  healthDeny: by.id('health-deny'),
  healthSettings: by.id('health-settings'),
  
  // Fitness Elements
  fitnessButton: by.id('fitness-button'),
  fitnessPermission: by.id('fitness-permission'),
  fitnessAllow: by.id('fitness-allow'),
  fitnessDeny: by.id('fitness-denry'),
  fitnessSettings: by.id('fitness-settings'),
  
  // Sleep Elements
  sleepButton: by.id('sleep-button'),
  sleepPermission: by.id('sleep-permission'),
  sleepAllow: by.id('sleep-allow'),
  sleepDeny: by.id('sleep-deny'),
  sleepSettings: by.id('sleep-settings'),
  
  // Mindfulness Elements
  mindfulnessButton: by.id('mindfulness-button'),
  mindfulnessPermission: by.id('mindfulness-permission'),
  mindfulnessAllow: by.id('mindfulness-allow'),
  mindfulnessDeny: by.id('mindfulness-deny'),
  mindfulnessSettings: by.id('mindfulness-settings'),
  
  // Nutrition Elements
  nutritionButton: by.id('nutrition-button'),
  nutritionPermission: by.id('nutrition-permission'),
  nutritionAllow: by.id('nutrition-allow'),
  nutritionDeny: by.id('nutrition-deny'),
  nutritionSettings: by.id('nutrition-settings'),
  
  // Water Elements
  waterButton: by.id('water-button'),
  waterPermission: by.id('water-permission'),
  waterAllow: by.id('water-allow'),
  waterDeny: by.id('water-deny'),
  waterSettings: by.id('water-settings'),
  
  // Caffeine Elements
  caffeineButton: by.id('caffeine-button'),
  caffeinePermission: by.id('caffeine-permission'),
  caffeineAllow: by.id('caffeine-allow'),
  caffeineDeny: by.id('caffeine-deny'),
  caffeineSettings: by.id('caffeine-settings'),
  
  // Alcohol Elements
  alcoholButton: by.id('alcohol-button'),
  alcoholPermission: by.id('alcohol-permission'),
  alcoholAllow: by.id('alcohol-allow'),
  alcoholDeny: by.id('alcohol-deny'),
  alcoholSettings: by.id('alcohol-settings'),
  
  // Tobacco Elements
  tobaccoButton: by.id('tobacco-button'),
  tobaccoPermission: by.id('tobacco-permission'),
  tobaccoAllow: by.id('tobacco-allow'),
  tobaccoDeny: by.id('tobacco-deny'),
  tobaccoSettings: by.id('tobacco-settings'),
  
  // Drug Elements
  drugButton: by.id('drug-button'),
  drugPermission: by.id('drug-permission'),
  drugAllow: by.id('drug-allow'),
  drugDeny: by.id('drug-deny'),
  drugSettings: by.id('drug-settings'),
  
  // Medication Elements
  medicationButton: by.id('medication-button'),
  medicationPermission: by.id('medication-permission'),
  medicationAllow: by.id('medication-allow'),
  medicationDeny: by.id('medication-deny'),
  medicationSettings: by.id('medication-settings'),
  
  // Allergy Elements
  allergyButton: by.id('allergy-button'),
  allergyPermission: by.id('allergy-permission'),
  allergyAllow: by.id('allergy-allow'),
  allergyDeny: by.id('allergy-deny'),
  allergySettings: by.id('allergy-settings'),
  
  // Blood Type Elements
  bloodTypeButton: by.id('blood-type-button'),
  bloodTypePermission: by.id('blood-type-permission'),
  bloodTypeAllow: by.id('blood-type-allow'),
  bloodTypeDeny: by.id('blood-type-deny'),
  bloodTypeSettings: by.id('blood-type-settings'),
  
  // Emergency Contact Elements
  emergencyContactButton: by.id('emergency-contact-button'),
  emergencyContactPermission: by.id('emergency-contact-permission'),
  emergencyContactAllow: by.id('emergency-contact-allow'),
  emergencyContactDeny: by.id('emergency-contact-deny'),
  emergencyContactSettings: by.id('emergency-contact-settings'),
  
  // Medical ID Elements
  medicalIdButton: by.id('medical-id-button'),
  medicalIdPermission: by.id('medical-id-permission'),
  medicalIdAllow: by.id('medical-id-allow'),
  medicalIdDeny: by.id('medical-id-deny'),
  medicalIdSettings: by.id('medical-id-settings'),
  
  // Insurance Elements
  insuranceButton: by.id('insurance-button'),
  insurancePermission: by.id('insurance-permission'),
  insuranceAllow: by.id('insurance-allow'),
  insuranceDeny: by.id('insurance-deny'),
  insuranceSettings: by.id('insurance-settings'),
  
  // Prescription Elements
  prescriptionButton: by.id('prescription-button'),
  prescriptionPermission: by.id('prescription-permission'),
  prescriptionAllow: by.id('prescription-allow'),
  prescriptionDeny: by.id('prescription-deny'),
  prescriptionSettings: by.id('prescription-settings'),
  
  // Lab Results Elements
  labResultsButton: by.id('lab-results-button'),
  labResultsPermission: by.id('lab-results-permission'),
  labResultsAllow: by.id('lab-results-allow'),
  labResultsDeny: by.id('lab-results-deny'),
  labResultsSettings: by.id('lab-results-settings'),
  
  // Vaccination Elements
  vaccinationButton: by.id('vaccination-button'),
  vaccinationPermission: by.id('vaccination-permission'),
  vaccinationAllow: by.id('vaccination-allow'),
  vaccinationDeny: by.id('vaccination-denry'),
  vaccinationSettings: by.id('vaccination-settings'),
  
  // Immunization Elements
  immunizationButton: by.id('immunization-button'),
  immunizationPermission: by.id('immunization-permission'),
  immunizationAllow: by.id('immunization-allow'),
  immunizationDeny: by.id('immunization-deny'),
  immunizationSettings: by.id('immunization-settings'),
  
  // Disease Elements
  diseaseButton: by.id('disease-button'),
  diseasePermission: by.id('disease-permission'),
  diseaseAllow: by.id('disease-allow'),
  diseaseDeny: by.id('disease-deny'),
  diseaseSettings: by.id('disease-settings'),
  
  // Condition Elements
  conditionButton: by.id('condition-button'),
  conditionPermission: by.id('condition-permission'),
  conditionAllow: by.id('condition-allow'),
  conditionDeny: by.id('condition-deny'),
  conditionSettings: by.id('condition-settings'),
  
  // Symptom Elements
  symptomButton: by.id('symptom-button'),
  symptomPermission: by.id('symptom-permission'),
  symptomAllow: by.id('symptom-allow'),
  symptomDeny: by.id('symptom-deny'),
  symptomSettings: by.id('symptom-settings'),
  
  // Treatment Elements
  treatmentButton: by.id('treatment-button'),
  treatmentPermission: by.id('treatment-permission'),
  treatmentAllow: by.id('treatment-allow'),
  treatmentDeny: by.id('treatment-deny'),
  treatmentSettings: by.id('treatment-settings'),
  
  // Procedure Elements
  procedureButton: by.id('procedure-button'),
  procedurePermission: by.id('procedure-permission'),
  procedureAllow: by.id('procedure-allow'),
  procedureDeny: by.id('procedure-deny'),
  procedureSettings: by.id('procedure-settings'),
  
  // Hospital Elements
  hospitalButton: by.id('hospital-button'),
  hospitalPermission: by.id('hospital-permission'),
  hospitalAllow: by.id('hospital-allow'),
  hospitalDeny: by.id('hospital-deny'),
  hospitalSettings: by.id('hospital-settings'),
  
  // Doctor Elements
  doctorButton: by.id('doctor-button'),
  doctorPermission: by.id('doctor-permission'),
  doctorAllow: by.id('doctor-allow'),
  doctorDeny: by.id('doctor-deny'),
  doctorSettings: by.id('doctor-settings'),
  
  // Appointment Elements
  appointmentButton: by.id('appointment-button'),
  appointmentPermission: by.id('appointment-permission'),
  appointmentAllow: by.id('appointment-allow'),
  appointmentDeny: by.id('appointment-deny'),
  appointmentSettings: by.id('appointment-settings'),
  
  // Reminder Elements
  reminderButton: by.id('reminder-button'),
  reminderPermission: by.id('reminder-permission'),
  reminderAllow: by.id('reminder-allow'),
  reminderDeny: by.id('reminder-deny'),
  reminderSettings: by.id('reminder-settings'),
  
  // Alert Elements
  alertButton: by.id('alert-button'),
  alertPermission: by.id('alert-permission'),
  alertAllow: by.id('alert-allow'),
  alertDeny: by.id('alert-deny'),
  alertSettings: by.id('alert-settings'),
  
  // Notification Elements
  notificationButton: by.id('notification-button'),
  notificationPermission: by.id('notification-permission'),
  notificationAllow: by.id('notification-allow'),
  notificationDeny: by.id('notification-deny'),
  notificationSettings: by.id('notification-settings'),
  
  // Push Elements
  pushButton: by.id('push-button'),
  pushPermission: by.id('push-permission'),
  pushAllow: by.id('push-allow'),
  pushDeny: by.id('push-deny'),
  pushSettings: by.id('push-settings'),
  
  // Email Elements
  emailButton: by.id('email-button'),
  emailPermission: by.id('email-permission'),
  emailAllow: by.id('email-allow'),
  emailDeny: by.id('email-deny'),
  emailSettings: by.id('email-settings'),
  
  // SMS Elements
  smsButton: by.id('sms-button'),
  smsPermission: by.id('sms-permission'),
  smsAllow: by.id('sms-allow'),
  smsDeny: by.id('sms-deny'),
  smsSettings: by.id('sms-settings'),
  
  // Call Elements
  callButton: by.id('call-button'),
  callPermission: by.id('call-permission'),
  callAllow: by.id('call-allow'),
  callDeny: by.id('call-deny'),
  callSettings: by.id('call-settings'),
  
  // Video Call Elements
  videoCallButton: by.id('video-call-button'),
  videoCallPermission: by.id('video-call-permission'),
  videoCallAllow: by.id('video-call-allow'),
  videoCallDeny: by.id('video-call-deny'),
  videoCallSettings: by.id('video-call-settings'),
  
  // Screen Share Elements
  screenShareButton: by.id('screen-share-button'),
  screenSharePermission: by.id('screen-share-permission'),
  screenShareAllow: by.id('screen-share-allow'),
  screenShareDeny: by.id('screen-share-deny'),
  screenShareSettings: by.id('screen-share-settings'),
  
  // Recording Elements
  recordingButton: by.id('recording-button'),
  recordingPermission: by.id('recording-permission'),
  recordingAllow: by.id('recording-allow'),
  recordingDeny: by.id('recording-deny'),
  recordingSettings: by.id('recording-settings'),
  
  // Analytics Elements
  analyticsButton: by.id('analytics-button'),
  analyticsPermission: by.id('analytics-permission'),
  analyticsAllow: by.id('analytics-allow'),
  analyticsDeny: by.id('analytics-deny'),
  analyticsSettings: by.id('analytics-settings'),
  
  // Crash Reporting Elements
  crashReportingButton: by.id('crash-reporting-button'),
  crashReportingPermission: by.id('crash-reporting-permission'),
  crashReportingAllow: by.id('crash-reporting-allow'),
  crashReportingDeny: by.id('crash-reporting-deny'),
  crashReportingSettings: by.id('crash-reporting-settings'),
  
  // Performance Elements
  performanceButton: by.id('performance-button'),
  performancePermission: by.id('performance-permission'),
  performanceAllow: by.id('performance-allow'),
  performanceDeny: by.id('performance-deny'),
  performanceSettings: by.id('performance-settings'),
  
  // Usage Elements
  usageButton: by.id('usage-button'),
  usagePermission: by.id('usage-permission'),
  usageAllow: by.id('usage-allow'),
  usageDeny: by.id('usage-deny'),
  usageSettings: by.id('usage-settings'),
  
  // Diagnostic Elements
  diagnosticButton: by.id('diagnostic-button'),
  diagnosticPermission: by.id('diagnostic-permission'),
  diagnosticAllow: by.id('diagnostic-allow'),
  diagnosticDeny: by.id('diagnostic-deny'),
  diagnosticSettings: by.id('diagnostic-settings'),
  
  // Debug Elements
  debugButton: by.id('debug-button'),
  debugPermission: by.id('debug-permission'),
  debugAllow: by.id('debug-allow'),
  debugDeny: by.id('debug-deny'),
  debugSettings: by.id('debug-settings'),
  
  // Test Elements
  testButton: by.id('test-button'),
  testPermission: by.id('test-permission'),
  testAllow: by.id('test-allow'),
  testDeny: by.id('test-deny'),
  testSettings: by.id('test-settings'),
  
  // Development Elements
  developmentButton: by.id('development-button'),
  developmentPermission: by.id('development-permission'),
  developmentAllow: by.id('development-allow'),
  developmentDeny: by.id('development-deny'),
  developmentSettings: by.id('development-settings'),
  
  // Staging Elements
  stagingButton: by.id('staging-button'),
  stagingPermission: by.id('staging-permission'),
  stagingAllow: by.id('staging-allow'),
  stagingDeny: by.id('staging-deny'),
  stagingSettings: by.id('staging-settings'),
  
  // Production Elements
  productionButton: by.id('production-button'),
  productionPermission: by.id('production-permission'),
  productionAllow: by.id('production-allow'),
  productionDeny: by.id('production-deny'),
  productionSettings: by.id('production-settings'),
  
  // Root Elements
  rootContainer: by.id('root-container'),
  rootView: by.id('root-view'),
  rootScrollView: by.id('root-scroll-view'),
  rootSafeArea: by.id('root-safe-area'),
  
  // Test IDs
  testId: (id) => by.id(id),
  testText: (text) => by.text(text),
  testLabel: (label) => by.label(label),
  testType: (type) => by.type(type),
  testTraits: (traits) => by.traits(traits),
  
  // Custom Selectors
  customSelector: (selector) => selector,
  
  // Dynamic Selectors
  dynamicSelector: (baseId, index) => by.id(`${baseId}-${index}`),
  
  // Accessibility Selectors
  accessibilityLabel: (label) => by.label(label),
  accessibilityHint: (hint) => by.hint(hint),
  accessibilityValue: (value) => by.value(value),
  
  // Platform Specific Selectors
  iosSelector: (selector) => by.ios(selector),
  androidSelector: (selector) => by.android(selector),
  
  // Web Specific Selectors
  webSelector: (selector) => by.web(selector),
  
  // XPath Selectors
  xpathSelector: (xpath) => by.xpath(xpath),
  
  // CSS Selectors
  cssSelector: (css) => by.css(css),
  
  // Class Name Selectors
  classNameSelector: (className) => by.className(className),
  
  // Tag Name Selectors
  tagNameSelector: (tagName) => by.tagName(tagName),
  
  // Name Selectors
  nameSelector: (name) => by.name(name),
  
  // Value Selectors
  valueSelector: (value) => by.value(value),
  
  // Placeholder Selectors
  placeholderSelector: (placeholder) => by.placeholder(placeholder),
  
  // Title Selectors
  titleSelector: (title) => by.title(title),
  
  // Alt Selectors
  altSelector: (alt) => by.alt(alt),
  
  // Src Selectors
  srcSelector: (src) => by.src(src),
  
  // Href Selectors
  hrefSelector: (href) => by.href(href),
  
  // Action Selectors
  actionSelector: (action) => by.action(action),
  
  // State Selectors
  stateSelector: (state) => by.state(state),
  
  // Property Selectors
  propertySelector: (property) => by.property(property),
  
  // Attribute Selectors
  attributeSelector: (attribute) => by.attribute(attribute),
  
  // Data Attribute Selectors
  dataAttributeSelector: (dataAttribute) => by.dataAttribute(dataAttribute),
  
  // Role Selectors
  roleSelector: (role) => by.role(role),
  
  // Aria Selectors
  ariaSelector: (aria) => by.aria(aria),
  
  // Focus Selectors
  focusSelector: () => by.focus(),
  
  // Blur Selectors
  blurSelector: () => by.blur(),
  
  // Visible Selectors
  visibleSelector: () => by.visible(),
  
  // Hidden Selectors
  hiddenSelector: () => by.hidden(),
  
  // Enabled Selectors
  enabledSelector: () => by.enabled(),
  
  // Disabled Selectors
  disabledSelector: () => by.disabled(),
  
  // Selected Selectors
  selectedSelector: () => by.selected(),
  
  // Checked Selectors
  checkedSelector: () => by.checked(),
  
  // Unchecked Selectors
  uncheckedSelector: () => by.unchecked(),
  
  // Focused Selectors
  focusedSelector: () => by.focused(),
  
  // Unfocused Selectors
  unfocusedSelector: () => by.unfocused(),
  
  // Active Selectors
  activeSelector: () => by.active(),
  
  // Inactive Selectors
  inactiveSelector: () => by.inactive(),
  
  // Valid Selectors
  validSelector: () => by.valid(),
  
  // Invalid Selectors
  invalidSelector: () => by.invalid(),
  
  // Required Selectors
  requiredSelector: () => by.required(),
  
  // Optional Selectors
  optionalSelector: () => by.optional(),
  
  // Read Only Selectors
  readOnlySelector: () => by.readOnly(),
  
  // Editable Selectors
  editableSelector: () => by.editable(),
  
  // Empty Selectors
  emptySelector: () => by.empty(),
  
  // Non Empty Selectors
  nonEmptySelector: () => by.nonEmpty(),
  
  // Contains Text Selectors
  containsTextSelector: (text) => by.containsText(text),
  
  // Starts With Text Selectors
  startsWithTextSelector: (text) => by.startsWithText(text),
  
  // Ends With Text Selectors
  endsWithTextSelector: (text) => by.endsWithText(text),
  
  // Matches Text Selectors
  matchesTextSelector: (text) => by.matchesText(text),
  
  // Contains Value Selectors
  containsValueSelector: (value) => by.containsValue(value),
  
  // Starts With Value Selectors
  startsWithValueSelector: (value) => by.startsWithValue(value),
  
  // Ends With Value Selectors
  endsWithValueSelector: (value) => by.endsWithValue(value),
  
  // Matches Value Selectors
  matchesValueSelector: (value) => by.matchesValue(value),
  
  // Contains Attribute Selectors
  containsAttributeSelector: (attribute, value) => by.containsAttribute(attribute, value),
  
  // Starts With Attribute Selectors
  startsWithAttributeSelector: (attribute, value) => by.startsWithAttribute(attribute, value),
  
  // Ends With Attribute Selectors
  endsWithAttributeSelector: (attribute, value) => by.endsWithAttribute(attribute, value),
  
  // Matches Attribute Selectors
  matchesAttributeSelector: (attribute, value) => by.matchesAttribute(attribute, value),
  
  // Has Class Selectors
  hasClassSelector: (className) => by.hasClass(className),
  
  // Has Attribute Selectors
  hasAttributeSelector: (attribute) => by.hasAttribute(attribute),
  
  // Has Property Selectors
  hasPropertySelector: (property) => by.hasProperty(property),
  
  // Has Style Selectors
  hasStyleSelector: (style) => by.hasStyle(style),
  
  // Has Text Selectors
  hasTextSelector: (text) => by.hasText(text),
  
  // Has Value Selectors
  hasValueSelector: (value) => by.hasValue(value),
  
  // Has Child Selectors
  hasChildSelector: (child) => by.hasChild(child),
  
  // Has Descendant Selectors
  hasDescendantSelector: (descendant) => by.hasDescendant(descendant),
  
  // Has Parent Selectors
  hasParentSelector: (parent) => by.hasParent(parent),
  
  // Has Ancestor Selectors
  hasAncestorSelector: (ancestor) => by.hasAncestor(ancestor),
  
  // Has Sibling Selectors
  hasSiblingSelector: (sibling) => by.hasSibling(sibling),
  
  // Is Child Of Selectors
  isChildOfSelector: (parent) => by.isChildOf(parent),
  
  // Is Descendant Of Selectors
  isDescendantOfSelector: (ancestor) => by.isDescendantOf(ancestor),
  
  // Is Parent Of Selectors
  isParentOfSelector: (child) => by.isParentOf(child),
  
  // Is Ancestor Of Selectors
  isAncestorOfSelector: (descendant) => by.isAncestorOf(descendant),
  
  // Is Sibling Of Selectors
  isSiblingOfSelector: (sibling) => by.isSiblingOf(sibling),
  
  // First Child Selectors
  firstChildSelector: () => by.firstChild(),
  
  // Last Child Selectors
  lastChildSelector: () => by.lastChild(),
  
  // Nth Child Selectors
  nthChildSelector: (n) => by.nthChild(n),
  
  // Only Child Selectors
  onlyChildSelector: () => by.onlyChild(),
  
  // First Of Type Selectors
  firstOfTypeSelector: () => by.firstOfType(),
  
  // Last Of Type Selectors
  lastOfTypeSelector: () => by.lastOfType(),
  
  // Nth Of Type Selectors
  nthOfTypeSelector: (n) => by.nthOfType(n),
  
  // Only Of Type Selectors
  onlyOfTypeSelector: () => by.onlyOfType(),
  
  // Empty Content Selectors
  emptyContentSelector: () => by.emptyContent(),
  
  // Not Empty Content Selectors
  notEmptyContentSelector: () => by.notEmptyContent(),
  
  // Content Length Selectors
  contentLengthSelector: (length) => by.contentLength(length),
  
  // Content Contains Selectors
  contentContainsSelector: (text) => by.contentContains(text),
  
  // Content Starts With Selectors
  contentStartsWithSelector: (text) => by.contentStartsWith(text),
  
  // Content Ends With Selectors
  contentEndsWithSelector: (text) => by.contentEndsWith(text),
  
  // Content Matches Selectors
  contentMatchesSelector: (text) => by.contentMatches(text),
  
  // Text Length Selectors
  textLengthSelector: (length) => by.textLength(length),
  
  // Text Contains Selectors
  textContainsSelector: (text) => by.textContains(text),
  
  // Text Starts With Selectors
  textStartsWithSelector: (text) => by.textStartsWith(text),
  
  // Text Ends With Selectors
  textEndsWithSelector: (text) => by.textEndsWith(text),
  
  // Text Matches Selectors
  matchesTextSelector: (text) => by.matchesText(text),
  
  // Value Length Selectors
  valueLengthSelector: (length) => by.valueLength(length),
  
  // Value Contains Selectors
  valueContainsSelector: (value) => by.valueContains(value),
  
  // Value Starts With Selectors
  valueStartsWithSelector: (value) => by.startsWithValue(value),
  
  // Value Ends With Selectors
  valueEndsWithSelector: (value) => by.endsWithValue(value),
  
  // Value Matches Selectors
  valueMatchesSelector: (value) => by.matchesValue(value),
  
  // Attribute Length Selectors
  attributeLengthSelector: (attribute, length) => by.attributeLength(attribute, length),
  
  // Attribute Contains Selectors
  attributeContainsSelector: (attribute, value) => by.attributeContains(attribute, value),
  
  // Attribute Starts With Selectors
  attributeStartsWithSelector: (attribute, value) => by.attributeStartsWith(attribute, value),
  
  // Attribute Ends With Selectors
  attributeEndsWithSelector: (attribute, value) => by.attributeEndsWith(attribute, value),
  
  // Attribute Matches Selectors
  attributeMatchesSelector: (attribute, value) => by.attributeMatches(attribute, value),
  
  // Class Length Selectors
  classLengthSelector: (length) => by.classLength(length),
  
  // Class Contains Selectors
  classContainsSelector: (className) => by.classContains(className),
  
  // Class Starts With Selectors
  classStartsWithSelector: (className) => by.classStartsWith(className),
  
  // Class Ends With Selectors
  classEndsWithSelector: (className) => by.classEndsWith(className),
  
  // Class Matches Selectors
  classMatchesSelector: (className) => by.classMatches(className),
  
  // Style Length Selectors
  styleLengthSelector: (length) => by.styleLength(length),
  
  // Style Contains Selectors
  styleContainsSelector: (style) => by.styleContains(style),
  
  // Style Starts With Selectors
  styleStartsWithSelector: (style) => by.styleStartsWith(style),
  
  // Style Ends With Selectors
  styleEndsWithSelector: (style) => by.styleEndsWith(style),
  
  // Style Matches Selectors
  styleMatchesSelector: (style) => by.styleMatches(style),
  
  // Position Selectors
  positionSelector: (position) => by.position(position),
  
  // Index Selectors
  indexSelector: (index) => by.index(index),
  
  // Length Selectors
  lengthSelector: (length) => by.length(length),
  
  // Count Selectors
  countSelector: (count) => by.count(count),
  
  // Size Selectors
  sizeSelector: (size) => by.size(size),
  
  // Width Selectors
  widthSelector: (width) => by.width(width),
  
  // Height Selectors
  heightSelector: (height) => by.height(height),
  
  // Dimension Selectors
  dimensionSelector: (width, height) => by.dimension(width, height),
  
  // Position Absolute Selectors
  positionAbsoluteSelector: (x, y) => by.positionAbsolute(x, y),
  
  // Position Relative Selectors
  positionRelativeSelector: (x, y) => by.positionRelative(x, y),
  
  // Offset Selectors
  offsetSelector: (x, y) => by.offset(x, y),
  
  // Margin Selectors
  marginSelector: (top, right, bottom, left) => by.margin(top, right, bottom, left),
  
  // Padding Selectors
  paddingSelector: (top, right, bottom, left) => by.padding(top, right, bottom, left),
  
  // Border Selectors
  borderSelector: (width, style, color) => by.border(width, style, color),
  
  // Background Selectors
  backgroundSelector: (color) => by.background(color),
  
  // Color Selectors
  colorSelector: (color) => by.color(color),
  
  // Font Selectors
  fontSelector: (family, size, weight) => by.font(family, size, weight),
  
  // Text Align Selectors
  textAlignSelector: (align) => by.textAlign(align),
  
  // Text Decoration Selectors
  textDecorationSelector: (decoration) => by.textDecoration(decoration),
  
  // Text Transform Selectors
  textTransformSelector: (transform) => by.textTransform(transform),
  
  // Line Height Selectors
  lineHeightSelector: (height) => by.lineHeight(height),
  
  // Letter Spacing Selectors
  letterSpacingSelector: (spacing) => by.letterSpacing(spacing),
  
  // Word Spacing Selectors
  wordSpacingSelector: (spacing) => by.wordSpacing(spacing),
  
  // Text Shadow Selectors
  textShadowSelector: (shadow) => by.textShadow(shadow),
  
  // Box Shadow Selectors
  boxShadowSelector: (shadow) => by.boxShadow(shadow),
  
  // Border Radius Selectors
  borderRadiusSelector: (radius) => by.borderRadius(radius),
  
  // Opacity Selectors
  opacitySelector: (opacity) => by.opacity(opacity),
  
  // Visibility Selectors
  visibilitySelector: (visibility) => by.visibility(visibility),
  
  // Display Selectors
  displaySelector: (display) => by.display(display),
  
  // Overflow Selectors
  overflowSelector: (overflow) => by.overflow(overflow),
  
  // Z Index Selectors
  zIndexSelector: (zIndex) => by.zIndex(zIndex),
  
  // Transform Selectors
  transformSelector: (transform) => by.transform(transform),
  
  // Transition Selectors
  transitionSelector: (transition) => by.transition(transition),
  
  // Animation Selectors
  animationSelector: (animation) => by.animation(animation),
  
  // Cursor Selectors
  cursorSelector: (cursor) => by.cursor(cursor),
  
  // Pointer Events Selectors
  pointerEventsSelector: (events) => by.pointerEvents(events),
  
  // User Select Selectors
  userSelectSelector: (select) => by.userSelect(select),
  
  // Resize Selectors
  resizeSelector: (resize) => by.resize(resize),
  
  // Outline Selectors
  outlineSelector: (outline) => by.outline(outline),
  
  // Focus Selectors
  focusSelector: (focus) => by.focus(focus),
  
  // Hover Selectors
  hoverSelector: (hover) => by.hover(hover),
  
  // Active Selectors
  activeSelector: (active) => by.active(active),
  
  // Visited Selectors
  visitedSelector: (visited) => by.visited(visited),
  
  // Link Selectors
  linkSelector: (link) => by.link(link),
  
  // Button Selectors
  buttonSelector: (button) => by.button(button),
  
  // Input Selectors
  inputSelector: (input) => by.input(input),
  
  // Form Selectors
  formSelector: (form) => by.form(form),
  
  // Select Selectors
  selectSelector: (select) => by.select(select),
  
  // Textarea Selectors
  textareaSelector: (textarea) => by.textarea(textarea),
  
  // Checkbox Selectors
  checkboxSelector: (checkbox) => by.checkbox(checkbox),
  
  // Radio Selectors
  radioSelector: (radio) => by.radio(radio),
  
  // File Selectors
  fileSelector: (file) => by.file(file),
  
  // Image Selectors
  imageSelector: (image) => by.image(image),
  
  // Video Selectors
  videoSelector: (video) => by.video(video),
  
  // Audio Selectors
  audioSelector: (audio) => by.audio(audio),
  
  // Canvas Selectors
  canvasSelector: (canvas) => by.canvas(canvas),
  
  // SVG Selectors
  svgSelector: (svg) => by.svg(svg),
  
  // Math Selectors
  mathSelector: (math) => by.math(math),
  
  // Object Selectors
  objectSelector: (object) => by.object(object),
  
  // Embed Selectors
  embedSelector: (embed) => by.embed(embed),
  
  // Param Selectors
  paramSelector: (param) => by.param(param),
  
  // Source Selectors
  sourceSelector: (source) => by.source(source),
  
  // Track Selectors
  trackSelector: (track) => by.track(track),
  
  // Area Selectors
  areaSelector: (area) => by.area(area),
  
  // Map Selectors
  mapSelector: (map) => by.map(map),
  
  // Frame Selectors
  frameSelector: (frame) => by.frame(frame),
  
  // Iframe Selectors
  iframeSelector: (iframe) => by.iframe(iframe),
  
  // Script Selectors
  scriptSelector: (script) => by.script(script),
  
  // Noscript Selectors
  noscriptSelector: (noscript) => by.noscript(noscript),
  
  // Style Selectors
  styleSelector: (style) => by.style(style),
  
  // Meta Selectors
  metaSelector: (meta) => by.meta(meta),
  
  // Link Rel Selectors
  linkRelSelector: (rel) => by.linkRel(rel),
  
  // Link Type Selectors
  linkTypeSelector: (type) => by.linkType(type),
  
  // Link Href Selectors
  linkHrefSelector: (href) => by.linkHref(href),
  
  // Link Media Selectors
  linkMediaSelector: (media) => by.linkMedia(media),
  
  // Link Target Selectors
  linkTargetSelector: (target) => by.linkTarget(target),
  
  // Script Type Selectors
  scriptTypeSelector: (type) => by.scriptType(type),
  
  // Script Src Selectors
  scriptSrcSelector: (src) => by.scriptSrc(src),
  
  // Style Type Selectors
  styleTypeSelector: (type) => by.styleType(type),
  
  // Style Media Selectors
  styleMediaSelector: (media) => by.styleMedia(media),
  
  // Meta Name Selectors
  metaNameSelector: (name) => by.metaName(name),
  
  // Meta Content Selectors
  metaContentSelector: (content) => by.metaContent(content),
  
  // Meta Property Selectors
  metaPropertySelector: (property) => by.metaProperty(property),
  
  // Meta Charset Selectors
  metaCharsetSelector: (charset) => by.metaCharset(charset),
  
  // Meta Http Equiv Selectors
  metaHttpEquivSelector: (httpEquiv) => by.metaHttpEquiv(httpEquiv),
  
  // Title Text Selectors
  titleTextSelector: (text) => by.titleText(text),
  
  // Body Selectors
  bodySelector: () => by.body(),
  
  // Html Selectors
  htmlSelector: () => by.html(),
  
  // Head Selectors
  headSelector: () => by.head(),
  
  // Document Selectors
  documentSelector: () => by.document(),
  
  // Window Selectors
  windowSelector: () => by.window(),
  
  // Screen Selectors
  screenSelector: () => by.screen(),
  
  // Navigator Selectors
  navigatorSelector: () => by.navigator(),
  
  // Location Selectors
  locationSelector: () => by.location(),
  
  // History Selectors
  historySelector: () => by.history(),
  
  // Console Selectors
  consoleSelector: () => by.console(),
  
  // Local Storage Selectors
  localStorageSelector: () => by.localStorage(),
  
  // Session Storage Selectors
  sessionStorageSelector: () => by.sessionStorage(),
  
  // Cookie Selectors
  cookieSelector: () => by.cookie(),
  
  // Database Selectors
  databaseSelector: () => by.database(),
  
  // Cache Selectors
  cacheSelector: () => by.cache(),
  
  // Service Worker Selectors
  serviceWorkerSelector: () => by.serviceWorker(),
  
  // Web Worker Selectors
  webWorkerSelector: () => by.webWorker(),
  
  // Shared Worker Selectors
  sharedWorkerSelector: () => by.sharedWorker(),
  
  // Dedicated Worker Selectors
  dedicatedWorkerSelector: () => by.dedicatedWorker(),
  
  // Notification Selectors
  notificationSelector: () => by.notification(),
  
  // Push Notification Selectors
  pushNotificationSelector: () => by.pushNotification(),
  
  // Web Push Selectors
  webPushSelector: () => by.webPush(),
  
  // Geolocation Selectors
  geolocationSelector: () => by.geolocation(),
  
  // Device Orientation Selectors
  deviceOrientationSelector: () => by.deviceOrientation(),
  
  // Device Motion Selectors
  deviceMotionSelector: () => by.deviceMotion(),
  
  // Touch Events Selectors
  touchEventsSelector: () => by.touchEvents(),
  
  // Pointer Events Selectors
  pointerEventsSelector: () => by.pointerEvents(),
  
  // Mouse Events Selectors
  mouseEventsSelector: () => by.mouseEvents(),
  
  // Keyboard Events Selectors
  keyboardEventsSelector: () => by.keyboardEvents(),
  
  // Focus Events Selectors
  focusEventsSelector: () => by.focusEvents(),
  
  // Form Events Selectors
  formEventsSelector: () => by.formEvents(),
  
  // Drag Events Selectors
  dragEventsSelector: () => by.dragEvents(),
  
  // Clipboard Events Selectors
  clipboardEventsSelector: () => by.clipboardEvents(),
  
  // Print Events Selectors
  printEventsSelector: () => by.printEvents(),
  
  // Media Events Selectors
  mediaEventsSelector: () => by.mediaEvents(),
  
  // Animation Events Selectors
  animationEventsSelector: () => by.animationEvents(),
  
  // Transition Events Selectors
  transitionEventsSelector: () => by.transitionEvents(),
  
  // Network Events Selectors
  networkEventsSelector: () => by.networkEvents(),
  
  // Storage Events Selectors
  storageEventsSelector: () => by.storageEvents(),
  
  // Database Events Selectors
  databaseEventsSelector: () => by.databaseEvents(),
  
  // Cache Events Selectors
  cacheEventsSelector: () => by.cacheEvents(),
  
  // Resource Events Selectors
  resourceEventsSelector: () => by.resourceEvents(),
  
  // Performance Events Selectors
  performanceEventsSelector: () => by.performanceEvents(),
  
  // Security Events Selectors
  securityEventsSelector: () => by.securityEvents(),
  
  // Error Events Selectors
  errorEventsSelector: () => by.errorEvents(),
  
  // Load Events Selectors
  loadEventsSelector: () => by.loadEvents(),
  
  // Un