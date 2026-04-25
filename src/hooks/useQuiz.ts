import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi, assignmentApi } from '../api/quiz.api'

// Quiz
export function useQuiz(id: number) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn:  async () => { const { data } = await quizApi.getQuiz(id); return data.data },
    enabled:  !!id,
  })
}

export function useMyAttempts(quizId: number) {
  return useQuery({
    queryKey: ['quiz', 'attempts', quizId],
    queryFn:  async () => { const { data } = await quizApi.myAttempts(quizId); return data.data },
    enabled:  !!quizId,
  })
}

export function useStartAttempt() {
  return useMutation({
    mutationFn: (quizId: number) => quizApi.startAttempt(quizId),
  })
}

export function useSubmitAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ attemptId, answers, timeTaken }: {
      attemptId: number;
      answers:   Record<number, string | string[]>;
      timeTaken: number;
    }) => quizApi.submitAttempt(attemptId, { answers, time_taken: timeTaken }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz', 'attempts'] }),
  })
}

// Assignment
export function useAssignment(id: number) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn:  async () => { const { data } = await assignmentApi.getAssignment(id); return data.data },
    enabled:  !!id,
  })
}

export function useMySubmission(assignmentId: number) {
  return useQuery({
    queryKey: ['assignment', 'submission', assignmentId],
    queryFn:  async () => { const { data } = await assignmentApi.mySubmission(assignmentId); return data.data },
    enabled:  !!assignmentId,
  })
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ['student', 'submissions'],
    queryFn:  async () => { const { data } = await assignmentApi.mySubmissions(); return data },
  })
}

export function useSubmitAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      assignmentApi.submit(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignment', 'submission'] }),
  })
}

export function useGradeSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: number; data: any }) =>
      assignmentApi.gradeSubmission(submissionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher', 'submissions'] }),
  })
}