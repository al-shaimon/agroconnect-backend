# Cloudinary Setup Guide for AgroConnect

## Overview

AgroConnect uses Cloudinary for cloud-based document storage with a structured folder organization
system.

## Folder Structure in Cloudinary

Documents are organized as follows:

```
agroconnect/
├── farmer/
│   ├── {userId}/
│   │   ├── nid/
│   │   ├── passport/
│   │   ├── driving_license/
│   │   ├── birth_certificate/
│   │   └── trade_license/
└── buyer/
    ├── {userId}/
    │   ├── nid/
    │   ├── passport/
    │   ├── driving_license/
    │   ├── birth_certificate/
    │   └── trade_license/
```

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log in to your Cloudinary Dashboard
2. You'll see your credentials at the top:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configure Environment Variables

Update your `.env` file with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Features Implemented

#### Document Upload

- Automatic upload to Cloudinary with structured folders
- Files are organized by: role → userId → documentType
- Local files are deleted after successful upload
- Supports: JPEG, PNG, PDF formats
- Maximum file size: 5MB

#### Document Viewing

- Admin can view documents directly from Cloudinary URLs
- Secure URLs with HTTPS
- Original quality maintained

#### Metadata & Tags

Each uploaded document includes:

- **Tags**: user role, document type, user ID
- **Context**: Additional metadata for filtering and searching
- **Public ID**: Unique identifier for the document

#### File Cleanup

- Local temporary files are automatically deleted after upload
- Failed uploads trigger local file cleanup
- Cloudinary public IDs stored for future deletion if needed

### 5. Document Types Supported

- **NID**: National ID Card
- **Passport**: International Passport
- **Driving License**: Valid Driver's License
- **Birth Certificate**: Government Birth Certificate
- **Trade License**: Business/Trade License

### 6. Admin Verification Process

1. Users upload documents through their profile page
2. Documents are stored in Cloudinary with user-specific folders
3. Admin views pending verifications in the admin panel
4. Admin can view documents by clicking the URL
5. Admin approves or rejects with optional reason
6. Users receive verification status updates

### 7. Security Features

- Secure HTTPS URLs
- API keys stored in environment variables
- Role-based access control
- File type validation
- File size limits

### 8. Testing

After setting up Cloudinary:

1. Restart your backend server
2. Login as a farmer or buyer
3. Navigate to Profile page
4. Upload a verification document
5. Check your Cloudinary Media Library to see the organized folders

### 9. Troubleshooting

**Upload fails:**

- Verify Cloudinary credentials in `.env`
- Check internet connection
- Ensure file size is under 5MB
- Verify file format (JPEG, PNG, PDF only)

**Documents not visible:**

- Ensure Cloudinary account is active
- Check Media Library in Cloudinary Dashboard
- Verify folder structure: agroconnect/{role}/{userId}/{documentType}

**Local files not deleted:**

- Check file permissions
- Ensure uploads directory exists
- Check server logs for errors

### 10. Free Tier Limits

Cloudinary free tier includes:

- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

This is sufficient for development and small-scale production.

### 11. Production Considerations

For production deployment:

- Consider upgrading Cloudinary plan for higher limits
- Implement document retention policies
- Add automatic backup strategies
- Monitor usage through Cloudinary Dashboard
- Implement CDN caching for better performance

## Support

For issues or questions:

- Check Cloudinary documentation: https://cloudinary.com/documentation
- Review server logs for error messages
- Contact AgroConnect support team
