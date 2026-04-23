import api from "@/api/axios";
import type {
  ApiResponse,
  CourseDetailDto,
  CourseListItem,
  CourseQueryParams,
  PagedResponse,
} from "@/types/course";

const toQueryString = (params: CourseQueryParams) => {
  const searchParams = new URLSearchParams();

  searchParams.set("pageNumber", String(params.pageNumber));
  searchParams.set("pageSize", String(params.pageSize));

  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.minPrice !== undefined)
    searchParams.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined)
    searchParams.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined)
    searchParams.set("minRating", String(params.minRating));

  return searchParams.toString();
};

export const courseApi = {
  getCourses: async (
    params: CourseQueryParams,
  ): Promise<PagedResponse<CourseListItem>> => {
    const query = toQueryString(params);
    const res = await api.get<ApiResponse<PagedResponse<CourseListItem>>>(
      `/courses?${query}`,
    );
    return res.data.data;
  },

  getCourseById: async (courseId: string): Promise<CourseDetailDto> => {
    const res = await api.get<ApiResponse<CourseDetailDto>>(
      `/courses/${courseId}`,
    );
    return res.data.data;
  },
};
