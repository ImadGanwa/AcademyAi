export interface Translations {
  common: {
    currency: string;
    or: string;
    off: string;
    loading: string;
    cancel: string;
    startLearning: string;
    buttons: {
      login: string;
      signup: string;
      submit: string;
      cancel: string;
      confirm: string;
      add: string;
      save: string;
      remove: string;
    };
    cart: {
      title: string;
      itemCount: string;
      addedToCart: {
        title: string;
        button: string;
      };
      popularPack: {
        title: string;
        addToCart: string;
        total: string;
      };
      summary: {
        title: string;
        originalPrice: string;
        discount: string;
        total: string;
        enterCoupon: string;
        removeCode: string;
        checkout: string;
        apply: string;
        isApplied: string;
        promotions: string;
      };
    };
    checkout: {
      title: string;
      billingAddress: string;
      country: string;
      paymentMethod: string;
      secureAndEncrypted: string;
      paypal: string;
      creditDebitCard: string;
      nameOnCard: string;
      cardNumber: string;
      expiryDate: string;
      securelySaveCard: string;
      googlePay: string;
      orderDetails: string;
      originalPrice: string;
      discounts: string;
      subtotal: string;
      tax: string;
      total: string;
      byCompletingPurchase: string;
      termsOfService: string;
      completeCheckout: string;
      thirtyDayMoneyBackGuarantee: string;
      pleaseLoginToPurchaseCourse: string;
      summary: string;
      morocco: string;
      algeria: string;
      tunisia: string;
      egypt: string;
      saudi: string;
      uae: string;
      qatar: string;
      kuwait: string;
    };
    navigation: {
      home: string;
      courses: string;
      business: string;
      teach: string;
      businessLink: string;
      teachLink: string;
      studyLink: string;
      becomeAMentor: string;
      mentorship: string;
      searchPlaceholder: string;
    };
    languages: {
      en: string;
      fr: string;
      ar: string;
    };
    accessibility: {
      languageSelector: string;
      mainNavigation: string;
      userMenu: string;
      currencySelector: string;
    };
    footer: {
      explore: string;
      resources: string;
      company: string;
      getApp: string;
      aboutUs: string;
      contactUs: string;
      blog: string;
      helpSupport: string;
      affiliate: string;
      investors: string;
      terms: string;
      privacy: string;
      cookieSettings: string;
      sitemap: string;
      accessibility: string;
      language: string;
    };
    pages: {
      placeholder: {
        title: string;
        description: string;
      };
    };
  };
  components: {
    title: string;
    description: string;
    sections: {
      common: {
        title: string;
        buttons: {
          title: string;
          description: string;
          variants: string;
          sizes: string;
          contained: string;
          outlined: string;
          text: string;
          small: string;
          medium: string;
          large: string;
          iconButtons: {
            title: string;
            google: string;
            linkedin: string;
            send: string;
            add: string;
          };
          states: {
            title: string;
            disabled: string;
            fullWidth: string;
          };
          linkButtons: {
            title: string;
            default: string;
            outlined: string;
            text: string;
          };
        };
        inputs: {
          title: string;
          description: string;
          types: {
            text: string;
            password: string;
            search: string;
            language: string;
          };
          basic: {
            title: string;
            default: {
              label: string;
              placeholder: string;
            };
            error: {
              label: string;
              helper: string;
            };
            disabled: {
              label: string;
              value: string;
            };
          };
          withIcons: {
            title: string;
            email: {
              label: string;
              placeholder: string;
            };
            password: {
              label: string;
              placeholder: string;
              helper: string;
            };
            name: {
              label: string;
              placeholder: string;
            };
            phone: {
              label: string;
              placeholder: string;
            };
          };
          searchInput: {
            title: string;
            label: string;
            placeholder: string;
          };
        };
        cards: {
          title: string;
          description: string;
          course: {
            title: string;
            trainer: string;
            tag: string;
            sampleTitle: string;
            sampleTrainer: string;
            sampleTag: string;
            sampleTitle1: string;
            sampleTrainer1: string;
            sampleTitle2: string;
            sampleTrainer2: string;
            sampleTitle3: string;
            sampleTrainer3: string;
            bestSeller: string;
            comingSoon: string;
          }
        };
      };
      feature: {
        title: string;
        course: {
          title: string;
          description: string;
        };
        auth: {
          title: string;
          description: string;
        };
      };
      layout: {
        title: string;
        navigation: {
          title: string;
          description: string;
        };
      };
      colors: {
        title: string;
      };
    };
  };
  auth: {
    emailNotVerified: string;
    verificationEmailSent: string;
    verificationEmailResent: string;
    verifyingEmail: string;
    emailVerified: string;
    redirectingToLogin: string;
    verificationFailed: string;
    resendVerification: string;
    emailAlreadyVerified: string;
    googleLoginFailed: string;
    googleSignupFailed: string;
    linkedinLoginSuccess: string;
    linkedinLoginFailed: string;
    loginWithLinkedin: string;
    loginWithGoogle: string;
    linkedinSignupSuccess: string;
    linkedinSignupFailed: string;
    signupWithLinkedin: string;
    signupWithGoogle: string;
    linkedinConfigError: string;
    popupBlocked: string;
    errors: {
      passwordLength: string;
      passwordMustContainAtLeastOneNumber: string;
      passwordMustContainBothLowercaseAndUppercaseLetters: string;
      passwordMustContainAtLeastOneSpecialCharacter: string;
      newPasswordRequired: string;
      pleaseConfirmYourNewPassword: string;
      passwordsDoNotMatch: string;
    };
    signin: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      forgotPassword: string;
      noAccount: string;
      createAccount: string;
      googleSignIn: string;
      linkedinSignIn: string;
    };
    signup: {
      title: string;
      fullNamePlaceholder: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      marketingConsent: string;
      termsText: string;
      termsLink: string;
      and: string;
      privacyLink: string;
      haveAccount: string;
      loginLink: string;
      signupButton: string;
      successMessage: string;
      errorMessage: string;
      continueWithEmail: string;
      alreadyHaveAccount: string;
      signIn: string;
      continueWithGoogle: string;
      continueWithLinkedIn: string;
      termsOfService: string;
      privacyPolicy: string;
      loading: string;
      or: string;
      passwordStrength: string;
      submit: string;
    };
    login: {
      title: string;
      emailPlaceholder: string;
      continueWithEmail: string;
      googleSignIn: string;
      linkedinSignIn: string;
      organizationLogin: string;
      organizationText: string;
      noAccount: string;
      signupLink: string;
      forgotPassword: string;
      organizationLoginTitle: string;
      organizationLoginDescription: string;
      organizationLoginDescription2: string;
      organizationLoginDescription3: string;
      organizationLoginButton: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      emailSent: string;
      error: string;
      resetPassword: string;
      checkEmail: string;
      checkSpam: string;
    };
    resetPassword: {
      title: string;
      description: string;
      newPassword: string;
      confirmPassword: string;
      passwordsDoNotMatch: string;
      passwordTooShort: string;
      success: string;
      error: string;
      submit: string;
    };
  };
  courses: {
    search: string;
    filter: {
      all: string;
      popular: string;
      new: string;
      trending: string;
    };
    level: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };
  home: {
    hero: {
      titleStart: string;
      titleHighlight: string;
      titleEnd: string;
      description: string;
      emailPlaceholder: string;
      subscribeButton: string;
      emailRequired: string;
      subscribeSuccess: string;
      subscribeError: string;
      connectToday: string;
    };
    courses: {
      title: string;
      description: string;
      errorLoading: string;
      noCourses: string;
      errorMessage: string;
      introToAI: {
        title: string;
        description: string;
        cards: {
          fundamentals: {
            title: string;
            trainer: string;
          };
          ethics: {
            title: string;
            trainer: string;
          };
          tools: {
            title: string;
            trainer: string;
          };
        };
        tags: {
          bestSeller: string;
          comingSoon: string;
        };
      };
      AIAugmtedSofDev: string;
      MarkCommunAugmtedAI: string;
      ProdAugmtedAI: string;
    };
    tracePlus: {
      promoCode: string;
      joinNow: string;
      title: string;
    };
  };
  course: {
    loadingCourse: string;
    courseNotFound: string;
    loginToSaveCourse: string;
    hero: {
      title: string;
      description: string;
      breadcrumb: {
        courses: string;
      }
    };
    placeholder: {
      title: string;
    };
    content: {
      title: string;
      stats: string;
      collapse_all_sections: string;
      expand_all_sections: string;
      lectures: string;
      preview: string;
      sections: string;
      learning: {
        title: string;
        langchain: string;
        prompting: string;
        llm: string;
        rag: string;
        have: string;
        understand: string;
        llc: string;
      };
    };
    relatedTopics: {
      title: string;
      topics: {
        langchain: string;
        dataScience: string;
        development: string;
      };
    };
    requirements: {
      title: string;
    };
    includes: {
      title: string;
      features: {
        clock: string; 
        article: string; 
        download: string; 
        access: string; 
        certificate: string; 
      };
    };
    purchase: {
      personal: string;
      enterprise: string;
      add_to_cart: string;
      guarantee: string;
      lifetime_access: string;
      access_to_all_courses: string;
      access_to_all_courses_description: string;
      access_to_all_courses_button: string;
      starting_at: string;
      cancel_anytime: string;
      learn_more: string;
      already_purchased: string;
      already_in_cart: string;
      check_cart: string;
    };
    description: {
      title: string;
    };
    instructor: {
      title: string;
      rating: string;
      reviews: string;
      users: string;
      courses: string;
      showLess: string;
      showMore: string;
    };
  };
  placeholder: {
    title: string;
    subtitle: string;
    featureDescription: string;
    comingSoon: string;
    stayTuned: string;
    titles: {
      business: string;
      teach: string;
      app: string;
      affiliate: string;
      about: string;
      contact: string;
      blog: string;
      help: string;
      terms: string;
      privacy: string;
      accessibility: string;
      cookieSettings: string;
      sitemap: string;
      investors: string;
    };
  };
  user: {
    navbar: {
      myLearning: string;
      accountSettings: string;
      logout: string;
      myBookings: string;
    };
    sidebar: {
      profile: string;
      password: string;
      messages: string;
      notifications: string;
      accountSettings: string;
    };
    profileSettings: {
      title: string;
      personalInformation: string;
      fullName: string;
      email: string;
      saveChanges: string;
    };
    passwordSettings: {
      title: string;
      changePassword: string;
      setPassword: string;
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
      updatePassword: string;
    };
    errors: {
      loginToUpdateProfileImage: string;
      failedToUpdateProfileImage: string;
      loginToUpdateProfile: string;
      nameRequired: string;
      failedToUpdateProfile: string;
      currentPasswordRequired: string;
      newPasswordRequired: string;
      pleaseConfirmYourNewPassword: string;
      passwordsDoNotMatch: string;
      passwordLength: string;
      passwordMustContainAtLeastOneNumber: string;
      passwordMustContainBothLowercaseAndUppercaseLetters: string;
      passwordMustContainAtLeastOneSpecialCharacter: string;
      failedToUpdatePassword: string;
      currentPasswordIncorrect: string;
    };
    success: {
      profileImageUpdatedSuccessfully: string;
      profileUpdatedSuccessfully: string;
      passwordUpdatedSuccessfully: string;
    };
    learning: {
      title: string;
      description: string;
      inProgress: string;
      saved: string;
      completed: string;
      course: string;
      by: string;
      downloadCertificate: string;
      share: string;
      noInProgress: string;
      noSaved: string;
      noCompleted: string;
      allCourses: string;
    };
    courseLearning: {
      search: string;
      markComplete: string;
      congratulations: string;
      courseCompleted: string;
      completionMessage: string;
      getCertificate: string;
      backToCourses: string;
      watchProgress: string;
      mobileNavHelp: string;
    };
    certificate: {
      title: string;
      description: string;
      noCourseId: string;
      shareWith: string;
      shareThoughts: string;
      shareButton: string;
      shareLink: string;
      shareCourse: string;
      tip: string;
      downloadPDF: string;
      postOnLinkedIn: string;
      course: string;
    };
    rateCourse: {
      title: string;
      description: string;
      commentPlaceholder: string;
      rate: string;
      rateCourse: string;
      cancel: string;
      submit: string;
      submitting: string;
      oneTimeNote: string;
    };
  };
  trainer: {
    navbar: {
      dashboard: string;
      logout: string;
    };
    sidebar: {
      title: string;
      courses: string;
      users: string;
      messages: string;
      notifications: string;
      settings: string;
    };
    profileSettings: {
      title: string;
      fullName: string;
      email: string;
      saveChanges: string;
      security: string;
      changePassword: string;
      setPassword: string;
      updatePassword: string;
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    };
    users: {
      title: string;
      totalUsers: string;
      activeUsers: string;
      averageProgress: string;
      courseCompletions: string;
      user: string;
      status: string;
      progress: string;
      lastActive: string;
      actions: string;
      sendMessage: string;
      messagePlaceholder: string;
      cancel: string;
      sending: string;
      send: string;
    };
    errors: {
      failedToLoadUsers: string;
      failedToSendMessage: string;
      mustBeLoggedInToUpdateProfileImage: string;
      failedToUpdateProfileImage: string;
      mustBeLoggedInToUpdateProfile: string;
      nameIsRequired: string;
      failedToUpdateProfile: string;
      mustBeLoggedInToUpdatePassword: string;
      failedToUpdatePassword: string;
      currentPasswordIncorrect: string;
      passwordsDoNotMatch: string;
      passwordLength: string;
      passwordMustContainAtLeastOneNumber: string;
      passwordMustContainBothLowercaseAndUppercaseLetters: string;
      passwordMustContainAtLeastOneSpecialCharacter: string;
      newPasswordRequired: string;
      confirmPasswordRequired: string;
      currentPasswordRequired: string;
    };
    success: {
      profileImageUpdatedSuccessfully: string;
      profileUpdatedSuccessfully: string;
      passwordUpdatedSuccessfully: string;
    };
    
    courses: {
      title: string;
      createCourse: string;
      totalCourses: string;
      totalUsers: string;
      averageRating: string;
      totalHours: string;
      searchCourses: string;
      allCourses: string;
      published: string;
      draft: string;
      inReview: string;
      editCourse: string;
      preview: string;
      changeToDraft: string;
      deleteCourse: string;
      deleteCourseMessage: string;
      reviewCourseMessage: string;
      draftCourseMessage: string;
      reviewCourse: string;
      draftCourse: string;
      delete: string;
      deleteCourseConfirmation: string;
      draftCourseConfirmation: string;
      reviewCourseConfirmation: string;
      changeCourseStatus: string;
      inviteUser: string;
      inviteUserDescription: string;
      userEmail: string;
      sendInvite: string;
    };
    createCourse: {
      courseInformation: string;
      courseTitle: string;
      courseSubtitle: string;
      courseDescription: string;
      coursePrice: string;
      oldPrice: string;
      currentPrice: string;
      courseMedia: string;
      vimeoCoursePromoVideoLink: string;
      coursePromoVideo: string;
      categories: string;
      addCustomCategory: string;
      whatYoullLearn: string;
      addLearningPoint: string;
      addRequirement: string;
      add: string;
      requirements: string;
      pleaseCompleteTheFollowingRequirements: string;
      updateCourse: string;
      addCourse: string;
      clickToUploadCourseImage: string;
      maximumSize: string;
      createCourse: string;
      editCourse: string;
      enterCourseDescription: string;
      sectionTitle: string;
      addSection: string;
      note: string;
      totalCourseDuration: string;
      courseContent: string;
      addAtLeastOneSectionWithOneLesson: string;
      fillInAllCourseInformation: string;
      setCoursePricing: string;
      selectAtLeastOneCategory: string;
      addAtLeastOneLearningPoint: string;
      addAtLeastOneRequirement: string;
      uploadACourseThumbnail: string;
      sectionDuration: string;
      previewZone: string;
      questions: string;
      makeThisPreview: string;
      contentItems: string;
      videoContent: string;
      textContent: string;
      addLesson: string;
      addQuiz: string;
      editorZone: string;
      lessonTitle: string;
      addNewLesson: string;
      editLesson: string;
      saveChanges: string;
      totalDuration: string;
      minutes: string;
      writeYourContentHere: string;
      vimeoVideoLink: string;
      hours: string;
      duration: string;
      lessonVideo: string;
      addText: string;
      addVimeoVideo: string;
      imageSizeMustBeLessThan: string;
      quizTitle: string;
      addNewQuiz: string;
      editQuiz: string;
      updateQuiz: string;
      saveQuiz: string;
      addQuestion: string;
      question: string;
      context: string;
      options: string;
      selectCorrectAnswer: string;
      optionText: string;
      addOption: string;
      cancel: string;
      saveQuestion: string;
    };
    coursePreview: {
      coursePreview: string;
      aboutThisCourse: string;
      whatYoullLearn: string;
      requirements: string;
      courseContent: string;
    };
  };
  mentor: {
    navbar: {
      dashboard: string;
      logout: string;
    };
    sidebar: {
      title: string;
      mentees: string;
      messages: string;
      schedule: string;
      availability: string;
      bookings: string;
      profile: string;
      settings: string;
    };
  };
  admin: {
    navbar: {
      adminDashboard: string;
      userManagement: string;
      courseManagement: string;
      platformSettings: string;
      logout: string;
    };
    sidebar: {
      overview: string;
      users: string;
      courses: string;
      myCourses: string;
      categories: string;
      reports: string;
      settings: string;
      adminDashboard: string;
      certificateSettings: string;
      notifications: string;
      organizations: string;
    };
    courseManagement: {
      title: string;
      searchPlaceholder: string;
      filter: string;
      allCourses: string;
      published: string;
      archived: string;
      users: string;
      rating: string;
      previewCourse: string;
      approveAndPublishCourse: string;
      areYouSureYouWantToApproveAndPublishThisCourse: string;
      rejectCourse: string;
      moveCourseToDraft: string;
      areYouSureYouWantToMoveThisCourseToDraft: string;
      moveCourseToReview: string;
      areYouSureYouWantToRejectThisCourseAndMoveItToDraft: string;
    };
    courses:{
      publishCourse: string;
    };
    organizations: {
      title: string;
      createOrganization: string;
      organizationName: string;
      addUsers: string;
      addUser: string;
      close: string;
      fullName: string;
      email: string;
      name: string;
      users: string;
      courses: string;
      createdAt: string;
      actions: string;
      user: string;
      course: string;
      update: string;
      create: string;
      editOrganization: string;
      addOrganization: string;
      addedUsers: string;
      noUsersAddedYet: string;
      organizationUsers: string;
      noUsersInThisOrganization: string;
      createAccount: string;
      createAccounts: string;
      createUserAccounts: string;
      createUserAccountsMessage: string;
      sendEmailNotificationsToUsers: string;
      usersWillReceiveAnEmailWithTheirLoginCredentials: string;
      usersWillNeedToBeNotifiedManuallyOfTheirAccounts: string;
      createUserAccount: string;
      createUserAccountMessage: string;
      sendEmailNotificationToUser: string;
      userWillReceiveAnEmailWithTheirLoginCredentials: string;
      userWillNeedToBeNotifiedManuallyOfTheirAccount: string;
      deleteOrganization: string;
      deleteOrganizationConfirmation: string;
      deleteOrganizationWarning: string;
      organizationCourses: string;
      currentCoursesAssignedToThisOrganization: string;
      manageCourses: string;
      noCoursesAssignedToThisOrganizationYet: string;
      selectCoursesAvailableToOrganizationUsers: string;
      noPublishedCoursesAvailable: string;
      saveCourses: string;
      cancel: string;
      importUsers: string;
      phone: string;
      importUsersDescription: string;
      selectFile: string;
    };
    categoryManagement: {
      title: string;
      searchPlaceholder: string;
      filter: string;
      allCourses: string;
      courses: string;
      addCategory: string;
      addNewCategory: string;
      categoryName: string;
      editCategory: string;
      selectPublishedCourseToAdd: string;
      noAvailableCoursesFound: string;
      selectCourse: string;
      currentCategories: string;
      areYouSureYouWantToDelete: string;
      addCourseTo: string;
      removeCourseFromCategory: string;
      removeCourseConfirmation: string;
    },
    errors: {
      organizationNameRequired: string;
      emailRequired: string;
      fullNameRequired: string;
      userAlreadyExists: string;
      userDoesNotExist: string;
      organizationAlreadyExists: string;
      organizationDoesNotExist: string;
      courseAlreadyExists: string;
      courseDoesNotExist: string;
      courseAlreadyAssignedToOrganization: string;
      courseNotAssignedToOrganization: string;
      courseAlreadyAssignedToAnotherOrganization: string;
      courseNotAssignedToAnotherOrganization: string;
      organizationAlreadyAssignedToAnotherUser: string;
      organizationNotAssignedToAnotherUser: string;
      userAlreadyAssignedToAnotherOrganization: string;
      userNotAssignedToAnotherOrganization: string;
      invalidEmail: string;
      emailAlreadyAdded: string;
      atLeastOneUserEmailRequired: string;
      failedToSaveOrganization: string;
      failedToDeleteOrganization: string;
      failedToCheckExistingAccounts: string;
      failedToCreateUserAccounts: string;
      failedToCreateAccountForEmail: string;
      failedToFetchCourses: string;
      failedToUpdateCourses: string;
      failedToLoadCourseDetails: string;
      failedToLoadCoursePreview: string;
      failedToLoadCourses: string;
      failedToFetchCategories: string;
      failedToAddCategory: string;
      failedToUpdateCategory: string;
      failedToDeleteCategory: string;
      failedToAddCourseToCategory: string;
      failedToRemoveCourseFromCategory: string;
      failedToImportUsers: string;
    },
    success: {
      organizationCreated: string;
      organizationUpdated: string;
      organizationDeleted: string;
      coursesSaved: string;
      organizationUpdatedSuccessfully: string;
      organizationCreatedSuccessfully: string;
      organizationDeletedSuccessfully: string;
      userAccountsCreatedSuccessfully: string;
      accountCreatedSuccessfullyForEmail: string;
      coursesUpdatedSuccessfully: string;
      coursePublishedSuccessfully: string;
      courseMovedToDraft: string;
      courseMovedToReview: string;
      categoryAddedSuccessfully: string;
      categoryUpdatedSuccessfully: string;
      categoryDeletedSuccessfully: string;
      courseAddedToCategorySuccessfully: string;
      courseRemovedFromCategorySuccessfully: string;
      usersImportedSuccessfully: string;
    },
    
    overview: {
      dashboardOverview: string;
      userStatistics: string;
      totalUsers: string;
      admins: string; 
      trainers: string;
      users: string;
      courseStatistics: string;
      totalCourses: string;
      activeCourses: string;
      categories: string;
      averageRating: string;
      noDataAvailable: string;
      newsletterSubscriptions: string;
    };
    settings: {
      certificate: {
        title: string;
        template: string;
        templateDescription: string;
        uploadTemplate: string;
        uploading: string;
      };
    };
    userManagement: {
      title: string;
      searchUsers: string;
      allRoles: string;
      admin: string;
      trainer: string;
      allStatus: string;
      active: string;
      inactive: string;
      suspended: string;
      pending: string;
      user: string;
      role: string;
      status: string;
      lastActive: string;
      actions: string;
      editUser: string;
      deleteUser: string;
      uploading: string;
      createUser: string;
      importUsers: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      alreadyRegistered: string;
      cancel: string;
      creatingUsers: string;
      createValidUsers: string;
      deleteUserConfirmation: string;
      deleteUserDatabaseConfirmation: string;
      deleteUserListConfirmation: string;
      deleteAllUsers: string;
      deleteAllUsersConfirmation: string;
      deleting: string;
      deleteAll: string;
      someEmailsAreAlreadyRegisteredAndWillBeSkipped: string;
      delete: string;
      sendWelcomeEmails: string;
      confirmUserCreation: string;
      saveChanges: string;
      fullNameRequired: string;
      emailRequired: string;
      invalidEmail: string;
      fullName: string;
      sendWelcomeEmail: string;
      uploadImage: string;
      newPassword: string;
      leaveBlankToKeepCurrent: string;
    };
    newsletter: {
      title: string;
      email: string;
      subscribedAt: string;
      deleteSubscription: string;
      deleteConfirmation: string;
      deleteSuccess: string;
      deleteError: string;
      actions: string;
      emailAddress: string;
      subscriptionDate: string;
    };
  };
  messages: {
    conversations: string;
    typeMessage: string;
    send: string;
    selectConversation: string;
    searchUsers: string;
    messagePlaceholder: string;
    noConversations: string;
  };
  notifications: {
    title: string;
    all: string;
    unread: string;
    read: string;
    markAllAsRead: string;
    markAsRead: string;
    delete: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    noNotifications: string;
  };
  mentorship: {
    pageTitle: string;
    becomeMentorTitle: string;
    becomeMentorSubtitle: string;
    missionTitle: string;
    missionText1: string;
    missionText2: string;
    whyMentorTitle: string;
    benefitImpactTitle: string;
    benefitImpactText: string;
    benefitCrossCulturalTitle: string;
    benefitCrossCulturalText: string;
    benefitShareTitle: string;
    benefitShareText: string;
    benefitFlexibleTitle: string;
    benefitFlexibleText: string;
    benefitRecognitionTitle: string;
    benefitRecognitionText: string;
    applicationSubmittedTitle: string;
    applicationSubmittedThankYou: string;
    applicationSubmittedSubtitle: string;
    applicationNextStepsTitle: string;
    applicationNextStep1: string;
    applicationNextStep2: string;
    applicationNextStep3: string;
    bookSessionTitle: string;
    loadingMentorProfile: string;
    mentorNotFound: string;
    failedToLoadMentor: string;
    failedToLoadSlots: string;
    failedToCreateBooking: string;
    bookingError: string;
    returnToMentors: string;
    pleaseLoginToBook: string;
    confirmationTitle: string;
    confirmationSubtitle: string;
    confirmationDetails: string;
    confirmationMentor: string;
    confirmationDate: string;
    confirmationTime: string;
    confirmationTopic: string;
    confirmationJoinZoom: string;
    confirmationAddCalendar: string;
    confirmationReturn: string;
    dashboardTitle: string;
    sidebarDashboard: string;
    sidebarMentees: string;
    sidebarMessages: string;
    sidebarNotifications: string;
    sidebarAvailability: string;
    sidebarSettings: string;
  };
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Translations;
    };
  }
} 