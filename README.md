# SkillMetrix LMS

SkillMetrix LMS là một hệ thống quản lý học tập (Learning Management System) hiện đại, hiệu năng cao, được thiết kế và phát triển theo chuẩn **Production-Grade**. Dự án tích hợp các công nghệ Full-Stack tiên tiến, áp dụng kiến trúc **Vertical Slice Architecture** cho Backend và mô hình **Component-Driven** cho Frontend, mang lại khả năng mở rộng (scalability), dễ bảo trì (maintainability) và trải nghiệm học tập tối ưu.

---

## 🚀 Điểm Nhấn Công Nghệ (Tech Stack Highlights)

*   **Backend (.NET Core API):**
    *   **Core Framework:** ASP.NET Core Web API với **.NET 8.0 LTS** (Cấu trúc mã nguồn hiện đại, tối ưu hiệu năng).
    *   **Database ORM & Engine:** Entity Framework Core 8 kết hợp với cơ sở dữ liệu **PostgreSQL (Supabase Cloud Database)**.
    *   **Database Routing:** Sử dụng **Supabase Connection Pooler** (Supavisor) ở chế độ Transaction Mode (`Port=6543`) cho luồng chạy chính và Session Mode (`Port=5432`) phục vụ các tiến trình di trú dữ liệu (EF Migrations).
    *   **API Documentation & UI:** **Scalar API Reference** (Giao diện API tương tác thế hệ mới thay thế cho Swagger UI truyền thống) kết hợp Swashbuckle OpenAPI.
    *   **Authentication & Identity:** ASP.NET Core Identity & Token Bearer JWT (Access Token & Refresh Token bảo mật).
    *   **Libraries:** Mapster (Object mapping tốc độ cao), FluentValidation (Tự động hóa validate request thông qua ASP.NET Pipeline), Bogus (Phục vụ việc seed mock data phong phú).
    *   **Media Storage:** Tích hợp **Supabase Storage** (thông qua Typed HttpClient gọi trực tiếp đến REST API của Supabase, loại bỏ hoàn toàn package dependencies cồng kềnh để tối ưu hóa hiệu suất và dung lượng build).
*   **Frontend (React Client):**
    *   **Core:** React 19, Vite 8, TypeScript (Công nghệ biên dịch và Hot Module Replacement cực nhanh).
    *   **Styling:** **Tailwind CSS v4** (Hiệu năng CSS vượt trội nhờ compiler mới, giảm tối đa dung lượng build).
    *   **State Management & Caching:** Zustand 5 (Quản lý global client state gọn nhẹ) và TanStack React Query v5 (Đồng bộ, tối ưu hóa caching server-state và auto-refetching).
    *   **Routing:** React Router DOM v7 (Hỗ trợ cấu trúc route đa cấp và middleware bảo vệ tài nguyên).
    *   **Video Playback & Measurement:** Xử lý đo lường thời lượng video trực tiếp tại Client trước khi gửi request tải lên Backend (giải pháp tối ưu giúp giảm tải tài nguyên xử lý của server).
    *   **UI Components:** Radix UI primitives kết hợp Shadcn UI, Sonner (Thông báo toast), Recharts (Trực quan hóa số liệu phân tích) và Lucide React cho hệ thống icon tối giản.
*   **Testing & DevOps:**
    *   **Local Database Container:** Cấu hình Dockerized hỗ trợ khởi chạy **PostgreSQL 16** cục bộ (Tương thích 100% với cả chip Apple Silicon ARM64 và Intel x64).
    *   **Automated Testing:** **Playwright E2E Testing** (Kịch bản giả lập hành vi thực tế trên trình duyệt cho mọi Role).
    *   **API Verification:** Bộ test tích hợp tự động với **Newman (Postman CLI)** kiểm tra độ ổn định của 100% endpoint với 146 assertions luôn xanh.
    *   **Cloud Deployment Ready:** Cấu hình Dockerfile, docker-compose hoàn chỉnh phục vụ triển khai lên các dịch vụ Docker Cloud (Render, Koyeb, Railway...).

---

## 🏛️ Kiến Trúc Hệ Thống (Architectural Design)

### 1. Backend: Vertical Slice Architecture (VSA)
Dự án áp dụng **Vertical Slice Architecture** thay vì kiến trúc phân lớp truyền thống (N-Tier) để nâng cao khả năng quản lý mã nguồn.
*   **Đặc điểm:** Toàn bộ code xử lý một tính năng (gồm Controller, Service, Validator, DTO) được gom nhóm lại trong một thư mục (Slice) nằm dưới thư mục [api/Features/](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/Features) (Ví dụ: `Auth`, `Courses`, `Quizzes`, `Reviews`, `Transactions`, `Lessons`).
*   **Ưu điểm:**
    *   **High Cohesion (Tính liên kết cao):** Khi cần sửa đổi hay phát triển một tính năng, nhà phát triển chỉ cần làm việc trong duy nhất một thư mục tính năng đó.
    *   **Low Coupling (Tính phụ thuộc thấp):** Các lát cắt tính năng hoạt động độc lập, hạn chế tối đa tác động chéo (side-effect) lên các vùng tính năng khác khi nâng cấp.
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

---

## 💾 Thiết Kế Cơ Sở Dữ Liệu & Tối Ưu Hóa (Database Optimization)

Cấu trúc cơ sở dữ liệu PostgreSQL được cấu hình chi tiết tại [ApplicationDbContext.cs](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/Infrastructure/Persistence/ApplicationDbContext.cs):
*   **Tối ưu bộ nhớ lưu trữ:** Cấu hình các cột Enum sử dụng kiểu dữ liệu nguyên phù hợp trong database thay vì lưu chuỗi text nhằm tiết kiệm không gian lưu trữ và tăng hiệu năng truy vấn.
*   **Chiến lược Indexing tối ưu:**
    *   Tạo Single Index trên các cột thường xuyên được truy vấn lọc, tìm kiếm và sắp xếp: `InstructorId`, `Status`, `IsDeleted`, `CreatedAt`, `PublishedAt`.
    *   Tạo Composite Index tối ưu cho các truy vấn ghép phức tạp: `new { Status, IsDeleted, PublishedAt }` (Hiển thị các khóa học đang hoạt động trên trang chủ), `new { UserId, LastUpdatedAt }` (Tính toán chuỗi streak học tập hàng ngày).
    *   Sử dụng Unique Index để ràng buộc tính toàn vẹn dữ liệu: `new { UserId, CourseId }` trên bảng `Enrollments` (Ngăn chặn một người đăng ký học trùng lặp một khóa học), `CertificateCode` trên bảng `Certificates` (Tăng tốc độ tra cứu xác minh chứng chỉ).
*   **Thiết lập Cascade Delete an toàn:** Cấu hình `DeleteBehavior.Restrict` đối với các mối quan hệ liên quan đến lịch sử tài chính và học tập như `Transactions`, `Enrollments`, `Certificates` nhằm tránh tình trạng mất dữ liệu lịch sử quan trọng do vô tình xóa tài khoản người dùng hoặc khóa học.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Local (Quick Start)

### Yêu cầu tiên quyết:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Node.js (v18+)](https://nodejs.org/) & [pnpm](https://pnpm.io/)
*   Tài khoản **Supabase** (Free Tier) đã tạo sẵn Bucket tên là `skillmetrix` ở chế độ **Public**.

---

### Bước 1: Cấu hình Secrets và Kết nối Database

Bạn có hai cách để khởi chạy cơ sở dữ liệu:

#### Cách A: Sử dụng Supabase Cloud Database (Được khuyến nghị cho giống môi trường chạy thực tế)
Chạy các lệnh cấu hình bí mật cục bộ bằng công cụ `user-secrets` tại thư mục [api/](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api):
```bash
cd api

# 1. Cấu hình Connection String tới Session Pooler của Supabase (Cổng 5432)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.your-project-id;Password=YourDbPassword;SSL Mode=Require;Trust Server Certificate=true;"

# 2. Cấu hình Credentials của Supabase Storage
dotnet user-secrets set "Supabase:Url" "https://your-project-id.supabase.co"
dotnet user-secrets set "Supabase:ServiceRoleKey" "your-service-role-key"
dotnet user-secrets set "Supabase:BucketName" "skillmetrix"
```

#### Cách B: Sử dụng PostgreSQL cục bộ bằng Docker
Nếu muốn chạy cơ sở dữ liệu hoàn toàn dưới máy (Local Offline):
1.  Khởi chạy container PostgreSQL:
    ```bash
    docker compose up -d
    ```
2.  Cập nhật cấu hình Connection String trỏ về local trong secrets:
    ```bash
    dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=SkillMetrixDB;Username=postgres;Password=your_local_password;"
    ```

---

### Bước 2: Chạy Migrations và Khởi chạy Backend API

1.  Áp dụng Entity Framework Core Migrations để tự động tạo cấu trúc bảng dữ liệu:
    ```bash
    dotnet ef database update
    ```
2.  Khởi chạy ứng dụng:
    ```bash
    dotnet run
    ```
    *API sẽ hoạt động tại địa chỉ: `http://localhost:5015`*
    *   **Scalar API Reference (Tương tác trực tiếp):** Truy cập `http://localhost:5015/scalar` để kiểm tra tài liệu và test trực tiếp các endpoint.
    *   **Swagger UI:** Truy cập `http://localhost:5015/swagger`.

---

### Bước 3: Cài đặt và Chạy Frontend Client

1.  Di chuyển vào thư mục client:
    ```bash
    cd client
    ```
2.  Tạo file cấu hình môi trường từ mẫu:
    ```bash
    cp .env.example .env.local
    ```
3.  Cài đặt các gói thư viện và chạy:
    ```bash
    pnpm install
    pnpm dev
    ```
    *Client sẽ hoạt động mặc định tại địa chỉ: `http://localhost:5173` (hoặc tự chuyển sang `http://localhost:5174` nếu cổng 5173 bị chiếm dụng).*

---

## 🧪 Quy Trình Kiểm Thử Tự Động (Testing Workflow)

### 1. End-to-End (E2E) Testing với Playwright
Thư mục [client/e2e/tests](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/client/e2e/tests) chứa 5 file kiểm thử kịch bản nghiệp vụ phức tạp của ứng dụng:
*   `auth.spec.ts`: Xác thực quy trình Đăng nhập, Đăng ký, Quên mật khẩu và Reset mật khẩu.
*   `public.spec.ts`: Kiểm thử việc duyệt tìm kiếm khóa học và xem chi tiết khóa học của khách vãng lai.
*   `student.spec.ts`: Kiểm tra luồng học tập thực tế (Xem bài học, ghi chú cá nhân, gửi câu hỏi thảo luận, làm bài kiểm tra trắc nghiệm).
*   `instructor.spec.ts`: Kiểm tra nghiệp vụ tạo khóa học, sắp xếp chương học/bài học, và thiết kế bài kiểm tra trắc nghiệm của giảng viên.
*   `admin.spec.ts`: Giả lập nghiệp vụ duyệt phê duyệt nội dung khóa học mới và quản trị tài khoản người dùng của quản trị viên.

Thực thi chạy kiểm thử E2E:
```bash
cd client
pnpm exec playwright install
pnpm test:e2e      # Chạy chế độ không hiển thị trình duyệt (headless)
pnpm test:e2e:ui   # Chạy bằng giao diện Playwright UI hỗ trợ debug trực quan
```

### 2. Integration Testing với Postman & Newman
Tệp tin Postman Collection được chuẩn bị sẵn tại [api/tests/SkillMetrix-LMS.postman_collection.json](file:///Users/aiumimi/Developer/FullStack/SkillMetrix-LMS/api/tests/SkillMetrix-LMS.postman_collection.json). Bạn có thể kiểm tra nhanh toàn bộ các endpoint bằng lệnh CLI:
```bash
npx newman run api/tests/SkillMetrix-LMS.postman_collection.json
```

---

## ☁️ Sẵn Sàng Cho Deploy Thực Tế (Production Cloud Readiness)

*   **Tự động hóa Migration khởi chạy:** Backend được tích hợp sẵn đoạn code tự động chạy `dbContext.Database.Migrate()` khi khởi động ứng dụng giúp hệ thống tự động cập nhật schema DB trên Cloud mà không cần can thiệp thủ công từ công cụ CLI bên ngoài.
*   **Client SPA Routing (Vercel):** Phía Client được cấu hình sẵn các rewrite rules đảm bảo các Route con của ứng dụng Single Page Application (SPA) hoạt động bình thường, không bị lỗi 404 khi người dùng refresh trình duyệt trực tiếp.
