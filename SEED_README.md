# Database Seeding Instructions

## How to Seed the Database

1. Make sure your MongoDB is running
2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Run the seed script:
   ```bash
   npm run seed
   ```

## Default Accounts Created

### Admin Account

- **Email:** admin@agroconnect.com
- **Password:** admin123
- **Role:** Admin
- **Status:** Verified & Active

### Farmer Account

- **Email:** farmer@test.com
- **Password:** farmer123
- **Role:** Farmer
- **Status:** Pending Verification

### Buyer Account

- **Email:** buyer@test.com
- **Password:** buyer123
- **Role:** Buyer
- **Status:** Pending Verification

## Notes

- The seed script will clear all existing users before creating new ones
- All accounts are created with Dhaka-based locations
- Admin account is pre-verified and can access the admin dashboard immediately
- Farmer and buyer accounts are pending verification to test the verification workflow
