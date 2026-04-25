import api from '../lib/axios'
import type { ApiSuccess } from '../types/auth.types'
import type { Quiz, QuizAttempt, QuizQuestion, Assignment, Submission } from '../types/quiz.types'

export const quizApi = {
  // Teacher
  listForCourse:  (courseId: number) =>
    api.get<ApiSuccess<Quiz[]>>(`/teacher/courses/${courseId}/quizzes`),

  createQuiz: (courseId: number, data: Partial<Quiz>) =>
    api.post<ApiSuccess<Quiz>>(`/teacher/courses/${courseId}/quizzes`, data),

  updateQuiz: (id: number, data: Partial<Quiz>) =>
    api.put<ApiSuccess<Quiz>>(`/teacher/quizzes/${id}`, data),

  deleteQuiz: (id: number) =>
    api.delete(`/teacher/quizzes/${id}`),

  addQuestion: (quizId: number, data: Partial<QuizQuestion>) =>
    api.post<ApiSuccess<QuizQuestion>>(`/teacher/quizzes/${quizId}/questions`, data),

  updateQuestion: (quizId: number, qId: number, data: Partial<QuizQuestion>) =>
    api.put<ApiSuccess<QuizQuestion>>(`/teacher/quizzes/${quizId}/questions/${qId}`, data),

  deleteQuestion: (quizId: number, qId: number) =>
    api.delete(`/teacher/quizzes/${quizId}/questions/${qId}`),

  getAttempts: (quizId: number) =>
    api.get(`/teacher/quizzes/${quizId}/attempts`),

  gradeAnswer: (answerId: number, data: { marks: number; feedback?: string }) =>
    api.post(`/teacher/answers/${answerId}/grade`, data),

  // Student
  getQuiz: (id: number) =>
    api.get<ApiSuccess<Quiz>>(`/student/quizzes/${id}`),

  startAttempt: (quizId: number) =>
    api.post<ApiSuccess<QuizAttempt>>(`/student/quizzes/${quizId}/start`),

  submitAttempt: (attemptId: number, data: {
    answers: Record<number, string | string[]>;
    time_taken: number;
  }) =>
    api.post<ApiSuccess<QuizAttempt>>(`/student/attempts/${attemptId}/submit`, data),

  myAttempts: (quizId: number) =>
    api.get<ApiSuccess<QuizAttempt[]>>(`/student/quizzes/${quizId}/my-attempts`),
}

export const assignmentApi = {
  // Teacher
  listForCourse: (courseId: number) =>
    api.get<ApiSuccess<Assignment[]>>(`/teacher/courses/${courseId}/assignments`),

  createAssignment: (courseId: number, data: Partial<Assignment>) =>
    api.post<ApiSuccess<Assignment>>(`/teacher/courses/${courseId}/assignments`, data),

  updateAssignment: (id: number, data: Partial<Assignment>) =>
    api.put<ApiSuccess<Assignment>>(`/teacher/assignments/${id}`, data),

  deleteAssignment: (id: number) =>
    api.delete(`/teacher/assignments/${id}`),

  getSubmissions: (assignmentId: number) =>
    api.get(`/teacher/assignments/${assignmentId}/submissions`),

  gradeSubmission: (submissionId: number, data: {
    marks: number; feedback: string; status: string
  }) =>
    api.post(`/teacher/submissions/${submissionId}/grade`, data),

  // Student
  getAssignment: (id: number) =>
    api.get<ApiSuccess<Assignment>>(`/student/assignments/${id}`),

  submit: (id: number, formData: FormData) =>
    api.post<ApiSuccess<Submission>>(`/student/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  mySubmissions: () =>
    api.get(`/student/my-submissions`),

  mySubmission: (assignmentId: number) =>
    api.get<ApiSuccess<Submission | null>>(`/student/assignments/${assignmentId}/my-submission`),
}