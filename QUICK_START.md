# SmartPark - Quick Start Guide

## 🚀 Getting Started with New Features

### Prerequisites
- Backend running on `http://127.0.0.1:8000`
- Frontend running on `http://localhost:5173`
- Database migration completed

---

## 📋 Step-by-Step Guide

### 1. Login as Manager or Admin

**Manager Credentials:**
- Email: `manager@smartpark.com`
- Password: `password123`

**Admin Credentials:**
- Email: `admin@smartpark.com`
- Password: `password123`

---

### 2. Access New Features

After logging in, you'll see **3 navigation tabs** in the navbar:

1. **Dashboard** - Your main overview
2. **Layout Editor** - Drag-and-drop parking layout
3. **Categories** - Manage parking categories

---

### 3. Manage Categories

**Navigate to:** Categories tab

**What you can do:**
- ✅ View all parking categories
- ✅ Click **"Add Category"** to create new ones
- ✅ Click **"Edit"** on any category to:
  - Change the name
  - Pick a new color using the color picker
- ✅ Click **"Delete"** to remove unused categories
- ✅ Click **"Save"** to apply changes

**Example:**
1. Click "Add Category"
2. Enter name: "Premium"
3. Pick color: Purple (#8B5CF6)
4. Click "Add Category"
5. ✅ New category created!

---

### 4. Edit Parking Layout

**Navigate to:** Layout Editor tab

**What you can do:**

#### **Drag Spaces:**
1. Select a site from the left sidebar
2. Click and drag any parking space
3. Move it to a new position
4. Release to drop

#### **Edit Space Details:**
1. Click on any parking space
2. Modal opens with:
   - Bay Code (read-only)
   - Category (dropdown)
   - Status (dropdown)
3. Make changes
4. Click "Save Changes"

#### **Save Your Work:**
- Click **"Save Layout"** to persist all position changes
- Click **"Reset"** to undo unsaved changes

**Tips:**
- Spaces are color-coded by category
- Drag multiple spaces before saving
- Changes are saved in bulk for efficiency

---

### 5. See Dynamic Colors in Action

**Navigate to:** Dashboard → Site Layout (or Receptionist view)

**What happens:**
- All parking spaces now use colors from your categories
- Change a category color → spaces update automatically
- No hardcoded colors anymore!

**Test it:**
1. Go to Categories
2. Change "Standard" color to Red
3. Go to Site Layout
4. ✅ All standard spaces are now red!

---

### 6. Receptionist View

**Login as Receptionist:**
- Email: `reception@smartpark.com`
- Password: `password123`

**What they see:**
- ✅ Site Layout with dynamic colors
- ✅ Can book parking spaces
- ❌ Cannot edit layout or categories
- ❌ No access to Layout Editor or Category Settings

---

## 🎯 Common Tasks

### Task 1: Add a New Category
1. Login as Manager/Admin
2. Click "Categories" tab
3. Click "Add Category"
4. Enter name and pick color
5. Click "Add Category"
6. ✅ Done!

### Task 2: Change Category Color
1. Go to Categories
2. Click "Edit" on any category
3. Click the color box
4. Pick new color
5. Click "Save"
6. ✅ All spaces update instantly!

### Task 3: Reposition Parking Spaces
1. Go to Layout Editor
2. Select a site
3. Drag spaces to new positions
4. Click "Save Layout"
5. ✅ Layout saved!

### Task 4: Change Space Category
1. Go to Layout Editor
2. Click a parking space
3. Select new category from dropdown
4. Click "Save Changes"
5. ✅ Space color updates!

---

## 🔍 Troubleshooting

### Categories not showing?
- Check backend is running
- Verify migration completed: `python migrate_categories.py`
- Check browser console for errors

### Can't drag spaces?
- Ensure you're logged in as Manager or Admin
- Try refreshing the page
- Check if spaces are loading (should see colored squares)

### Colors not updating?
- Hard refresh the page (Ctrl+F5)
- Check if categories were saved successfully
- Verify API connection

### Permission denied?
- Ensure you're using Manager or Admin account
- Receptionists cannot access Layout Editor or Categories

---

## 📊 Testing Checklist

- [ ] Login as Manager
- [ ] Navigate to Categories tab
- [ ] Create a new category
- [ ] Change a category color
- [ ] Navigate to Layout Editor
- [ ] Drag a parking space
- [ ] Click a space to edit
- [ ] Save the layout
- [ ] Go to Site Layout
- [ ] Verify colors are dynamic
- [ ] Login as Receptionist
- [ ] Verify they can't access editor
- [ ] Book a parking space
- [ ] Verify booking works

---

## 🎉 Success Indicators

✅ **You're all set if:**
- Categories page loads with 5 default categories
- Layout Editor shows draggable parking spaces
- Colors change when you edit categories
- Receptionist can view but not edit
- All bookings still work normally
- No console errors

---

## 📞 Need Help?

If you encounter issues:
1. Check `FEATURE_SUMMARY.md` for detailed documentation
2. Verify both backend and frontend are running
3. Check browser console for errors
4. Ensure database migration completed successfully

---

## 🚀 Next Steps

Now that you're familiar with the new features:
1. Customize your categories
2. Organize your parking layout
3. Train your team on the new interface
4. Monitor activity logs in Admin Dashboard

**Happy parking management! 🎉**
