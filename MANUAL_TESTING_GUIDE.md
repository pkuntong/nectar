# Manual Testing Guide
**Nectar - Pre-Launch Testing**

This guide will walk you through testing every feature of your application before launch.

---

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

The app should open at: http://localhost:3000

### 2. Open Browser DevTools

Press `F12` or `Cmd+Option+I` (Mac) to open DevTools:
- **Console tab** - Watch for errors
- **Network tab** - Monitor API calls
- **Application tab** - Check localStorage/session

Keep DevTools open during all testing.

---

## 📋 Test Plan Overview

| Test Area | Time | Priority |
|-----------|------|----------|
| Environment Check | 2 min | Critical |
| Navigation & UI | 5 min | High |
| Authentication | 10 min | Critical |
| Pricing Flow | 5 min | High |
| Error Handling | 5 min | High |
| Responsive Design | 5 min | Medium |
| Performance | 3 min | Medium |
| **Total** | **~35 min** | |

---

## ✅ Test 1: Environment Check (2 min)

### Open Browser Console

Look for these messages:

**✅ Good Signs:**
- No red errors
- Supabase client initialized
- Sentry initialized (if configured)

**🚫 Bad Signs:**
- "Missing Supabase environment variables"
- Red errors in console
- Failed network requests

**Action if Failed:**
- Check `.env` file has all required variables
- Restart dev server
- Clear browser cache

---

## ✅ Test 2: Landing Page Navigation (5 min)

### 2.1 Homepage Scroll Test

1. Scroll through entire page slowly
2. Check all sections load:
   - [ ] Hero section
   - [ ] How It Works
   - [ ] Features
   - [ ] Dashboard Demo
   - [ ] Testimonials
   - [ ] FAQ
   - [ ] Footer

**Expected:** All sections visible, no layout breaks

---

### 2.2 Navigation Links Test

Test each navigation item:

| Link | Expected Result | Status |
|------|----------------|--------|
| Logo (Nectar) | Scroll to top | [ ] |
| Features | Scroll to features | [ ] |
| How It Works | Scroll to section | [ ] |
| Pricing | Open pricing modal | [ ] |
| Login | Open login modal | [ ] |
| Sign Up | Open signup modal | [ ] |

**Expected:** All links work, modals open smoothly

---

### 2.3 Footer Links Test

Test footer links:

| Link | Expected Result | Status |
|------|----------------|--------|
| About | Navigate to About page | [ ] |
| Careers | Navigate to Careers page | [ ] |
| Privacy | Navigate to Privacy page | [ ] |
| Terms | Navigate to Terms page | [ ] |
| Back to Home | Return to homepage | [ ] |

**Expected:** Page navigation works, back button returns home

---

### 2.4 CTA Buttons Test

Test all call-to-action buttons:

| Button | Location | Expected | Status |
|--------|----------|----------|--------|
| "Start Building Your Empire" | Hero | Opens signup | [ ] |
| "See How It Works" | Hero | Scrolls to section | [ ] |
| "Sign Up for Free" | Dashboard Demo | Opens signup | [ ] |
| "Choose Plan" buttons | Pricing modal | Handles plan selection | [ ] |

**Expected:** All buttons respond, correct actions triggered

---

## ✅ Test 3: Authentication Flow (10 min)

### 3.1 Sign Up Test

**Steps:**

1. Click "Sign Up for Free"
2. Modal should open
3. Fill in form:
   - Full Name: `Test User`
   - Email: `test@example.com` (use a real email you can access)
   - Password: `test123456` (min 6 chars)
4. Click "Create Account"

**Expected Results:**
- [ ] Loading state shows ("Creating Account...")
- [ ] No console errors
- [ ] Redirects to dashboard
- [ ] Welcome message shows "Test User"
- [ ] (If Resend deployed) Welcome email received

**Check in DevTools:**
- Network tab → Should see request to Supabase
- Console → No errors
- Application → localStorage should have Supabase session

**What to Watch For:**
- ✅ Button disables during loading
- ✅ Smooth transition to dashboard
- ✅ User name displays correctly
- 🚫 Form doesn't submit on validation errors

---

### 3.2 Logout Test

**Steps:**

1. While logged in, find logout button
2. Click logout

**Expected Results:**
- [ ] Returns to homepage
- [ ] Header shows "Login" button again
- [ ] Session cleared from localStorage
- [ ] Can't access dashboard without login

---

### 3.3 Login Test

**Steps:**

1. Click "Login"
2. Enter credentials from signup:
   - Email: `test@example.com`
   - Password: `test123456`
3. Click "Login"

**Expected Results:**
- [ ] Loading state shows
- [ ] Redirects to dashboard
- [ ] User still logged in after page refresh

**Test Persistence:**
1. Press `F5` to refresh page
2. Should still be logged in
3. Dashboard should still show

---

### 3.4 Error Handling Test

**Test Wrong Password:**

1. Click Login
2. Enter: `test@example.com`
3. Password: `wrongpassword`
4. Click Login

**Expected:**
- [ ] Error message displays
- [ ] Message is user-friendly (not technical)
- [ ] Form stays filled (email preserved)
- [ ] Can try again

**Test Empty Fields:**

1. Try submitting empty form
2. Should see HTML5 validation
3. Required fields highlighted

**Test Duplicate Signup:**

1. Try signing up with same email again
2. Should get error message
3. Error should be clear

---

## ✅ Test 4: Pricing Flow (5 min)

### 4.1 Pricing Modal Test

**Steps:**

1. Click "Pricing" in navigation
2. Modal opens

**Expected Results:**
- [ ] Modal displays both plans
- [ ] Free plan: $0/forever
- [ ] Entrepreneur plan: $29/month
- [ ] Features listed for each
- [ ] "Choose Plan" buttons visible

---

### 4.2 Not Logged In Test

**Steps:**

1. Log out if logged in
2. Open Pricing modal
3. Click "Choose Plan" on any tier

**Expected Results:**
- [ ] Error message: "Please sign up or log in to continue"
- [ ] User prompted to authenticate
- [ ] Modal stays open

---

### 4.3 Free Plan Test

**Steps:**

1. Log in
2. Open Pricing
3. Click "Choose Plan" on Free tier

**Expected Results:**
- [ ] Alert: "Free plan activated!"
- [ ] No errors in console
- [ ] Database updated (check Supabase if possible)

---

### 4.4 Paid Plan Test (Requires Edge Functions)

**Steps:**

1. Log in
2. Open Pricing
3. Click "Choose Plan" on Entrepreneur tier

**If Edge Functions NOT deployed:**
- [ ] Should see error message
- [ ] Error logged in console
- [ ] User informed gracefully

**If Edge Functions ARE deployed:**
- [ ] Redirects to Stripe Checkout
- [ ] Checkout page loads
- [ ] Can see $29.00 charge
- [ ] Test card works: `4242 4242 4242 4242`

---

## ✅ Test 5: Error Handling (5 min)

### 5.1 Network Error Simulation

**Steps:**

1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Try to log in or sign up

**Expected:**
- [ ] Graceful error message
- [ ] No app crash
- [ ] User can retry when online

---

### 5.2 Form Validation

**Test each form field:**

| Field | Test | Expected |
|-------|------|----------|
| Email | Enter invalid email | HTML5 validation | [ ] |
| Email | Leave empty | Required error | [ ] |
| Password | Less than 6 chars | Validation error | [ ] |
| Name | Leave empty | Required error | [ ] |

---

### 5.3 Console Error Check

**During all tests, monitor console:**

**Expected:**
- ℹ️ Info messages OK
- ⚠️ Warnings OK (some expected)
- 🚫 NO red errors during normal use

**Common OK warnings:**
- Sentry warnings (if not configured)
- Development mode warnings
- React strict mode warnings

---

## ✅ Test 6: Responsive Design (5 min)

### 6.1 Desktop Test (1920x1080)

**Steps:**

1. Resize browser to full width
2. Check all sections
3. Verify layout looks good

**Expected:**
- [ ] Content centered
- [ ] No horizontal scroll
- [ ] Images not stretched
- [ ] Text readable

---

### 6.2 Tablet Test (768px)

**Steps:**

1. Resize to ~768px width
2. Or use DevTools → Device Toolbar
3. Test navigation

**Expected:**
- [ ] Layout adjusts
- [ ] Navigation still works
- [ ] Modals fit screen
- [ ] No broken layouts

---

### 6.3 Mobile Test (375px)

**Steps:**

1. Resize to 375px (iPhone SE)
2. Test all features

**Expected:**
- [ ] Single column layout
- [ ] Buttons still tappable
- [ ] Forms usable
- [ ] Pricing cards stack

**Test on Real Device (if possible):**
- Open on your phone
- Test touch interactions
- Check scrolling smooth
- Verify readable text size

---

## ✅ Test 7: Performance (3 min)

### 7.1 Load Time Test

**Steps:**

1. Open DevTools → Network tab
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Watch "Load" time at bottom

**Expected:**
- [ ] Initial load < 3 seconds (on good connection)
- [ ] Page interactive quickly
- [ ] No long blocking tasks

---

### 7.2 Lighthouse Audit

**Steps:**

1. Open DevTools → Lighthouse tab
2. Select "Desktop"
3. Click "Analyze page load"

**Target Scores:**
- Performance: > 70 ✅
- Accessibility: > 90 ✅
- Best Practices: > 80 ✅
- SEO: > 80 ✅

**Note:** Don't worry about perfect scores for MVP

---

### 7.3 Bundle Size Check

Already checked in build:
- Main bundle: 899.95 kB
- Gzipped: 247.41 kB

**Status:** ⚠️ Large but acceptable for MVP
**Optimization:** Consider for v2

---

## 🎯 Critical Path Test (Full User Journey)

**This is the most important test. Complete this flow end-to-end:**

### Happy Path Scenario

1. **New User Arrives**
   - [ ] Load homepage
   - [ ] Scroll through sections
   - [ ] Read about features

2. **User Decides to Sign Up**
   - [ ] Click "Sign Up for Free"
   - [ ] Fill in details
   - [ ] Submit form
   - [ ] Redirected to dashboard

3. **User Explores**
   - [ ] See welcome message
   - [ ] Check dashboard features
   - [ ] Log out

4. **User Returns**
   - [ ] Click Login
   - [ ] Enter credentials
   - [ ] Back to dashboard
   - [ ] Session persists on refresh

5. **User Considers Upgrade**
   - [ ] Open Pricing
   - [ ] View plans
   - [ ] Try to select plan
   - [ ] (If functions deployed) Complete checkout

**Time for Full Flow:** ~5 minutes
**Status:** [ ] PASS / [ ] FAIL

---

## 🔍 What to Look For

### Good Signs ✅
- No console errors
- Smooth animations
- Fast page loads
- Forms submit correctly
- Modals open/close smoothly
- Authentication works
- Error messages are helpful
- Mobile-friendly design

### Red Flags 🚫
- Console errors (red text)
- Failed network requests
- Broken layouts
- Forms don't submit
- Infinite loading states
- App crashes
- White screen errors
- API key exposure in console

---

## 📊 Test Results Template

Copy this to track your testing:

```
## Test Results - [Date]

### Environment
- [ ] All API keys set
- [ ] Build successful
- [ ] Dev server running

### Navigation (5 tests)
- [ ] All links work
- [ ] Modals open/close
- [ ] Smooth scrolling
- [ ] Footer navigation
- [ ] Back to home

### Authentication (4 tests)
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Session persists

### Pricing (3 tests)
- [ ] Modal displays
- [ ] Free plan selectable
- [ ] Paid plan flow ready

### Error Handling (3 tests)
- [ ] Invalid credentials
- [ ] Empty forms
- [ ] Network errors

### Responsive (3 tests)
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Performance
- [ ] Load time < 3s
- [ ] No blocking tasks
- [ ] Lighthouse > 70

### Critical Path
- [ ] Full user journey works

## Issues Found
1. [Issue description]
2. [Issue description]

## Blockers
- [Any blockers for launch]

## Ready for Production?
[ ] YES / [ ] NO (with reasons)
```

---

## 🚨 If Tests Fail

### Common Issues & Fixes

**Problem:** "Missing Supabase environment variables"
**Fix:**
1. Check `.env` file exists
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Restart dev server

**Problem:** Login/signup not working
**Fix:**
1. Check Supabase dashboard (project is running)
2. Verify email auth is enabled
3. Check browser console for errors
4. Verify database tables exist

**Problem:** Stripe checkout fails
**Fix:**
1. Edge Functions need to be deployed
2. See DEPLOY_EDGE_FUNCTIONS.md
3. Can test other features without this

**Problem:** Emails not sending
**Fix:**
1. Edge Function needs deployment
2. Non-critical for testing auth flow
3. Can proceed without

---

## ✅ Testing Complete Checklist

Before moving to production:

- [ ] All navigation works
- [ ] Sign up creates account
- [ ] Login authenticates
- [ ] Logout clears session
- [ ] Forms validate correctly
- [ ] Error messages are helpful
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Critical path completes

**If all checked:** Ready for Edge Function deployment
**If any unchecked:** Review and fix before proceeding

---

## 📞 Need Help?

- Check [QA_SMOKE_TEST_REPORT.md](QA_SMOKE_TEST_REPORT.md) for automated test results
- Review [TROUBLESHOOTING.md](SETUP.md#troubleshooting) for common issues
- Check browser console for specific errors
- Review Sentry dashboard if configured

---

**Happy Testing! 🚀**

When you complete testing, you'll know exactly what works and what needs fixing before production.
