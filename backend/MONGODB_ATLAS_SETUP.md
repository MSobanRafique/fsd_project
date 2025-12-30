# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (cloud database) for the BuildWise project.

## Step 1: Create MongoDB Atlas Account

1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Fill in your details and create an account
4. Verify your email address

## Step 2: Create a Cluster

1. After logging in, you'll see the Atlas dashboard
2. Click "Build a Database"
3. Choose the **FREE (M0)** tier (perfect for development)
4. Select a cloud provider and region (choose closest to you)
5. Click "Create Cluster"
6. Wait 3-5 minutes for the cluster to be created

## Step 3: Create Database User

1. In the left sidebar, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** as authentication method
4. Enter a username (e.g., `buildwise_user`)
5. Enter a strong password (save this securely!)
6. Under "Database User Privileges", select **"Atlas admin"** (or "Read and write to any database")
7. Click **"Add User"**

## Step 4: Whitelist IP Address

1. In the left sidebar, go to **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - **Note**: For production, add only specific IP addresses
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Clusters"** in the left sidebar
2. Click the **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** as the driver
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open `backend/.env` file
2. Replace the `MONGODB_URI` with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://buildwise_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/buildwise?retryWrites=true&w=majority
   ```
3. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<cluster-url>` with your actual cluster URL
   - Add `/buildwise` before the `?` to specify the database name

## Step 7: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. You should see: `MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net`
3. If you see an error, check:
   - Password is correct (no special characters need encoding)
   - IP address is whitelisted
   - Connection string is correct

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in Network Access
- Try "Allow Access from Anywhere" for testing

### Authentication Failed
- Verify username and password are correct
- Make sure password doesn't contain special characters that need URL encoding
- If password has special characters, encode them (e.g., `@` becomes `%40`)

### Database Not Found
- The database will be created automatically when you first insert data
- Make sure the database name in the connection string is correct

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database users
3. **Restrict IP access** in production (don't use 0.0.0.0/0)
4. **Rotate passwords** regularly
5. **Use environment variables** for all sensitive data

## Free Tier Limitations

- 512 MB storage
- Shared RAM and vCPU
- Suitable for development and small applications
- Perfect for this project!

## Need Help?

- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- MongoDB Community Forums: [https://developer.mongodb.com/community/forums/](https://developer.mongodb.com/community/forums/)

