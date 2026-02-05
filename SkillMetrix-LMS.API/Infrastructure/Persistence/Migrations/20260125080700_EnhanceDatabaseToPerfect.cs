using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillMetrix_LMS.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceDatabaseToPerfect : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "UserLessonProgresses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CourseId",
                table: "Transactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EnrollmentId",
                table: "Transactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Lessons",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Lessons",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "Lessons",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Lessons",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Lessons",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Lessons",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Courses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Courses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Courses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Courses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "Courses",
                type: "decimal(3,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Courses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Chapters",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Chapters",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "Chapters",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Chapters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Chapters",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Chapters",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Chapters",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonProgresses_CompletedAt",
                table: "UserLessonProgresses",
                column: "CompletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonProgresses_UserId_IsCompleted",
                table: "UserLessonProgresses",
                columns: new[] { "UserId", "IsCompleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CourseId",
                table: "Transactions",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_EnrollmentId",
                table: "Transactions",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId_Type_Status",
                table: "Transactions",
                columns: new[] { "UserId", "Type", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_ChapterId_OrderIndex",
                table: "Lessons",
                columns: new[] { "ChapterId", "OrderIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_IsDeleted",
                table: "Lessons",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_IsFreePreview",
                table: "Lessons",
                column: "IsFreePreview");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_UpdatedAt",
                table: "Lessons",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsDeleted",
                table: "Courses",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_PublishedAt",
                table: "Courses",
                column: "PublishedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_Rating",
                table: "Courses",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_Status_IsDeleted_PublishedAt",
                table: "Courses",
                columns: new[] { "Status", "IsDeleted", "PublishedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_UpdatedAt",
                table: "Courses",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_CourseId_OrderIndex",
                table: "Chapters",
                columns: new[] { "CourseId", "OrderIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_IsDeleted",
                table: "Chapters",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_UpdatedAt",
                table: "Chapters",
                column: "UpdatedAt");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Enrollments_EnrollmentId",
                table: "Transactions",
                column: "EnrollmentId",
                principalTable: "Enrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Enrollments_EnrollmentId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_UserLessonProgresses_CompletedAt",
                table: "UserLessonProgresses");

            migrationBuilder.DropIndex(
                name: "IX_UserLessonProgresses_UserId_IsCompleted",
                table: "UserLessonProgresses");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CourseId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_EnrollmentId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserId_Type_Status",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_ChapterId_OrderIndex",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_IsDeleted",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_IsFreePreview",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_UpdatedAt",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Courses_IsDeleted",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_PublishedAt",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_Rating",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_Status_IsDeleted_PublishedAt",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_UpdatedAt",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_CourseId_OrderIndex",
                table: "Chapters");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_IsDeleted",
                table: "Chapters");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_UpdatedAt",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "EnrollmentId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Chapters");
        }
    }
}
