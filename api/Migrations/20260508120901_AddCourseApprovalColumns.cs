using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillMetrix_LMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseApprovalColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Courses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedBy",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Courses");
        }
    }
}
