
# Lumina Product Admin Dashboard

A polished full-stack product administration dashboard built with **Next.js, React, Tailwind CSS, TypeScript and Axios**, using the required **DummyJSON API** with **MongoDB Atlas** and **Cloudinary** for persistent application features.

Lumina was built for the Frontend Assignment: Product Admin Dashboard and extends the required DummyJSON functionality with persistent product mutations, user accounts, product ownership, reviews and image uploads.

## Demo Credentials

### Required DummyJSON Demo User

```text
Username: emilys
Password: emilyspass
````

The required demo user is authenticated against DummyJSON's `/auth/login` endpoint.

Registered application users are authenticated through MongoDB.

---

## Live Demo

Add your deployed Vercel or Netlify URL here.

---

## GitHub Repository

Add your public GitHub repository URL here.

---

# Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* MongoDB Atlas
* Mongoose
* Cloudinary
* JWT
* bcrypt
* DummyJSON API
* Vercel-ready deployment configuration

---

# Assignment Requirements

Lumina implements the required Product Admin Dashboard functionality:

* Login with the required DummyJSON credentials
* Protected product pages
* Logout
* Product listing
* Responsive desktop table
* Responsive mobile cards
* Pagination
* Page size selection
* Search
* Debounced search
* Category filtering
* Sorting by price, rating and title
* URL-synchronized search/filter/sort/pagination state
* Product detail page
* Product images
* Product reviews
* Add product
* Edit product
* Delete product
* Delete confirmation
* Form validation
* Loading states
* Empty states
* Error states
* Retry functionality
* Shared Axios configuration
* Request cancellation and stale-request protection

The application also adds persistent functionality using MongoDB and Cloudinary.

---

# Authentication

Lumina supports two authentication paths.

## DummyJSON Demo Login

The required assignment credentials are:

```text
Username: emilys
Password: emilyspass
```

The demo user is authenticated using DummyJSON's authentication endpoint:

```text
POST /auth/login
```

## Registered Users

Application users can also register.

Registered user information is stored in MongoDB Atlas and passwords are hashed using bcrypt.

Authenticated sessions use a signed JWT stored in an **HttpOnly cookie**.

Product routes and protected API routes require an authenticated session.

Users can log out through the dashboard logout action.

---

# Product List

The main product page provides a responsive product management interface.

## Desktop

Products are displayed in a table containing:

* Image
* Title
* Category
* Price
* Rating
* Stock
* Product actions

## Mobile

The same product information is presented using responsive product cards.

---

# Pagination

Pagination is implemented manually without using a pagination library.

Supported page sizes:

```text
10
20
50
```

The interface provides:

* Page numbers
* Previous button
* Next button
* Current page
* Page size selection
* Result information

Example:

```text
Showing 21–40 of 194
```

Invalid URL values are handled safely so values such as:

```text
?page=abc
?page=999
```

do not break the application.

---

# Search

Product search uses the required DummyJSON search endpoint:

```text
/products/search?q=
```

Search input is debounced so the API is not called for every individual keystroke.

When the search value changes, pagination returns to page 1.

---

# Search Race-Condition Protection

A major requirement of the assignment is preventing an older search request from replacing a newer result.

Lumina handles this using two mechanisms:

### AbortController

When a newer search request starts, the previous request can be cancelled.

### Request ID

Each request receives a monotonically increasing request ID.

Only the latest request is allowed to update the UI.

For example:

```text
User searches: iphone
        ↓
Request A

User quickly changes search: laptop
        ↓
Request B
```

If Request A finishes after Request B, its results are ignored.

This prevents stale search responses from replacing newer results.

---

# Category Filtering

Categories are loaded from DummyJSON.

The application supports filtering products by category.

DummyJSON cannot perform search and category filtering together through a single endpoint.

Lumina therefore handles the combination by:

1. Performing the DummyJSON search request.
2. Applying the category filter locally to the resulting collection.
3. Applying sorting.
4. Applying pagination.

This keeps the UI behavior consistent when both search and category filtering are active.

---

# Sorting

Products can be sorted by:

* Price
* Rating
* Title

Both ascending and descending directions are supported.

Sorting state is synchronized with the URL.

---

# URL State

The following product-list state is stored in the URL:

* Page
* Page size
* Search
* Category
* Sort field
* Sort direction

For example:

```text
/products?page=2&limit=20&search=phone&category=smartphones&sort=price&direction=asc
```

This means:

* Refreshing the page preserves the current view.
* Browser navigation works correctly.
* Product-list URLs can be shared with another user.

Invalid URL parameters are normalized so they do not break the application.

---

# Product Details

Each product has a dedicated detail page:

```text
/products/[id]
```

The product detail page displays:

* Product image gallery
* Product title
* Description
* Category
* Price
* Stock
* Rating
* Brand
* SKU
* Discount
* Availability
* Weight
* Dimensions
* Minimum order quantity
* Warranty information
* Shipping information
* Return policy
* Product source
* Product ID
* Product metadata
* Reviews

The page also supports responsive image galleries and product editing where permitted.

---

# Product CRUD

Lumina supports:

* Create
* Read
* Update
* Delete

for products.

The original DummyJSON API does not permanently persist product mutations.

Instead, Lumina uses MongoDB as a persistence layer.

---

# Product Persistence Architecture

DummyJSON remains the required external product catalog.

MongoDB provides the persistence layer for application-specific changes.

There are two types of products.

## DummyJSON Products

For an existing DummyJSON product:

* The original DummyJSON product remains available.
* User-specific edits are stored as MongoDB overrides.
* User-specific deletions are stored as MongoDB tombstones.
* One user's modification does not modify another user's view.

For example:

```text
DummyJSON Product
       ↓
User A edits product
       ↓
User A sees User A's override

User B
       ↓
User B still sees the original product
```

## Newly Created Products

Products created through Lumina are stored directly in MongoDB.

Created products are globally visible to authenticated users.

Only the creator can edit or delete their created product.

Other authenticated users can still view the product.

---

# Product Ownership

Product ownership is enforced server-side.

For products created by a user:

```text
Creator
 ├── View
 ├── Edit
 └── Delete

Other users
 └── View
```

For DummyJSON products, modifications are stored as user-specific overrides.

This prevents one user's DummyJSON edits from changing another user's experience.

---

# Product Validation

Product validation is performed on the server as well as in the UI.

Product information includes fields such as:

* Title
* Description
* Category
* Price
* Stock
* Brand
* SKU
* Discount percentage
* Weight
* Dimensions
* Availability status
* Warranty information
* Shipping information
* Return policy
* Minimum order quantity
* Tags
* Product images

The server validates incoming product data before MongoDB persistence.

---

# Product Images

Lumina supports product image uploads through Cloudinary.

The upload flow is:

```text
Browser
   ↓
/api/upload
   ↓
Server validation
   ↓
Cloudinary
   ↓
Secure image URL
   ↓
MongoDB
```

The application stores the Cloudinary secure URL rather than storing image binaries in MongoDB.

Uploads support:

* Image MIME-type validation
* Maximum 5MB file size
* Drag and drop
* Image preview
* Image upload
* Product image persistence

Cloudinary API credentials remain server-side.

---

# Reviews

Lumina supports product reviews for authenticated users.

Reviews can be:

* Created
* Edited
* Deleted

Each user can submit only one review per product.

The review system combines:

```text
Original DummyJSON reviews
+
Lumina user reviews
```

and displays them together.

---

# Review Ownership

Users can edit and delete only their own reviews.

For example:

```text
User A's review
      ↓
User A can edit/delete it

User B's review
      ↓
User A cannot modify it
```

Original DummyJSON reviews cannot be edited or deleted.

---

# Review Ratings

Each user review contains a rating from:

```text
1 to 5
```

The product rating is recalculated from the reviews displayed for that product.

When a user:

* Creates a review
* Edits a review
* Deletes a review

the displayed product rating is recalculated immediately in the UI.

This keeps the product rating synchronized with the visible reviews.

---

# Duplicate Reviews

A user cannot create multiple reviews for the same product.

MongoDB enforces this using a unique compound index based on:

```text
productId + reviewerId
```

If a user attempts to review the same product again, the application displays a friendly message instead of exposing a technical error:

```text
You have already reviewed this product.
You can edit your existing review below.
```

---

# Loading, Empty and Error States

Lumina includes dedicated UI states for different application conditions.

## Loading

Skeleton and loading UI is shown while product information is being retrieved.

## Empty

Examples include:

```text
No products found
```

and:

```text
No reviews yet
```

## Product Not Found

Invalid or unavailable product IDs show a dedicated not-found page.

## Server / Network Errors

The application provides a user-friendly error state with:

```text
Retry
Back
```

The Retry button attempts the request again without requiring a full page refresh.

---

# Shared Axios Setup

All application API communication uses Axios.

A shared Axios configuration is maintained in:

```text
lib/axios.ts
```

The shared setup is responsible for:

* Centralized API configuration
* Authentication handling
* Request behavior
* Response handling
* Error handling

API calls are kept outside UI components wherever possible.

---

# API Architecture

The application uses the Next.js App Router API layer.

```text
Browser
   │
   │ Axios
   ▼
Next.js App Router
   │
   ├── /api/auth/*
   │       │
   │       ├── DummyJSON authentication
   │       └── MongoDB users
   │
   ├── /api/products
   │       │
   │       ├── DummyJSON catalog
   │       └── MongoDB persistence
   │
   ├── /api/categories
   │       │
   │       ├── DummyJSON
   │       └── application data
   │
   └── /api/upload
           │
           ▼
       Cloudinary
           │
           ▼
      Secure image URL
           │
           ▼
      MongoDB Atlas
```

---

# Database

MongoDB Atlas is used for persistent application data.

MongoDB stores information including:

* Registered users
* Product overrides
* Locally created products
* Product ownership
* Product deletion state
* User reviews
* Review ownership
* Uploaded image URLs

Mongoose is used for MongoDB models and validation.

---

# Security

The application includes several security measures.

## Password Security

Registered user passwords are hashed with bcrypt before being stored.

## JWT Sessions

Authenticated sessions use signed JWT tokens.

Tokens are stored using an HttpOnly cookie.

## Server-Side Authorization

Product and review ownership checks are performed on the server.

The UI alone is not trusted for authorization.

## Cloudinary Security

Cloudinary API credentials remain server-side and are never exposed to the browser.

## Input Validation

Product and review input is validated before persistence.

## Upload Validation

Uploaded files are restricted by:

* MIME type
* File size

---

# Project Structure

The project follows a modular architecture.

```text
app/
├── api/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   └── upload/
│
├── login/
├── register/
├── products/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
│
└── ...

components/
├── AppShell
├── ProductForm
├── Spinner
└── ...

lib/
├── axios.ts
├── auth.ts
├── mongodb.ts
├── products.ts
├── validation.ts
└── models/

types/
└── product.ts
```

API communication is separated from UI components to keep the application maintainable.

---

# Environment Variables

Create `.env.local` from `.env.example`.

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=long-random-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit:

```text
.env.local
```

or Cloudinary credentials.

---

# Run Locally

Clone the repository and install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Build for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# Deployment

The application is designed to be deployed on Vercel or another Next.js-compatible hosting platform.

The following environment variables must be configured in the deployment environment:

```text
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_APP_URL
```

---

# Important Design Decisions

## Why DummyJSON + MongoDB?

The assignment requires DummyJSON.

DummyJSON is therefore retained as the external product catalog and source for the required product data.

However, DummyJSON product mutations are simulated rather than permanently persisted.

MongoDB was added as a persistence layer so Lumina can provide real:

* Product creation
* Product editing
* Product deletion
* Product ownership
* User reviews
* User accounts

without replacing DummyJSON as the required external API.

---

## Why User-Specific DummyJSON Overrides?

A DummyJSON product is shared source data.

If User A edits a DummyJSON product, changing the actual DummyJSON product would incorrectly affect User B.

Lumina therefore stores overrides by:

```text
productId + userId
```

This gives each user their own view of their modifications.

The same approach is used for DummyJSON product deletion.

---

## Why MongoDB for New Products?

New products do not exist permanently in DummyJSON.

Lumina stores newly created products in MongoDB and merges them with the DummyJSON catalog.

This allows newly created products to remain available after refreshes and across sessions.

---

## Why User-Owned Mutations?

Products created by one user are visible to everyone, but editing and deletion are restricted to the creator.

This separates:

```text
Visibility
```

from:

```text
Ownership
```

so users can collaborate around the same product catalog without allowing unauthorized modifications.

---

# Problems Faced and How They Were Fixed

## 1. Stale Search Results

One of the main race-condition problems occurred during debounced product search.

For example:

```text
Search A
   ↓
Request A

Search B
   ↓
Request B
```

Request A could finish after Request B and incorrectly overwrite the UI with old results.

The application solved this using:

1. `AbortController` to cancel previous requests.
2. A monotonically increasing request ID.
3. Only the latest request is allowed to update the UI.

This ensures stale search responses cannot replace newer results.

---

## 2. DummyJSON Mutation Persistence

DummyJSON mutations are simulated and are not permanently persisted.

To solve this, MongoDB was introduced as a persistence layer.

DummyJSON remains the source for the external catalog while MongoDB stores:

* New products
* User-specific product overrides
* Product deletion state
* User reviews

---

## 3. Product Ownership

Products created by users are globally visible, but only their creator can edit or delete them.

Ownership checks are performed server-side rather than relying only on frontend controls.

---

## 4. Review Ownership

Users can only edit or delete their own reviews.

Original DummyJSON reviews remain read-only.

---

## 5. Duplicate Reviews

A unique MongoDB index prevents a user from submitting more than one review for the same product.

The frontend converts the duplicate-review response into a user-friendly message.

---

## 6. Product Rating Updates

The product rating is recalculated when a user:

* Creates a review
* Edits a review
* Deletes a review

This keeps the displayed rating synchronized with the reviews shown on the product page.

---

## 7. Product Detail Error Handling

The product detail page distinguishes between:

* Product not found
* Network/server failure
* Loading
* Successful product loading

A dedicated Retry action is available when a recoverable request fails.

---

# Where AI Helped

AI was used as a development assistant for:

* Project structure
* Debugging
* Race-condition analysis
* Authentication implementation
* Error handling
* Responsive UI improvements

AI-generated suggestions were reviewed, tested and adapted to the assignment requirements.

The final implementation was tested and adjusted based on the application's actual behavior.

---

