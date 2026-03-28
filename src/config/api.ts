/**
 * API Configuration
 * 
 * This file manages the base API URL based on the environment.
 * In production, it uses the deployed backend at innspill.ai/microapi
 * In development, it uses localhost:3000
 * 
 * Note: The production backend is mounted at /microapi/api/v1/*
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Determine base URL based on environment and hostname
const getBaseURL = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/v1';
  }

  // Production
  return 'https://innspill.ai/microapi/api/v1';
};

// Base API URL - change this if your backend URL changes
export const API_BASE_URL = getBaseURL();

// Get WebSocket URL based on environment
const getWebSocketURL = () => {
  if (window.location.hostname === 'localhost') {
    return 'ws://localhost:3000';
  }
  // Production - convert HTTPS to WSS
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//innspill.ai/microapi`;
};

export const WS_BASE_URL = getWebSocketURL();

// Debug logging (will be stripped in production build)
if (typeof window !== 'undefined') {
  console.log('[API Config] Environment:', {
    hostname: window.location.hostname,
    isDevelopment,
    isProduction,
    API_BASE_URL,
    mode: import.meta.env.MODE
  });
  console.log('[API Config] All requests will be sent to:', API_BASE_URL);
}

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    createUser: `${API_BASE_URL}/auth/create-user`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    registrationDate: `${API_BASE_URL}/auth/registration-date`,
  },
  
  // Chatbot
  chatbot: {
    createCoursePlan: `${API_BASE_URL}/chatbot/create-course-plan`,
    updateCoursePlan: `${API_BASE_URL}/chatbot/update-course-plan`,
    createLecturePlan: `${API_BASE_URL}/chatbot/create-lecture-plan`,
    analyzeFeedback: `${API_BASE_URL}/chatbot/analyze-feedback`,
    analyzeCoursePlan: `${API_BASE_URL}/chatbot/analyze-a-course-plan`,
    reviseCoursePlan: `${API_BASE_URL}/chatbot/revise-a-course-plan`,
    asks: `${API_BASE_URL}/chatbot/asks`,
  },
  
  // Course Plan Documents
  coursePlanDocs: {
    create: `${API_BASE_URL}/course-plan-docs`,
    list: `${API_BASE_URL}/course-plan-docs`,
    getById: (id: string) => `${API_BASE_URL}/course-plan-docs/${id}`,
    update: (id: string) => `${API_BASE_URL}/course-plan-docs/${id}`,
    delete: (id: string) => `${API_BASE_URL}/course-plan-docs/${id}`,
    stats: `${API_BASE_URL}/course-plan-docs/stats/summary`,
  },
  
  // Logs
  logs: {
    actions: `${API_BASE_URL}/logs/actions`,
    stats: `${API_BASE_URL}/logs/stats`,
    track: `${API_BASE_URL}/logs/track`, // POST endpoint for tracking actions (login, logout, etc.)
  },
  
  // Exercises
  exercises: {
    create: `${API_BASE_URL}/exercises`,
    list: `${API_BASE_URL}/exercises`,
    getById: (id: string) => `${API_BASE_URL}/exercises/${id}`,
    update: (id: string) => `${API_BASE_URL}/exercises/${id}`,
    delete: (id: string) => `${API_BASE_URL}/exercises/${id}`,
  },
  
  // Courses
  courses: {
    list: `${API_BASE_URL}/courses`,
    getById: (id: string) => `${API_BASE_URL}/courses/${id}`,
    getByStudent: (username: string) => `${API_BASE_URL}/courses/student/${username}`,
    assignTeacher: (id: string) => `${API_BASE_URL}/courses/${id}/assign-teacher`,
    removeTeacher: (id: string) => `${API_BASE_URL}/courses/${id}/remove-teacher`,
  },
  
  // Student Conversations
  studentConversations: {
    save: `${API_BASE_URL}/student-conversations`,
    getByExercise: (exerciseId: string) => `${API_BASE_URL}/student-conversations/exercise/${exerciseId}`,
    list: `${API_BASE_URL}/student-conversations`,
  },
  
  // Prompts
  prompts: {
    revise: `${API_BASE_URL}/prompts/revise`,
    create: `${API_BASE_URL}/prompts`,
    list: `${API_BASE_URL}/prompts`,
    getById: (id: string) => `${API_BASE_URL}/prompts/${id}`,
    update: (id: string) => `${API_BASE_URL}/prompts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/prompts/${id}`,
  },
  
  // Worksheets
  worksheets: {
    generate: `${API_BASE_URL}/worksheets/generate`,
    generateLearningObjectives: `${API_BASE_URL}/worksheets/generate-learning-objectives`,
    generateFormatDescription: `${API_BASE_URL}/worksheets/generate-format-description`,
    generateExamples: `${API_BASE_URL}/worksheets/generate-examples`,
    create: `${API_BASE_URL}/worksheets`,
    list: `${API_BASE_URL}/worksheets`,
    getById: (id: string) => `${API_BASE_URL}/worksheets/${id}`,
    update: (id: string) => `${API_BASE_URL}/worksheets/${id}`,
    delete: (id: string) => `${API_BASE_URL}/worksheets/${id}`,
  },
  
  // Assessment Projects
  projects: {
    create: `${API_BASE_URL}/projects`,
    list: `${API_BASE_URL}/projects`,
    getById: (id: string) => `${API_BASE_URL}/projects/${id}`,
    update: (id: string) => `${API_BASE_URL}/projects/${id}`,
    delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/projects/course/${courseId}`,
  },
  
  // Assessment Tasks
  assessmentTasks: {
    create: `${API_BASE_URL}/assessment-tasks`,
    list: `${API_BASE_URL}/assessment-tasks`,
    getById: (id: string) => `${API_BASE_URL}/assessment-tasks/${id}`,
    update: (id: string) => `${API_BASE_URL}/assessment-tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/assessment-tasks/${id}`,
    getByProject: (projectId: string) => `${API_BASE_URL}/assessment-tasks/project/${projectId}`,
  },
  
  // Assessment Roles
  assessmentRoles: {
    create: `${API_BASE_URL}/assessment-roles`,
    list: `${API_BASE_URL}/assessment-roles`,
    getById: (id: string) => `${API_BASE_URL}/assessment-roles/${id}`,
    update: (id: string) => `${API_BASE_URL}/assessment-roles/${id}`,
    delete: (id: string) => `${API_BASE_URL}/assessment-roles/${id}`,
    getByProject: (projectId: string) => `${API_BASE_URL}/assessment-roles/project/${projectId}`,
  },
  
  // Assessment Quizzes
  assessmentQuizzes: {
    create: `${API_BASE_URL}/assessment-quizzes`,
    list: `${API_BASE_URL}/assessment-quizzes`,
    getById: (id: string) => `${API_BASE_URL}/assessment-quizzes/${id}`,
    update: (id: string) => `${API_BASE_URL}/assessment-quizzes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/assessment-quizzes/${id}`,
    generate: `${API_BASE_URL}/assessment-quizzes/generate`,
    getByProject: (projectId: string) => `${API_BASE_URL}/assessment-quizzes/project/${projectId}`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/assessment-quizzes/course/${courseId}`,
  },

  // Quiz Submissions
  quizSubmissions: {
    create: `${API_BASE_URL}/quiz-submissions`,
    getByStudent: (username: string) => `${API_BASE_URL}/quiz-submissions/student/${username}`,
    getByQuizAndStudent: (quizId: string, username: string) => `${API_BASE_URL}/quiz-submissions/quiz/${quizId}/student/${username}`,
    getLeaderboard: (quizId: string) => `${API_BASE_URL}/quiz-submissions/quiz/${quizId}/leaderboard`,
    getScores: `${API_BASE_URL}/quiz-submissions/scores`,
    update: (submissionId: string) => `${API_BASE_URL}/quiz-submissions/${submissionId}`,
  },
  
  // Assessment Submissions
  assessmentSubmissions: {
    create: `${API_BASE_URL}/assessment-submissions`,
    list: `${API_BASE_URL}/assessment-submissions`,
    getById: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}`,
    update: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}`,
    getByTask: (taskId: string) => `${API_BASE_URL}/assessment-submissions/task/${taskId}`,
    getByTaskGrouped: (taskId: string) => `${API_BASE_URL}/assessment-submissions/task/${taskId}/grouped`,
    getByProjectGrouped: (projectId: string) => `${API_BASE_URL}/assessment-submissions/project/${projectId}/grouped`,
    getByStudent: (studentId: string) => `${API_BASE_URL}/assessment-submissions/student/${studentId}`,
    getByStakeholderGrouped: (stakeholderId: string) => `${API_BASE_URL}/assessment-submissions/stakeholder/${stakeholderId}/grouped`,
    generateFeedback: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/generate-feedback`,
    saveFeedback: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/save-feedback`,
    generateFeedbackBatch: `${API_BASE_URL}/assessment-submissions/generate-feedback-batch`,
    batch: `${API_BASE_URL}/assessment-submissions/batch`,
    getAttachments: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/attachments`,
    getAttachmentsBatch: `${API_BASE_URL}/assessment-submissions/attachments/batch`,
    getPrompt: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/prompt`,
    readAttachments: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/read-attachments`,
    share: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/share`,
    getGroupTaskStatus: (groupId: string) => `${API_BASE_URL}/assessment-submissions/group/${groupId}/task-status`,
  },

  // Notifications
  notifications: {
    create: `${API_BASE_URL}/notifications`,
    getByStudent: (username: string) => `${API_BASE_URL}/notifications/student/${username}`,
    getByTeacher: (username: string) => `${API_BASE_URL}/notifications/teacher/${username}`,
    markAsRead: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    toggleImportant: (id: string) => `${API_BASE_URL}/notifications/${id}/important`,
  },

  // Users (school management)
  users: {
    list: `${API_BASE_URL}/users`,
  },

  // Chat Messages
  chatMessages: {
    getByStudentAndStakeholder: (username: string, stakeholderId: string) => `${API_BASE_URL}/chat-messages/student/${username}/stakeholder/${stakeholderId}`,
    batch: `${API_BASE_URL}/chat-messages/batch`,
    send: `${API_BASE_URL}/chat-messages`,
    endSession: (sessionId: string) => `${API_BASE_URL}/chat-messages/session/${sessionId}/end`,
  },

  // Students
  students: {
    create: `${API_BASE_URL}/students`,
    list: `${API_BASE_URL}/students`,
    getById: (id: string) => `${API_BASE_URL}/students/${id}`,
    update: (id: string) => `${API_BASE_URL}/students/${id}`,
    delete: (id: string) => `${API_BASE_URL}/students/${id}`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/students/course/${courseId}`,
  },

  // Student Groups
  studentGroups: {
    create: `${API_BASE_URL}/student-groups`,
    list: `${API_BASE_URL}/student-groups`,
    getById: (id: string) => `${API_BASE_URL}/student-groups/${id}`,
    update: (id: string) => `${API_BASE_URL}/student-groups/${id}`,
    delete: (id: string) => `${API_BASE_URL}/student-groups/${id}`,
    getByCourse: (courseId: string) => `${API_BASE_URL}/student-groups/course/${courseId}`,
    getStudents: (groupId: string) => `${API_BASE_URL}/student-groups/${groupId}/students`,
    assignStudents: (groupId: string) => `${API_BASE_URL}/student-groups/${groupId}/students`,
    removeStudents: (groupId: string) => `${API_BASE_URL}/student-groups/${groupId}/students`,
    getUnassignedStudents: (courseId: string) => `${API_BASE_URL}/student-groups/course/${courseId}/unassigned-students`,
  },

  // LO Mappings
  loMappings: {
    save: `${API_BASE_URL}/lo-mappings`,
    autoMap: `${API_BASE_URL}/lo-mappings/auto-map`,
  },

  // Student Metrics
  studentMetrics: {
    windowed: `${API_BASE_URL}/student-metrics/windowed`,
    progressMasterview: `${API_BASE_URL}/student-metrics/progress-masterview`,
    progressMasterviewGrouped: `${API_BASE_URL}/student-metrics/progress-masterview/grouped`,
    progressDetailGrouped: `${API_BASE_URL}/student-metrics/progress-detail/grouped`,
    progressStudent: `${API_BASE_URL}/student-metrics/progress-student`,
  },

  // User Feedback
  userFeedback: {
    submit: `${API_BASE_URL}/user-feedback`,
    list: `${API_BASE_URL}/user-feedback`,
    stats: `${API_BASE_URL}/user-feedback/stats`,
  },

  // Monitoring
  monitoring: {
    platformUsage: `${API_BASE_URL}/monitoring/platform-usage`,
    moduleUsage: `${API_BASE_URL}/monitoring/module-usage`,
    llmUsage: `${API_BASE_URL}/monitoring/llm-usage`,
    dashboard: `${API_BASE_URL}/monitoring/dashboard`,
    // Activity monitoring endpoints (see ENDPOINT_REQUIREMENTS.md)
    activity: {
      aiLiteracy: `${API_BASE_URL}/monitoring/activity/ai-literacy`,
      promptRevision: `${API_BASE_URL}/monitoring/activity/prompt-revision`,
      managementTools: `${API_BASE_URL}/monitoring/activity/management-tools`,
      chatSessions: `${API_BASE_URL}/monitoring/activity/chat-sessions`,
      quizCompletions: `${API_BASE_URL}/monitoring/activity/quiz-completions`,
    },
  },

  // Files
  files: {
    upload: `${API_BASE_URL}/files/upload`,
    download: (filename: string) => `${API_BASE_URL}/files/${encodeURIComponent(filename)}`,
  },

  // AI Literacy
  aiLiteracy: {
    status: `${API_BASE_URL}/ai-literacy/status`,
    getStatus: (userId?: string) => userId 
      ? `${API_BASE_URL}/ai-literacy/status/${userId}`
      : `${API_BASE_URL}/ai-literacy/status`,
    stats: `${API_BASE_URL}/ai-literacy/stats`,
  },

  // Planning Poker
  planningPoker: {
    createTask: `${API_BASE_URL}/planning-poker/tasks`,
    getTasks: (groupId: string) => `${API_BASE_URL}/planning-poker/tasks/group/${groupId}`,
    deleteTask: (taskId: string) => `${API_BASE_URL}/planning-poker/tasks/${taskId}`,
    submitVote: `${API_BASE_URL}/planning-poker/votes`,
    revealVotes: (taskId: string) => `${API_BASE_URL}/planning-poker/tasks/${taskId}/reveal`,
    clearVotes: (taskId: string) => `${API_BASE_URL}/planning-poker/tasks/${taskId}/clear`,
    getOnlineMembers: (groupId: string) => `${API_BASE_URL}/planning-poker/groups/${groupId}/members/online`,
    markOnline: (groupId: string) => `${API_BASE_URL}/planning-poker/groups/${groupId}/members/online`,
    markOffline: (groupId: string) => `${API_BASE_URL}/planning-poker/groups/${groupId}/members/online`,
  },
  swot: {
    getSWOT: (groupId: string) => `${API_BASE_URL}/swot-analysis/group/${groupId}`,
    saveSWOT: (groupId: string) => `${API_BASE_URL}/swot-analysis/group/${groupId}`,
    getProjectDescription: (projectId: string) => `${API_BASE_URL}/swot-analysis/project/${projectId}/description`,
    getGuidelines: `${API_BASE_URL}/swot-analysis/guidelines`,
  },
};

/**
 * Get the appropriate API URL based on environment
 * @param endpoint - The API endpoint path
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper function to log API endpoint calls
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint - Full endpoint URL
 * @param data - Optional request data
 */
export function logApiCall(method: string, endpoint: string, data?: any): void {
  if (typeof window !== 'undefined') {
    console.log(`[API Call] ${method} ${endpoint}`, data ? { data } : '');
  }
}

/**
 * Wrapper for fetch that automatically logs API calls
 * @param endpoint - Full endpoint URL
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  logApiCall(method, endpoint, options.body ? JSON.parse(options.body as string) : undefined);
  
  return fetch(endpoint, options);
}

// Log all available endpoints after they're defined
if (typeof window !== 'undefined') {
  console.log('[API Config] Available endpoints:', {
    auth: {
      login: API_ENDPOINTS.auth.login,
      logout: API_ENDPOINTS.auth.logout,
      register: API_ENDPOINTS.auth.register,
    },
    chatbot: {
      createCoursePlan: API_ENDPOINTS.chatbot.createCoursePlan,
      updateCoursePlan: API_ENDPOINTS.chatbot.updateCoursePlan,
      analyzeCoursePlan: API_ENDPOINTS.chatbot.analyzeCoursePlan,
      reviseCoursePlan: API_ENDPOINTS.chatbot.reviseCoursePlan,
    },
    worksheets: {
      generate: API_ENDPOINTS.worksheets.generate,
      create: API_ENDPOINTS.worksheets.create,
      list: API_ENDPOINTS.worksheets.list,
    },
    // Add more endpoint groups as needed
  });
}

export default API_ENDPOINTS;

