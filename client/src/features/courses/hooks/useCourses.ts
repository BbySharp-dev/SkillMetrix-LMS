import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseApi } from "../api/courseApi";
import { queryKeys } from "@/shared/queryKeys";
import { ApiError } from "@/shared/apiError";
import type {
  CourseQueryParams,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "../types";

export const useCourses = (params: CourseQueryParams) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => courseApi.getCourses(params),
    placeholderData: keepPreviousData,
  });
};

export const useCourseDetail = (courseId?: string) => {
  return useQuery({
    enabled: Boolean(courseId),
    queryKey: queryKeys.courses.detail(courseId ?? ""),
    queryFn: () => courseApi.getCourseById(courseId!),
  });
};

export const useCourseCurriculum = (courseId?: string) => {
  return useQuery({
    enabled: Boolean(courseId),
    queryKey: queryKeys.courses.curriculum(courseId ?? ""),
    queryFn: () => courseApi.getCourseCurriculum(courseId!),
  });
};

export const useCourseMutations = () => {
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateCoursePayload) => courseApi.createCourse(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Khóa học đã được tạo");
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.message ?? "Tạo khóa học thất bại.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCoursePayload }) =>
      courseApi.updateCourse(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
      qc.invalidateQueries({ queryKey: queryKeys.courses.detail(data.id) });
      toast.success("Đã cập nhật thay đổi");
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.message ?? "Cập nhật thất bại.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Đã xóa khóa học");
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.message ?? "Xóa khóa học thất bại.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => courseApi.submitCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Đã gửi yêu cầu xét duyệt");
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.message ?? "Gửi yêu cầu thất bại.");
    },
  });

  return {
    createCourse: createMutation,
    updateCourse: updateMutation,
    deleteCourse: deleteMutation,
    submitCourse: submitMutation,
  };
};