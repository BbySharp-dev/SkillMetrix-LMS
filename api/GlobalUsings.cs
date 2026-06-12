global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.EntityFrameworkCore;
global using SkillMetrix_LMS.API.Infrastructure.Controllers;
global using SkillMetrix_LMS.API.Infrastructure.Persistence;
// Domain
global using SkillMetrix_LMS.API.Domain.Common;
global using SkillMetrix_LMS.API.Domain.Enums;
global using SkillMetrix_LMS.API.Domain.Entities;
// Feature Entities
global using SkillMetrix_LMS.API.Features.Courses.Entities;
global using SkillMetrix_LMS.API.Features.Chapters.Entities;
global using SkillMetrix_LMS.API.Features.Lessons.Entities;
global using SkillMetrix_LMS.API.Features.Enrollments.Entities;
global using SkillMetrix_LMS.API.Features.Transactions.Entities;
global using SkillMetrix_LMS.API.Features.Reviews.Entities;
global using SkillMetrix_LMS.API.Features.Progress.Entities;
global using SkillMetrix_LMS.API.Features.Certificates.Entities;
global using SkillMetrix_LMS.API.Features.Quizzes.Entities;

// Common System namespaces
global using System.Security.Claims;
global using System.ComponentModel.DataAnnotations;
global using System.ComponentModel.DataAnnotations.Schema;

// Third-party packages
global using FluentValidation;
global using Mapster;

// Entity Framework Core Metadata Builders
global using Microsoft.EntityFrameworkCore.Metadata.Builders;