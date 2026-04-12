# Vietnamese Wedding Invitation Platform Template Management Analysis

## CHUNGDOI.COM Deep Dive

### Technology Stack
- **Frontend:** Next.js + React with RSC (React Server Components)
- **Templates:** React components (not static HTML). Modular architecture with component references in streaming payload
- **Asset Management:** WebP image previews for template previews

### Template Organization & Admin Management
- **Library:** 100+ templates, categorized by style (modern, classic, minimalist, floral, vintage, luxury)
- **Admin System:** UI-based editor (not code-based)—users interact through drag-and-drop interface
- **Template Metadata:** Stored with ID, name, category, usage count, preview images
- **Customization Scope:** Color selection, font adjustments, photo uploads, background music

### Wedding Data Injection
- **Architecture:** Dynamic content binding—user data populates predefined template slots
- **Data Fields:** Names, dates, family info, photos/gallery, location (maps integration), banking details
- **Binding Model:** Template sections are toggle-able per instance; data maps to corresponding template placeholders

### URL Structure
- **Pattern:** `chungdoi.com/[invitation-id]` for public wedding pages
- **Sharing:** Link-based distribution (Zalo, Facebook, email, SMS—no printing required)

### Theme Asset Management
- **Preview Images:** WebP format stored in component metadata
- **Background Music:** User-uploadable, configurable per template instance
- **Fonts:** User can select/adjust per template
- **Maps Integration:** Dynamic embedding of ceremony/party location maps

### Template Sections (Modular)
1. Lời mở đầu (Announcement/Opening message)
2. Photo gallery/Media
3. Family information
4. Ceremony/Party details
5. Location maps
6. RSVP confirmation
7. Guestbook/Wishes
8. Thank you notes
9. Music player
10. Countdown timer
11. Multi-language support (Vietnamese/English parallel rendering)

### RSVP & Guest Features
- **RSVP:** Built-in confirmation form
- **Wishes/Guestbook:** Guest comment section
- **Bank Transfers:** Display banking info for gift transfers
- **Tracking:** Guest response analytics

---

## Competitor Analysis

### VESEY.VN
- **Library:** 100+ templates, updated weekly
- **Model:** Cloud-based API architecture with UUID template storage
- **Pricing:** Free basic + premium (129,000 VND)
- **Customization:** Drag-and-drop editor, edit content, share via link
- **Features:** Maps, countdowns, background music
- **Admin:** UI-based template management with metadata queryability

### THIEPMOIONLINE.VN
- **Library:** Multi-style categories (modern, classic, minimalist, floral, vintage, luxury)
- **Process:** 5-step flow (login → template select → website creation → customize → share)
- **Pricing:** Basic (199,000đ) to premium packages
- **Customization:** Color, fonts, photos, background music
- **Sharing:** Zalo, Facebook, email, SMS (digital-first)
- **Features:** Guests response tracking
- **Admin:** UI-based customization without code

### INVITEDAY.COM (Note: Actually Pastel Movie - Korean Platform)
- **Approach:** Not directly comparable (Korean first-birthday focus, not wedding-specific)
- **Relevance:** Low for Vietnamese wedding market reference

---

## Key Architectural Patterns

| Aspect | Pattern |
|--------|---------|
| **Templates** | React components (not HTML files or DB templates) |
| **Admin Creation** | UI-drag-drop only (zero code required) |
| **Data Injection** | Dynamic binding to named template slots |
| **Asset Storage** | WebP previews + user-uploaded media (images, music) |
| **URL Model** | Unique ID-based public URLs |
| **Sectioning** | Modular toggle-able sections per instance |
| **Distribution** | Link sharing + social media integration |

---

## Takeaways for GoLang Implementation

1. **Component-Based Design:** Use React/Vue components instead of HTML templates—enables UI-based admin editor
2. **Modular Sections:** Design templates with independent, toggleable sections (not monolithic)
3. **Data Slot Mapping:** Explicit mapping between user data fields and template placeholders
4. **ID-Based URLs:** Use UUID/slug for wedding pages (scalable, SEO-friendly)
5. **Asset Pipeline:** Separate preview generation (WebP) from user-uploaded assets
6. **Admin UX:** Prioritize no-code UI editor over code-based template management
7. **Multi-Language:** Support parallel rendering for bilingual weddings

---

**Report Date:** 2026-04-03  
**Sources:** Chungdoi.com, Vesey.vn, Thiepmoionline.vn site analysis via WebFetch; web search results
