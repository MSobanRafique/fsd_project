# Backend Environment Setup

Create a `.env` file in the backend directory with the following content:

## For MongoDB Atlas (Cloud - Recommended):

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/buildwise?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

## For Local MongoDB (Offline):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buildwise
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

## MongoDB Atlas Setup Instructions:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (or log in if you have one)
3. Create a new cluster (Free tier M0 is available)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
5. Whitelist your IP address:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP
6. Get your connection string:
   - Go to "Clusters" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `buildwise` (or your preferred database name)
   - Example: `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/buildwise?retryWrites=true&w=majority`

## Important Notes:

- **MongoDB Atlas**: No local installation needed, works from anywhere with internet
- **Local MongoDB**: Requires MongoDB to be installed and running on your machine
- Replace `<username>`, `<password>`, and `<cluster-url>` in the connection string with your actual values
- Keep your `.env` file secure and never commit it to version control!

