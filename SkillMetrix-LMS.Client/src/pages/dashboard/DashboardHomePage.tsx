import { useAuthStore } from "../../stores/authStore";

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">
        Xin chào {user?.fullName ?? "bạn"}!
      </h1>
      <p className="text-gray-600">Đây là trang dashboard.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded border bg-white p-4">Khóa học đã enroll: 0</div>
        <div className="rounded border bg-white p-4">
          Bài học đã hoàn thành: 0
        </div>
        <div className="rounded border bg-white p-4">
          Tiến độ trung bình: 0%
        </div>
      </div>
    </section>
  );
}
