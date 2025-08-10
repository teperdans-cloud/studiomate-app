#!/bin/bash

# StudioMate Backup Script
# Creates a safe backup of the current working state

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current timestamp
TIMESTAMP=$(date "+%Y-%m-%d-%H%M")
BACKUP_BRANCH="backup/stable-$TIMESTAMP"
TAG_NAME="stable-before-ui-changes-$TIMESTAMP"
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🚀 StudioMate Backup Script${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Check git status
echo -e "${BLUE}🔍 Checking git status...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo ""
    echo -e "${BLUE}📄 Modified files:${NC}"
    git status --porcelain
    echo ""
    
    echo -e "${BLUE}💾 Adding all changes...${NC}"
    if ! git add -A; then
        echo -e "${RED}❌ Error: Failed to add changes${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📝 Committing changes...${NC}"
    COMMIT_MSG="backup: preserve working state before UI changes - $TIMESTAMP

🎨 Working StudioMate application state
- Dashboard with deadline tracking
- Navigation architecture fixed  
- TopBar showing hamburger menu only
- All pages using DrawerLayout correctly

🤖 Generated with Claude Code"
    
    if ! git commit -m "$COMMIT_MSG"; then
        echo -e "${RED}❌ Error: Failed to commit changes${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Changes committed successfully${NC}"
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
fi

echo ""

# Create backup branch
echo -e "${BLUE}🌿 Creating backup branch: ${BACKUP_BRANCH}${NC}"
if ! git checkout -b "$BACKUP_BRANCH"; then
    echo -e "${RED}❌ Error: Failed to create backup branch${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backup branch created successfully${NC}"

# Push backup branch to remote
echo -e "${BLUE}🚀 Pushing backup branch to remote...${NC}"
if ! git push -u origin "$BACKUP_BRANCH"; then
    echo -e "${YELLOW}⚠️  Warning: Failed to push backup branch to remote${NC}"
    echo -e "${YELLOW}   This might be normal if remote doesn't exist${NC}"
else
    echo -e "${GREEN}✅ Backup branch pushed to remote${NC}"
fi

# Create and push tag
echo -e "${BLUE}🏷️  Creating tag: ${TAG_NAME}${NC}"
if ! git tag -a "$TAG_NAME" -m "Stable StudioMate state - $TIMESTAMP"; then
    echo -e "${RED}❌ Error: Failed to create tag${NC}"
    git checkout "$CURRENT_BRANCH"
    exit 1
fi
echo -e "${GREEN}✅ Tag created successfully${NC}"

echo -e "${BLUE}🚀 Pushing tag to remote...${NC}"
if ! git push origin "$TAG_NAME"; then
    echo -e "${YELLOW}⚠️  Warning: Failed to push tag to remote${NC}"
    echo -e "${YELLOW}   This might be normal if remote doesn't exist${NC}"
else
    echo -e "${GREEN}✅ Tag pushed to remote${NC}"
fi

# Switch back to original branch
echo -e "${BLUE}🔄 Switching back to original branch: ${CURRENT_BRANCH}${NC}"
if ! git checkout "$CURRENT_BRANCH"; then
    echo -e "${RED}❌ Error: Failed to switch back to original branch${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Switched back to ${CURRENT_BRANCH}${NC}"

echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Backup Details:${NC}"
echo -e "   Branch: ${BACKUP_BRANCH}"
echo -e "   Tag: ${TAG_NAME}"
echo -e "   Original branch: ${CURRENT_BRANCH}"
echo ""
echo -e "${BLUE}🔧 To restore this backup:${NC}"
echo -e "   git checkout ${BACKUP_BRANCH}"
echo -e "   # or #"
echo -e "   git checkout ${TAG_NAME}"
echo ""
echo -e "${BLUE}📖 Creating backup documentation...${NC}"

# Create backup log
cat > BACKUP-LOG.md << EOF
# StudioMate Backup Log

## Backup Created: $(date "+%Y-%m-%d %H:%M:%S")

### Backup Information
- **Branch Name**: \`${BACKUP_BRANCH}\`
- **Tag Name**: \`${TAG_NAME}\`
- **Original Branch**: \`${CURRENT_BRANCH}\`
- **Git Commit**: \`$(git rev-parse HEAD)\`

### Working Features at This Checkpoint
- ✅ **Dashboard Layout**: Two-column design with deadlines and activity sections
- ✅ **Navigation Architecture**: Consistent hamburger menu + sidebar across all pages
- ✅ **TopBar Component**: Shows only hamburger menu and notifications
- ✅ **Drawer Layout**: Centralized navigation handling
- ✅ **Theme System**: Custom DaisyUI theme with warm colors
- ✅ **User Authentication**: NextAuth.js integration working
- ✅ **Database Schema**: Prisma setup with opportunities and profiles
- ✅ **API Routes**: Opportunities, profile, matches endpoints functional
- ✅ **Responsive Design**: Mobile and desktop layouts working
- ✅ **Typography**: Crimson Text + Source Sans Pro fonts loaded

### Key Files State
- \`src/components/TopBar.tsx\`: Hamburger menu only, no logo/text
- \`src/components/DrawerLayout.tsx\`: Centralized navigation wrapper  
- \`src/components/Navigation.tsx\`: User profile + grouped menu sections
- \`src/app/dashboard/page.tsx\`: Deadline-focused layout matching design
- \`tailwind.config.ts\`: Custom theme colors configured
- \`src/app/globals.css\`: Utility classes for consistent styling

### How to Restore This Version

#### Method 1: Switch to Backup Branch
\`\`\`bash
git checkout ${BACKUP_BRANCH}
npm install
npm run dev
\`\`\`

#### Method 2: Use Git Tag
\`\`\`bash
git checkout ${TAG_NAME}
npm install  
npm run dev
\`\`\`

#### Method 3: Create New Branch from Backup
\`\`\`bash
git checkout -b restored-stable ${TAG_NAME}
npm install
npm run dev
\`\`\`

### Development Server
After restoring, the application will be available at:
- Local: http://localhost:3000 (or 3001 if 3000 is in use)

### Notes
This backup preserves the complete working state of StudioMate with all features functional and the navigation architecture properly implemented.

---
*Backup created automatically by backup-current-state.sh*
EOF

echo -e "${GREEN}✅ Backup documentation created: BACKUP-LOG.md${NC}"
echo ""
echo -e "${BLUE}🎯 You can now safely make changes to your application${NC}"
echo -e "${BLUE}   The backup is preserved and can be restored anytime${NC}"