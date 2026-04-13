import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">403</h1>
        <p className="text-gray-600 mb-4">
          Bạn không có quyền truy cập trang này.
        </p>
        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
