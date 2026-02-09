import { Step } from "react-joyride";

// Post Story Tutorial Steps
export const postStoryTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Post Story! ✏️",
    content: "This is where you share your amazing kindness stories! Let's learn how to post your story step by step!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-title"]',
    title: "Give Your Story a Title! 📝",
    content: "Write a fun title for your kindness story! Make it exciting so others want to read it!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-description"]',
    title: "Tell Your Story! 📖",
    content: "Write about the kind thing you did! Share all the details - what happened, how it made you feel, and how it helped others!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-image"]',
    title: "Add a Picture! 📸",
    content: "You can add a photo of your kindness act! Pictures make stories more fun and inspiring!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="submit-button"]',
    title: "Share Your Story! 🚀",
    content: "When you're done, click this button to share your story with everyone! Your kindness will inspire others!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "You're Ready! 🎉",
    content: "Awesome! Now you know how to share your kindness stories! Go ahead and post your first story!",
    placement: "center",
    disableBeacon: true,
  },
];

// My Stories Tutorial Steps
export const myStoriesTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to My Stories! 📚",
    content: "This is your special collection of all the kindness stories you've shared! Let's explore it together!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="stories-list"]',
    title: "Your Stories Collection! 📖",
    content: "Here are all your amazing kindness stories! You can see all the nice things you've done!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-card"]',
    title: "Story Cards! 🎴",
    content: "Each card shows one of your stories! Click on it to read the full story and see how many people liked it!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Sharing! 🌟",
    content: "Great job! Keep sharing your kindness stories to inspire others and spread more ripples of kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Ripple Tracker Tutorial Steps
export const rippleTrackerTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Ripple Tracker! 🗺️",
    content: "This is where you can see how far your kindness has traveled! Watch your ripples spread around the world!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-map"]',
    title: "Your Kindness Map! 🌍",
    content: "This map shows where your kindness has reached! See all the places your ripples have traveled!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-stats"]',
    title: "Your Ripple Stats! 📊",
    content: "See how many ripples you've created, how far they've traveled, and how many cities they've reached!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Spreading Kindness! ✨",
    content: "Amazing! The more kind acts you do, the more your ripples will spread! Keep being kind!",
    placement: "center",
    disableBeacon: true,
  },
];

// Ripple Journey (Tree) Tutorial Steps
export const rippleJourneyTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Ripple Journey! 🌈",
    content: "This is your amazing kindness tree! See how your kindness spreads from person to person like ripples in water!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="search-users"]',
    title: "Search for Friends! 🔍",
    content: "Type a name here to find your friends in the ripple journey! See where they are in your kindness network!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="journey-stats"]',
    title: "Your Journey Stats! 📊",
    content: "See how many people are in your ripple journey, how far kindness has traveled, and the total distance covered!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-tree"]',
    title: "Your Kindness Tree! 🌳",
    content: "This tree shows how your kindness spreads! You're at the center, and each branch shows someone who joined your ripple journey!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="zoom-controls"]',
    title: "Zoom Controls! 🔍",
    content: "Use these buttons to zoom in, zoom out, reset the view, or make the tree fullscreen! Explore your kindness network!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Growing Your Tree! 🌟",
    content: "Awesome! Share your Ripple Card with more friends and family to grow your kindness tree even bigger! When they register using your Ripple ID, you both earn points!",
    placement: "center",
    disableBeacon: true,
  },
];

// Leaderboard Tutorial Steps
export const leaderboardTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Leaderboard! 🏆",
    content: "This is where you can see who's spreading the most kindness! Check your ranking and see how awesome you are!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="leaderboard-list"]',
    title: "Kindness Rankings! ⭐",
    content: "See who's at the top! The more kindness acts you do, the higher your ranking will be!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="your-ranking"]',
    title: "Your Ranking! 🎯",
    content: "This shows where you are on the leaderboard! Do more ripple activities to move up and become a top kindness star!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Being Kind! 🌟",
    content: "Remember, every kind act counts! The more ripple activities you do, the higher your ranking will go! Keep spreading kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Challenges Tutorial Steps
export const challengesTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Challenges! 🎮",
    content: "This is where you can play fun games and earn cool badges! Complete missions to get awesome rewards!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="challenges-list"]',
    title: "Fun Challenges! 🎯",
    content: "Here are all the exciting challenges you can join! Each challenge has a special mission for you to complete!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="challenge-card"]',
    title: "Challenge Cards! 🎴",
    content: "Click on a challenge to see what you need to do! Complete it to earn points and cool badges!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="join-button"]',
    title: "Join Challenges! 🚀",
    content: "Click here to join a challenge! Once you join, start doing the activities to complete it and win rewards!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Have Fun! 🎉",
    content: "Awesome! Now go complete some challenges and earn amazing rewards! Have fun being kind!",
    placement: "center",
    disableBeacon: true,
  },
];

// Ripple Card Tutorial Steps
export const rippleCardTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Your Ripple Card! 💳",
    content: "This is your special Ripple Card! It's like your kindness ID card that travels with you everywhere!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-card-display"]',
    title: "Your Special Card! 🎫",
    content: "This is your unique Ripple Card! It has your special code that others can use to join Pass The Ripple!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="share-button"]',
    title: "Share Your Card! 📤",
    content: "Share your Ripple Card with friends and family! When they register using your card, you'll both earn points! It's a win-win!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="qr-code"]',
    title: "QR Code Magic! 📱",
    content: "This QR code is special! Others can scan it to join Pass The Ripple using your referral code! Share it with everyone!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Share and Earn! 🌟",
    content: "Remember, when you share your card and someone registers with it, you both get points! The more you share, the more points you earn! Keep spreading the kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Notifications Tutorial Steps
export const notificationsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Notifications! 🔔",
    content: "This is where you get messages about new badges, challenges, and fun updates! Check here for exciting news!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="notifications-header"]',
    title: "Your Notifications Page! 📬",
    content: "This is your notifications page! Here you can see all your messages and updates about your kindness journey!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="notification-tabs"]',
    title: "Filter Your Notifications! 🏷️",
    content: "Use these tabs to see all notifications, only unread ones, or only the ones you've already read!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="filter-dropdown"]',
    title: "Filter by Type! 🔍",
    content: "Click here to filter notifications by type! See only story notifications, badge notifications, or any other type!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="notifications-list"]',
    title: "Your Notifications! 📬",
    content: "Here are all your notifications! You'll see when you earn badges, complete challenges, or get new messages!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="notification-item"]',
    title: "Notification Cards! 🎴",
    content: "Each card is a notification! You can click on the tick icon (✓) to mark it as read, or click on the trash icon (🗑️) to delete it!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="mark-read-button"]',
    title: "Mark as Read! ✓",
    content: "Click this tick icon to mark a notification as read! Once you mark it, it will move to your 'Read' tab!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="delete-button"]',
    title: "Delete Notification! 🗑️",
    content: "Click this trash icon to delete a notification you don't need anymore! Don't worry, you can always see your achievements in other places!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Stay Updated! ✨",
    content: "Great! Now you'll never miss exciting news about your achievements and new challenges!",
    placement: "center",
    disableBeacon: true,
  },
];

// Analytics Tutorial Steps
export const analyticsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Analytics! 📊",
    content: "This is where you can see how much you've grown! Watch your progress and see all your achievements!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="analytics-stats"]',
    title: "Your Growth Stats! 📈",
    content: "See all your numbers here! Your badges, points, ripples, and how much you've improved over time!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="analytics-charts"]',
    title: "Cool Charts! 📊",
    content: "These charts show your progress! See how your kindness has grown over days, weeks, and months!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Growing! 🌟",
    content: "Awesome! Keep tracking your progress and watch yourself become a kindness superstar!",
    placement: "center",
    disableBeacon: true,
  },
];

// Feedback Tutorial Steps
export const feedbackTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Feedback! 💬",
    content: "This is where you can tell us what you think! Share your ideas to help us make Pass The Ripple even better!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="feedback-form"]',
    title: "Share Your Ideas! ✏️",
    content: "Write your thoughts here! Tell us what you like, what could be better, or any cool ideas you have!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="submit-feedback"]',
    title: "Send Your Feedback! 📤",
    content: "When you're done, click here to send your feedback! Your ideas help make Pass The Ripple awesome for everyone!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Thank You! 🙏",
    content: "Thank you for sharing your ideas! Your feedback helps us make Pass The Ripple better for all kids!",
    placement: "center",
    disableBeacon: true,
  },
];

// Settings Tutorial Steps
export const settingsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Settings! ⚙️",
    content: "This is where you can change your profile picture, name, and other fun stuff! Make your profile special!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="avatar-section"]',
    title: "Change Your Avatar! 🎨",
    content: "Pick a cool avatar or upload your own picture! Make it fun and show your personality!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="nickname-section"]',
    title: "Your Nickname! ✏️",
    content: "Change your nickname here! Pick something fun that represents you!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="save-button"]',
    title: "Save Your Changes! 💾",
    content: "When you're done making changes, click here to save them! Your profile will be updated!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "All Set! 🎉",
    content: "Perfect! Now you know how to customize your profile and make it special!",
    placement: "center",
    disableBeacon: true,
  },
];

// ========== TEACHER PANEL TUTORIAL STEPS ==========

// Teacher Dashboard Tutorial Steps
export const teacherDashboardTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Teacher Dashboard! 📊",
    content: "This is your command center! Here you can see all your classroom activity, student progress, and teaching insights at a glance!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="dashboard-stats"]',
    title: "Your Classroom Stats! 📈",
    content: "See key metrics like total students, active students, stories posted, and total points earned by your class!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="recent-activities"]',
    title: "Recent Activities! 🎯",
    content: "Keep track of the latest kindness acts and stories posted by your students! Stay updated on classroom engagement!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="pending-reviews"]',
    title: "Pending Reviews! ⏳",
    content: "Review and approve student stories that need your attention! Help showcase your students' amazing work!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "You're All Set! 🌟",
    content: "Great! Now you can monitor your classroom's kindness journey and help your students spread ripples of kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Add Student Tutorial Steps
export const addStudentTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Add Student! 👨‍🎓",
    content: "This is where you can add new students to your classroom! Let's learn how to register students step by step!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="student-form"]',
    title: "Student Information Form! 📝",
    content: "Fill in the student's details here - nickname, email, date of birth, and parent/guardian information!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="avatar-selection"]',
    title: "Choose an Avatar! 🎨",
    content: "Select a fun avatar for your student! They can choose from default avatars or upload a custom one!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="classroom-select"]',
    title: "Assign to Classroom! 🏫",
    content: "Select which classroom this student belongs to! This helps organize your students into groups!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="bulk-import"]',
    title: "Bulk Import Option! 📊",
    content: "Need to add many students? Use the Bulk Import tab to upload a CSV file and add multiple students at once!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Ready to Add Students! 🎉",
    content: "Perfect! Now you can easily add students individually or in bulk. Each new student gets 50 bonus points!",
    placement: "center",
    disableBeacon: true,
  },
];

// Manage Students Tutorial Steps
export const manageStudentsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Manage Students! 👥",
    content: "This is your student management hub! View, search, filter, and manage all your students in one place!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="search-bar"]',
    title: "Search Students! 🔍",
    content: "Type a student's name or email here to quickly find them! Search makes it easy to locate any student!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="filters"]',
    title: "Filter Students! 🏷️",
    content: "Filter students by classroom, consent status, or activity level! Find exactly who you're looking for!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="students-table"]',
    title: "Students List! 📋",
    content: "See all your students in this table! View their details, consent status, activity, and more!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="student-actions"]',
    title: "Student Actions! ⚙️",
    content: "Click the menu icon to edit student details, view profile, send emails, or manage their account!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Manage with Ease! 🌟",
    content: "Excellent! Now you can efficiently manage all your students and help them on their kindness journey!",
    placement: "center",
    disableBeacon: true,
  },
];

// Classroom Setup Tutorial Steps
export const classroomSetupTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Classroom Setup! 🏫",
    content: "Create and manage your classrooms here! Organize your students into different classes or groups!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="add-classroom"]',
    title: "Create New Classroom! ➕",
    content: "Click here to create a new classroom! Give it a name and start organizing your students!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="classrooms-list"]',
    title: "Your Classrooms! 📚",
    content: "See all your classrooms here! Each classroom shows how many students are enrolled!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="classroom-actions"]',
    title: "Manage Classrooms! ⚙️",
    content: "Edit classroom names or delete classrooms you no longer need! Keep your organization tidy!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Classrooms Ready! 🎉",
    content: "Perfect! Now you can organize your students into classrooms and manage them efficiently!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Post Story Tutorial Steps
export const teacherPostStoryTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Post Story! ✏️",
    content: "As a teacher, you can post stories about your own kindness acts or classroom activities! Let's learn how!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-title"]',
    title: "Story Title! 📝",
    content: "Give your story a meaningful title! Make it descriptive and inspiring for others to read!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-description"]',
    title: "Tell Your Story! 📖",
    content: "Share the details of your kindness act or classroom activity! Describe what happened and its impact!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-image"]',
    title: "Add Photos! 📸",
    content: "Upload photos to make your story more engaging! Visuals help others understand your kindness act better!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="submit-button"]',
    title: "Share Your Story! 🚀",
    content: "When ready, click here to publish your story! It will appear on the Hero Wall and inspire others!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Share Your Impact! 🌟",
    content: "Great! Now you can share your teaching moments and kindness acts to inspire your students and community!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher My Stories Tutorial Steps
export const teacherMyStoriesTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to My Stories! 📚",
    content: "View all the stories you've posted as a teacher! See your kindness journey and teaching moments!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="stories-list"]',
    title: "Your Stories! 📖",
    content: "Here are all the stories you've shared! Each story shows your impact and kindness acts!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-card"]',
    title: "Story Cards! 🎴",
    content: "Click on any story card to view details, edit, or see how many people have been inspired by it!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Keep Sharing! 🌟",
    content: "Excellent! Continue sharing your stories to inspire your students and spread more kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Manage Student Stories Tutorial Steps
export const manageStudentStoriesTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Manage Student Stories! 📝",
    content: "Review and manage all stories posted by your students! Approve, edit, or moderate student content here!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="stories-list"]',
    title: "Student Stories! 📚",
    content: "See all stories posted by your students! Review them to ensure they're appropriate and inspiring!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-actions"]',
    title: "Story Actions! ⚙️",
    content: "Approve stories to feature them, edit if needed, or manage student submissions! Help showcase great work!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="filters"]',
    title: "Filter Stories! 🔍",
    content: "Filter stories by status, student, classroom, or date! Find specific stories quickly!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Manage Stories Easily! 🌟",
    content: "Perfect! Now you can review and manage all student stories to ensure quality and celebrate their kindness!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Hero Wall Tutorial Steps
export const teacherHeroWallTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Hero Wall! 🏆",
    content: "See inspiring stories from your students and yourself! This is where amazing kindness acts are celebrated!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="hero-stories"]',
    title: "Featured Stories! ⭐",
    content: "Browse through inspiring stories from your classroom and beyond! See the impact of kindness!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="story-card"]',
    title: "Story Cards! 🎴",
    content: "Click on any story to read the full details, see photos, and celebrate the kindness act!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="filters"]',
    title: "Filter Stories! 🔍",
    content: "Filter by category, student, or date to find specific inspiring stories!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Celebrate Kindness! 🌟",
    content: "Wonderful! Use the Hero Wall to celebrate and inspire your students with amazing kindness stories!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Leaderboards Tutorial Steps
export const teacherLeaderboardsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Leaderboards! 🏆",
    content: "See rankings of your students and yourself! Track who's spreading the most kindness in your classroom!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="leaderboard-tabs"]',
    title: "Leaderboard Types! 📊",
    content: "Switch between different leaderboards - your personal ranking, classroom rankings, or global rankings!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="leaderboard-list"]',
    title: "Rankings! ⭐",
    content: "See who's at the top! Rankings are based on kindness acts, points earned, and engagement!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="your-ranking"]',
    title: "Your Position! 🎯",
    content: "See where you rank! Encourage your students to participate more to climb the leaderboard!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Motivate Your Students! 🌟",
    content: "Great! Use leaderboards to motivate your students and celebrate their kindness achievements!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Ripple Chain Tutorial Steps
export const teacherRippleChainTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Ripple Chain! 🌊",
    content: "Visualize how kindness spreads through your classroom and beyond! See the network of kindness connections!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-tree"]',
    title: "Kindness Network! 🌳",
    content: "This tree shows how kindness spreads! See connections between you, your students, and their networks!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="chain-stats"]',
    title: "Network Stats! 📊",
    content: "See how many people are connected, how far kindness has traveled, and the total impact!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="zoom-controls"]',
    title: "Explore the Network! 🔍",
    content: "Use zoom controls to explore the network! See individual connections and the bigger picture!",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "See the Impact! 🌟",
    content: "Amazing! Watch how your classroom's kindness creates ripples that spread far and wide!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Ripple Map Tutorial Steps
export const teacherRippleMapTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Ripple Map! 🗺️",
    content: "See where kindness has spread geographically! Watch your classroom's impact reach around the world!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-map"]',
    title: "Kindness Map! 🌍",
    content: "This map shows all the locations where kindness acts have occurred! See the global impact!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="map-stats"]',
    title: "Map Statistics! 📊",
    content: "See how many cities, countries, and locations have been touched by kindness from your classroom!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="map-filters"]',
    title: "Filter the Map! 🔍",
    content: "Filter by student, classroom, date, or category to see specific kindness locations!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "See Global Impact! 🌟",
    content: "Incredible! Watch how your classroom's kindness creates a global network of positive change!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Analytics Tutorial Steps
export const teacherAnalyticsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Analytics Dashboard! 📊",
    content: "Get deep insights into your classroom's kindness journey! See detailed analytics and progress metrics!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="analytics-stats"]',
    title: "Key Metrics! 📈",
    content: "See comprehensive statistics - total stories, points earned, student engagement, and growth trends!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="analytics-charts"]',
    title: "Visual Analytics! 📊",
    content: "Explore charts and graphs showing trends over time, student performance, and category breakdowns!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="student-performance"]',
    title: "Student Performance! 👥",
    content: "See individual student contributions, top performers, and engagement levels across your classroom!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Data-Driven Teaching! 🌟",
    content: "Excellent! Use these insights to understand your classroom's progress and motivate your students!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Ripple Card Tutorial Steps (reuse user version)
export const teacherRippleCardTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Your Ripple Card! 💳",
    content: "This is your teacher Ripple Card! Share it with students, parents, and colleagues to grow your network!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="ripple-card-display"]',
    title: "Your Special Card! 🎫",
    content: "This is your unique Ripple Card with your referral code! Others can use it to join and you both earn points!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="share-button"]',
    title: "Share Your Card! 📤",
    content: "Share your Ripple Card with students and parents! When they register using your card, you both earn points!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="qr-code"]',
    title: "QR Code! 📱",
    content: "Share this QR code! Others can scan it to join Pass The Ripple using your referral code!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Grow Your Network! 🌟",
    content: "Perfect! Share your card to expand your kindness network and help more people join the movement!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Feedback Tutorial Steps (reuse user version with teacher context)
export const teacherFeedbackTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Feedback! 💬",
    content: "Share your thoughts and suggestions as a teacher! Help us improve Pass The Ripple for educators!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="feedback-form"]',
    title: "Share Your Ideas! ✏️",
    content: "Tell us what you think! Share what works well, what could be better, or new features you'd like!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="submit-feedback"]',
    title: "Send Feedback! 📤",
    content: "Click here to submit your feedback! Your input helps us make Pass The Ripple better for all teachers!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "Thank You! 🙏",
    content: "Thank you for your feedback! Your insights help us create a better experience for educators and students!",
    placement: "center",
    disableBeacon: true,
  },
];

// Teacher Settings Tutorial Steps (reuse user version with teacher context)
export const teacherSettingsTutorialSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to Settings! ⚙️",
    content: "Manage your teacher profile, preferences, and account settings here! Customize your experience!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="profile-section"]',
    title: "Your Profile! 👤",
    content: "Update your profile information, avatar, and personal details! Make your profile reflect who you are!",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial-target="save-button"]',
    title: "Save Changes! 💾",
    content: "Click here to save all your changes! Your profile and settings will be updated!",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    title: "All Configured! 🎉",
    content: "Perfect! Your teacher account is now customized to your preferences!",
    placement: "center",
    disableBeacon: true,
  },
];

