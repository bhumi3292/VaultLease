# VaultLease Design System

## 🎨 Brand Identity

 **VaultLease** is a modern, secure, and user-friendly asset leasing platform. The design emphasizes trust, clarity, and ease of use.

### 🌟 Core Colors

| Color Name | Hex Code | Usage |
|:---|:---|:---|
| **Primary** | `#1F6F8B` | Main buttons, links, active states, branding icons |
| **Secondary** | `#F4A261` | Call-to-actions (secondary), highlights, accents |
| **Background** | `#F7F9FC` | Main app background (Light Blue/Grey) |
| **Surface** | `#FFFFFF` | Cards, modals, sidebars |
| **Text Main** | `#2D2D2D` | Primary headings and body text |
| **Error** | `#E63946` | Validation errors, delete actions, alerts |

### ✍️ Typography

*   **Headings**: `Poppins`, `Montserrat` - Used for all page titles and section headers (`font-heading`).
*   **Body**: `Roboto`, `Open Sans` - Used for descriptions, inputs, and standard text (`font-body`).

---

## 🧩 Component Styling Guide

### 1. Buttons
*   **Primary**: Rounded-xl, `bg-primary`, `text-white`, shadow-lg.
    *   *Hover*: `hover:bg-primary-hover`, `hover:scale-105`.
*   **Secondary**: Rounded-xl, `bg-secondary`, `text-white`.
*   **Ghost/Outline**: Border-2, `border-gray-200`, `text-gray-600`.

### 2. Cards (Properties/Features)
*   **Shape**: `rounded-2xl` or `rounded-3xl` for a friendlier, modern feel.
*   **Shadow**: `shadow-sm` by default, `shadow-xl` on hover.
*   **Interaction**: Smooth transition (`duration-300`) on hover.
*   **Imagery**: Full-bleed images with gradient overlays for text readability.

### 3. Forms & Inputs
*   **Inputs**: `rounded-xl`, `bg-gray-50`, borderless initially (`focus:ring-2`, `focus:bg-white`).
*   **Validation**: Real-time feedback with `text-state-error`.
*   **Layout**: Step-based or grouped sections for complex forms (e.g., Add Property).

### 4. Layout & Spacing
*   **Container**: `max-w-7xl` centered.
*   **Spacing**: Generous padding (`py-20` for sections) to create white space.
*   **Grid**: Asymmetric or Masonry layouts preferred over rigid tables.

---

## 🚀 Key Pages Redesign

1.  **Home Page**: Implements a "Friendly Hero" with soft gradients and an asymmetric featured grid.
2.  **Auth Pages**: Clean, centered cards with clear role selection (Tenant/Landlord).
3.  **Property Listing**: Masonry layout with a sticky top filter bar.
5.  **Add Property Flow**: Multi-step wizard with map integration and media upload.

---

## 💻 Development Setup

To start the frontend development server:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Ensure the backend server is running on port 4000 for API requests to work correctly.
