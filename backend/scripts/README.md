# Database Scripts

## Clear Database Script

This script deletes all data from all collections in the database for fresh testing.

### Usage

```bash
# From the backend directory
npm run clear-db

# Or directly with node
node scripts/clearDatabase.js
```

### What it does

The script will delete all documents from:
- Users
- Projects
- Tasks
- Materials
- Expenses
- Documents
- Notifications

### ⚠️ Warning

This action is **irreversible**. All data will be permanently deleted. Make sure you have backups if needed.

### Output

The script will show:
- Connection status
- Number of documents deleted from each collection
- Summary of all deletions

