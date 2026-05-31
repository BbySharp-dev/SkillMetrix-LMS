# SkillMetrix LMS

SkillMetrix LMS là một hệ thống quản lý học tập (Learning Management System) hiện đại, hiệu năng cao, được thiết kế và phát triển theo chuẩn **Production-Grade**. Dự án tích hợp các công nghệ Full-Stack tiên tiến nhất năm 2026, áp dụng kiến trúc **Vertical Slice Architecture** cho Backend và mô hình **Component-Driven** cho Frontend, mang lại khả năng mở rộng (scalability), dễ bảo trì (maintainability) và trải nghiệm học tập tối ưu cho người dùng.

---

## 🚀 Điểm Nhấn Công Nghệ (Tech Stack Highlights - 2026)

*   **Backend (.NET Core API):**
    *   **Core Framework:** ASP.NET Core Web API với **.NET 8.0 LTS** (Cấu trúc mã nguồn hiện đại, tối ưu hiệu năng).
    *   **Database ORM:** Entity Framework Core 8 kết hợp Microsoft SQL Server.
    *   **API Documentation & UI:** **Scalar API Reference** (Giao diện API tương tác, hiện đại thế hệ mới thay thế cho Swagger UI truyền thống) kết hợp Swashbuckle OpenAPI.
    *   **Authentication & Identity:** ASP.NET Core Identity & Token Bearer JWT (Access Token & Refresh Token bảo mật cao).
    *   **Libraries:** Mapster (Object mapping tốc độ cao), FluentValidation (Tự động hóa validate request thông qua ASP.NET Pipeline), Bogus (Phục vụ việc seed mock data phong phú).
    *   **Media Storage:** Integration với Cloudinary SDK phục vụ việc upload tài liệu và video bài học.
*   **Frontend (React Client):**
    *   **Core:** React 19, Vite 8, TypeScript (Công nghệ biên dịch và Hot Module Replacement cực nhanh).
    *   **Styling:** **Tailwind CSS v4** (Hiệu năng CSS vượt trội nhờ compiler mới, giảm tối đa dung lượng build).
    *   **State Management & Caching:** Zustand 5 (Quản lý global client state gọn nhẹ) và TanStack React Query v5 (Đồng bộ, tối ưu hóa caching server-state và auto-refetching).
    *   **Routing:** React Router DOM v7 (Hỗ trợ cấu trúc route đa cấp và middleware bảo vệ tài nguyên).
    *   **UI Components:** Radix UI primitives kết hợp Shadcn UI, Sonner (Thông báo toast), Recharts (Trực quan hóa số liệu phân tích) và Lucide React cho hệ thống icon tối giản.
*   **Testing & DevOps:**
    *   **Local Database Container:** Dockerized với Azure SQL Edge (Tương thích 100% với cả chip Apple Silicon ARM64 và Intel x64).
    *   **Automated Testing:** **Playwright E2E Testing** (Kịch bản giả lập hành vi thực tế trên trình duyệt cho mọi Role).
    *   **Cloud Deployment Ready:** Cấu hình Dockerfile, docker-compose hoàn chỉnh và config Railway CD.

---

## 🏛️ Kiến Trúc Hệ Thống (Architectural Design)

### 1. Backend: Vertical Slice Architecture (VSA)
Thay vì sử dụng kiến trúc phân lớp truyền thống (N-Tier/Clean Architecture) thường dẫn đến việc mã nguồn bị phân tán ở nhiều Project khác nhau, dự án áp dụng **Vertical Slice Architecture**.
*   **Đặc điểm:** Toàn bộ code xử lý một tính năng (gồm Controller, Service, Validator, DTO) được gom nhóm lại trong một thư mục (Slice) nằm dưới thư mục [api/Features/](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/Features) (Ví dụ: `Auth`, `Courses`, `Quizzes`, `Reviews`, `Transactions`).
*   **Ưu điểm:**
    *   **High Cohesion (Tính liên kết cao):** Khi cần sửa đổi hay phát triển một tính năng, nhà phát triển chỉ cần làm việc trong duy nhất một thư mục tính năng đó.
    *   **Low Coupling (Tính phụ thuộc thấp):** Các lát cắt tính năng hoạt động độc lập, hạn chế tối đa side-effect lên các vùng tính năng khác khi nâng cấp.
*   **Global Exception Handling Middleware:** Bộ lọc lỗi tập trung tự động bắt tất cả các ngoại lệ chưa được xử lý trong runtime, ghi log và định dạng lại mã lỗi JSON trả về đồng nhất cho Client.

### 2. Frontend: Component-Driven & Role-Based Private Routes
Hệ thống Frontend được cấu trúc dạng module hóa tại thư mục [client/src/features](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/client/src/features) tương ứng trực tiếp với các module Backend.
*   **Phân quyền Route (RBAC):** Kết hợp `react-router-dom` v7 với các wrapper component bảo mật:
    *   `PrivateRoute`: Bảo vệ các tài nguyên yêu cầu đăng nhập.
    *   `RoleRoute`: Kiểm soát quyền truy cập chi tiết dựa trên Role của người dùng (`Student`, `Instructor`, `Admin`, `Moderator`).
*   **Tối ưu tải trang (Lazy Loading):** Sử dụng `React.lazy` và `Suspense` để phân tách mã nguồn thành các bundle chunk nhỏ hơn theo từng Route, giúp giảm tải dung lượng tải trang ban đầu (First Contentful Paint).

---

## 🛡️ Phân Quyền Người Dùng & Các Tính Năng Core

SkillMetrix LMS triển khai hệ thống phân quyền chặt chẽ thông qua **Role-Based Access Control (RBAC)** với 4 vai trò chính:

*   **Học viên (Student):** Tìm kiếm, xem chi tiết và đăng ký khóa học qua cổng thanh toán giả lập; học các bài học (Video, Tài liệu đính kèm); ghi chép bài học cá nhân; tham gia đặt câu hỏi/thảo luận trong diễn đàn bài học; thực hiện làm bài kiểm tra trắc nghiệm; theo dõi tiến độ và tải chứng chỉ hoàn thành khóa học.
*   **Giảng viên (Instructor):** Quản lý các khóa học do mình tạo ra; xây dựng khung chương trình học (Chương, Bài học, Tài liệu học liệu); thiết lập ngân hàng câu hỏi trắc nghiệm; theo dõi thống kê doanh thu bán khóa học và số lượng học viên đăng ký qua Dashboard biểu đồ chuyên sâu.
*   **Điều hành viên (Moderator):** Kiểm duyệt nội dung các khóa học mới do Giảng viên gửi yêu cầu xuất bản để đảm bảo chất lượng giảng dạy và tính phù hợp trước khi xuất hiện trên trang chủ công cộng.
*   **Quản trị viên (Admin):** Toàn quyền kiểm soát hệ thống; quản lý danh sách người dùng (Kích hoạt/Khóa tài khoản, Thay đổi Role); cấu hình hệ thống và xem báo cáo tài chính tổng quan.

### Các tính năng mang tính Production-Grade tiêu biểu:
1.  **Hệ Thống Trắc Nghiệm Tự Động Chấm Điểm (Quiz Engine):** Hỗ trợ tạo ngân hàng câu hỏi nhiều lựa chọn (Multiple-choice), thiết lập điểm số chuẩn qua môn (Passing Score) theo phần trăm, giới hạn thời gian và lưu lại toàn bộ lịch sử các lượt làm bài chi tiết của học viên.
2.  **Hệ Thống Phục Hồi Dữ Liệu Demo Tự Động (Auto-Reset Database):** Sử dụng `DatabaseResetBackgroundService` (kế thừa `BackgroundService` chạy nền của ASP.NET Core) tự động dọn dẹp và reset database về trạng thái ban đầu kèm seed dữ liệu mẫu mới mỗi ngày vào lúc 20:00 UTC (3:00 AM giờ Việt Nam).
3.  **Tự Động Cấp Chứng Chỉ (Certificate Validation):** Khi tiến độ học tập đạt 100%, hệ thống tự động sinh chứng chỉ hoàn thành khóa học và cấp kèm một **Mã chứng chỉ độc bản (Unique Certificate Code)** đã được đánh Index trong Database phục vụ việc xác thực tính hợp lệ trực tuyến.

---

## 💾 Thiết Kế Cơ Cơ Dữ Liệu & Tối Ưu Hóa (Database Optimization)

Cấu trúc cơ sở dữ liệu SQL Server được ánh xạ và cấu hình chi tiết tại [ApplicationDbContext.cs](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/Infrastructure/Persistence/ApplicationDbContext.cs):
*   **Tối ưu bộ nhớ lưu trữ:** Cấu hình kiểu dữ liệu `tinyint` trong SQL Server cho các thuộc tính Enum (Trạng thái khóa học, Vai trò người dùng, Điểm số đánh giá) thay vì dùng mặc định `int` (4 bytes) nhằm tiết kiệm không gian lưu trữ và tăng hiệu năng truy vấn.
*   **Chiến lược Indexing tối ưu:**
    *   Tạo Single Index trên các cột thường xuyên được truy vấn lọc, tìm kiếm và sắp xếp: `InstructorId`, `Status`, `IsDeleted`, `CreatedAt`, `PublishedAt`.
    *   Tạo Composite Index tối ưu cho các truy vấn ghép phức tạp: `new { Status, IsDeleted, PublishedAt }` (Hiển thị các khóa học đang hoạt động trên trang chủ), `new { UserId, LastUpdatedAt }` (Tính toán chuỗi streak học tập hàng ngày).
    *   Sử dụng Unique Index để ràng buộc tính toàn vẹn dữ liệu: `new { UserId, CourseId }` trên bảng `Enrollments` (Ngăn chặn một người đăng ký học trùng lặp một khóa học), `CertificateCode` trên bảng `Certificates` (Tăng tốc độ tra cứu xác minh chứng chỉ).
*   **Thiết lập Cascade Delete an toàn:** Cấu hình `DeleteBehavior.Restrict` đối với các mối quan hệ liên quan đến lịch sử tài chính và học tập như `Transactions`, `Enrollments`, `Certificates` nhằm tránh tình trạng mất dữ liệu lịch sử quan trọng do vô tình xóa tài khoản người dùng hoặc khóa học (tránh lỗi Multiple Cascade Paths trong SQL Server).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Local (Quick Start)

### Yêu cầu tiên quyết:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Node.js (v18+)](https://nodejs.org/) & [pnpm](https://pnpm.io/)

### Bước 1: Khởi động Database với Docker Compose
Để giúp dự án chạy mượt mà trên cả máy tính chạy chip ARM64 (Apple Silicon M1/M2/M3) lẫn chip Intel x64, dự án cấu hình image **Azure SQL Edge** thay vì SQL Server truyền thống. 
Chạy lệnh sau tại thư mục chứa file `docker-compose.yml`:
```bash
docker compose up -d
```
*Database sẽ khởi chạy độc lập trên port `1434` nhằm tránh xung đột với các phiên bản SQL Server cài sẵn trên máy.*

### Bước 2: Cài đặt và Chạy Backend API
1.  Di chuyển vào thư mục API:
    ```bash
    cd api
    ```
2.  Tạo file môi trường `.env` từ file mẫu `.env.example`:
    ```bash
    cp .env.example .env
    ```
    *(Mở file `.env` lên và điều chỉnh lại cấu hình kết nối DB hoặc JWT Secret Key nếu cần).*
3.  Áp dụng Entity Framework Core Migrations để tạo bảng và dữ liệu ban đầu:
    ```bash
    dotnet ef database update
    ```
4.  Khởi chạy Backend API:
    ```bash
    dotnet run
    ```
    *API sẽ hoạt động tại địa chỉ: `http://localhost:5015`*
    *   **Scalar API Reference (Tương tác trực tiếp):** Truy cập `http://localhost:5015/scalar` để kiểm tra tài liệu và test trực tiếp các endpoint.
    *   **Swagger UI:** Truy cập `http://localhost:5015/swagger`.

### Bước 3: Cài đặt và Chạy Frontend Client
1.  Mở một Terminal mới và di chuyển vào thư mục client:
    ```bash
    cd client
    ```
2.  Tạo file môi trường `.env.local` từ file mẫu `.env.example`:
    ```bash
    cp .env.example .env.local
    ```
3.  Cài đặt các thư viện phụ thuộc bằng `pnpm`:
    ```bash
    pnpm install
    ```
4.  Chạy ứng dụng trong môi trường Development:
    ```bash
    pnpm dev
    ```
    *Client sẽ hoạt động tại địa chỉ: `http://localhost:5173`*

---

## 🧪 Quy Trình Kiểm Thử Tự Động (Testing Workflow)

Dự án nhấn mạnh tính hoàn thiện và chuẩn production thông qua việc triển khai các kịch bản kiểm thử tự động toàn diện.

### End-to-End (E2E) Testing với Playwright
Thư mục [client/e2e/tests](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/client/e2e/tests) chứa 5 file kiểm thử kịch bản nghiệp vụ phức tạp của ứng dụng:
*   `auth.spec.ts`: Xác thực quy trình Đăng nhập, Đăng ký, Quên mật khẩu và Reset mật khẩu.
*   `public.spec.ts`: Kiểm thử việc duyệt tìm kiếm khóa học và xem chi tiết khóa học của khách vãng lai.
*   `student.spec.ts`: Kiểm tra luồng học tập thực tế (Xem bài học, ghi chú cá nhân, gửi câu hỏi thảo luận, làm bài kiểm tra trắc nghiệm).
*   `instructor.spec.ts`: Kiểm tra nghiệp vụ tạo khóa học, sắp xếp chương học/bài học, và thiết kế bài kiểm tra trắc nghiệm của giảng viên.
*   `admin.spec.ts`: Giả lập nghiệp vụ duyệt phê duyệt nội dung khóa học mới và quản trị tài khoản người dùng của quản trị viên.

Để thực thi chạy các bài kiểm thử E2E:
```bash
cd client
# Cài đặt các trình duyệt Playwright (cho lần chạy đầu tiên)
pnpm exec playwright install

# Chạy toàn bộ các ca kiểm thử ở chế độ headless
pnpm test:e2e

# Mở giao diện Playwright UI trực quan phục vụ việc debug trực tiếp từng dòng code test
pnpm test:e2e:ui
```

### API Testing với Postman Collection
Dự án cung cấp sẵn file Postman Collection tại [api/tests/SkillMetrix-LMS.postman_collection.json](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/tests/SkillMetrix-LMS.postman_collection.json). Bạn chỉ cần Import file này vào phần mềm Postman để thực thi kiểm thử tích hợp (Integration Test) tự động đối với toàn bộ hệ thống API endpoints một cách nhanh chóng.

---

## ☁️ Sẵn Sàng Cho Deploy Thực Tế (Production Cloud Readiness)

*   **Tự động hóa Migration khởi chạy:** Backend được tích hợp sẵn đoạn code tự động chạy `dbContext.Database.Migrate()` khi bắt đầu khởi chạy ứng dụng (Startup) giúp hệ thống tự động cập nhật schema DB trên Cloud (như Railway) mà không cần can thiệp thủ công từ công cụ CLI bên ngoài.
*   **Cấu hình Deploy (Railway):** Tệp [api/railway.toml](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/railway.toml) chỉ định chính xác môi trường build và tối ưu hóa thời gian khởi chạy API trên nền tảng Railway.
*   **Client SPA Routing (Vercel):** Phía Client được cấu hình sẵn các rewrite rules đảm bảo các Route con của ứng dụng Single Page Application (SPA) hoạt động bình thường, không bị lỗi 404 khi người dùng refresh trình duyệt trực tiếp.
