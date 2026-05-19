import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card, Button, Textarea } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { useCourseReviews, useCourseReviewStats, useUserReview, useCreateReview, useUpdateReview, useDeleteReview } from '../hooks/useReviews';

interface CourseReviewsPageProps {
    courseId: string;
}

export function CourseReviewsPage({ courseId }: CourseReviewsPageProps) {
    const [page, setPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isWriting, setIsWriting] = useState(false);

    const { data: reviewsData } = useCourseReviews(courseId, page);
    const { data: stats } = useCourseReviewStats(courseId);
    const { data: userReview } = useUserReview(courseId);
    const createReview = useCreateReview();
    const updateReview = useUpdateReview();
    const deleteReview = useDeleteReview();

    const reviews = reviewsData?.data ?? [];
    const totalRecords = reviewsData?.totalRecords ?? 0;
    const totalPages = reviewsData?.totalPages ?? 1;

    const filteredReviews = ratingFilter
        ? reviews.filter((review) => review.rating === ratingFilter)
        : reviews;

    const handleSubmitReview = () => {
        if (newComment.trim()) {
            createReview.mutate(
                { courseId, rating: newRating, comment: newComment },
                { onSuccess: () => { setNewComment(''); setIsWriting(false); setPage(1); } }
            );
        }
    };

    const handleUpdateReview = () => {
        if (userReview && newComment.trim()) {
            updateReview.mutate(
                { reviewId: userReview.id, data: { rating: newRating, comment: newComment } },
                { onSuccess: () => setIsWriting(false) }
            );
        }
    };

    const handleDeleteReview = () => {
        if (userReview) {
            deleteReview.mutate(userReview.id);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Đánh giá ({stats?.totalReviews ?? 0})
                </h2>
                {!userReview && !isWriting && (
                    <Button onClick={() => setIsWriting(true)} variant="outline" size="sm">
                        <Star className="size-4 mr-2" />
                        Viết đánh giá
                    </Button>
                )}
            </div>

            {stats && (
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center justify-center min-w-30">
                            <div className="text-4xl font-black text-amber-500">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex gap-0.5 my-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`size-4 ${
                                            star <= Math.round(stats.averageRating)
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                {stats.totalReviews} đánh giá
                            </p>
                        </div>

                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = [stats.rating5Count, stats.rating4Count, stats.rating3Count, stats.rating2Count, stats.rating1Count][5 - star];
                                const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                return (
                                    <button
                                        key={star}
                                        onClick={() => { setRatingFilter(ratingFilter === star ? null : star); setPage(1); }}
                                        className={`flex items-center gap-2 w-full group transition-colors rounded-lg p-1 ${
                                            ratingFilter === star
                                                ? 'bg-indigo-50/80 font-bold'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold w-8 text-left">{star} sao</span>
                                        <Star className="size-3 text-amber-400 fill-amber-400" />
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-10 text-right">
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}

            {(isWriting || userReview) && (
                <Card className="p-6">
                    <h3 className="font-bold mb-4">
                        {userReview ? 'Đánh giá của bạn' : 'Viết đánh giá của bạn'}
                    </h3>
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setNewRating(star)}>
                                <Star
                                    className={`size-6 transition-colors ${
                                        star <= newRating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300 hover:text-amber-300'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                        className="mb-4 min-h-25 rounded-xl border-gray-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                    />
                    <div className="flex gap-2">
                        <Button className="rounded-xl font-bold h-9 text-xs" onClick={userReview ? handleUpdateReview : handleSubmitReview}>
                            {userReview ? 'Cập nhật' : 'Gửi đánh giá'}
                        </Button>
                        <Button variant="outline" className="rounded-xl font-bold h-9 text-xs" onClick={() => { setIsWriting(false); setNewComment(''); }}>
                            Hủy
                        </Button>
                        {userReview && (
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold h-9 text-xs"
                                onClick={handleDeleteReview}
                            >
                                Xóa đánh giá
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <Card className="p-8 text-center border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-semibold">
                            {ratingFilter
                                ? `Không tìm thấy đánh giá ${ratingFilter} sao nào ở trang này.`
                                : 'Chưa có đánh giá nào cho khóa học này.'}
                        </p>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-xs transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-extrabold text-indigo-600 text-sm">
                                    {review.userFullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-gray-900">{review.userFullName}</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`size-3 ${
                                                        star <= review.rating
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
                                            {review.comment}
                                        </p>
                                    )}
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-500">
                        Hiển thị {(page - 1) * 10 + 1}–{Math.min(page * 10, totalRecords)} trong tổng số {totalRecords} đánh giá
                    </div>
                    <Pagination
                        pageNumber={page}
                        totalPages={totalPages}
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}

