#!/bin/bash
cd ..

# 1. Infrastructure, Configs, Common Libraries
git add client/package.json client/pnpm-lock.yaml client/vite.config.ts client/tsconfig.json client/.env.example client/.gitignore client/playwright.config.js api/Program.cs
git add client/src/lib/ client/src/shared/ client/src/hooks/ client/src/components/ui/ client/src/components/common/ client/src/routes/AppRouter.tsx
git rm -f client/.env.production client/src/lib/hooks/useApi.ts client/src/lib/hooks/useDebounce.ts client/src/lib/hooks/useLocalStorage.ts client/src/lib/hooks/useMediaQuery.ts client/src/lib/hooks/usePagination.ts 2>/dev/null
git commit -m "chore(core): update config, dependencies, routing, and common UI utilities"

# 2. Auth, Dashboards, Home, Layouts
git add client/src/features/auth/ client/src/components/layout/ client/src/features/dashboard/ client/src/features/home/ client/src/features/index.ts
git rm -f client/src/layouts/InstructorLayout.tsx 2>/dev/null
git commit -m "feat(ui): implement new layouts, auth flow improvements, and dashboards"

# 3. Profiles Feature
git add api/Features/Profiles/ client/src/features/profile/
git commit -m "feat(profiles): implement student and instructor profile pages and services"

# 4. Reviews Feature
git add api/Features/Reviews/ client/src/features/reviews/
git commit -m "feat(reviews): add course rating and review system"

# 5. Admin CMS
git add api/Features/Admin/ client/src/features/admin/
git commit -m "feat(admin): enhance admin CMS for users and courses management"

# 6. Core LMS Features (Courses, Learning, Enrollments)
git add api/Features/Courses/ client/src/features/courses/ client/src/features/learning/ client/src/features/progress/ client/src/features/upload/ client/src/features/instructor/ client/src/features/enrollments/ client/src/features/transactions/
git rm -f client/src/types/instructor.ts 2>/dev/null
git commit -m "feat(lms): update course creation, learning progress, and enrollment flows"

# 7. E2E Testing
git add client/e2e/
git commit -m "test(e2e): add Playwright test suites for auth, admin, instructor, and student flows"

# 8. Remaining Services (Seed, Stats) & anything left
git add api/Features/Seed/ api/Features/Statistics/
git add -A
git commit -m "chore: update database seeder, stats, and remaining minor changes"

