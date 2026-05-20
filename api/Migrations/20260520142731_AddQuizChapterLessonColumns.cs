using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillMetrix_LMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizChapterLessonColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LessonAnswers_AspNetUsers_UserId",
                table: "LessonAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonNotes_AspNetUsers_UserId",
                table: "LessonNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonQuestions_AspNetUsers_UserId",
                table: "LessonQuestions");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonAnswers_AspNetUsers_UserId",
                table: "LessonAnswers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonNotes_AspNetUsers_UserId",
                table: "LessonNotes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonQuestions_AspNetUsers_UserId",
                table: "LessonQuestions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LessonAnswers_AspNetUsers_UserId",
                table: "LessonAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonNotes_AspNetUsers_UserId",
                table: "LessonNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonQuestions_AspNetUsers_UserId",
                table: "LessonQuestions");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonAnswers_AspNetUsers_UserId",
                table: "LessonAnswers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonNotes_AspNetUsers_UserId",
                table: "LessonNotes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonQuestions_AspNetUsers_UserId",
                table: "LessonQuestions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
