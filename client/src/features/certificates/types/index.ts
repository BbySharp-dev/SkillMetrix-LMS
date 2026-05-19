export interface CertificateDto {
    id: string;
    userId: string;
    courseId: string;
    courseTitle: string;
    courseThumbnail: string | null;
    instructorName: string | null;
    certificateCode: string;
    pdfUrl: string | null;
    issuedAt: string;
}
