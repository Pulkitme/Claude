# OURS - Landing Page

A modern, beautifully designed landing page for the OURS relationship super-app.

## Features

- 🎨 Modern dark theme with gradient accents
- ✨ Smooth animations and micro-interactions using Framer Motion
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Built with Vite for lightning-fast development
- 🎯 TailwindCSS for utility-first styling
- 💪 TypeScript for type safety

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
website/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Preview.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── App.tsx      # Main app component
│   ├── main.tsx     # Entry point
│   └── index.css    # Global styles
└── ...config files
```

## Enhancements Over Original

This landing page takes inspiration from qrushai.com but includes several enhancements:

1. **Better Animations** - More sophisticated scroll animations and micro-interactions
2. **Enhanced Responsiveness** - Optimized for all screen sizes
3. **Modern Design System** - Consistent spacing, typography, and color scheme
4. **Rich Feature Showcase** - Dedicated sections for all app features
5. **Social Proof** - Testimonials and statistics
6. **Multi-platform Support** - Clear download options for iOS, Android, and Web
7. **Better UX** - Smooth scrolling, loading states, and interactive elements
8. **Accessibility** - ARIA labels and semantic HTML

## Customization

### Colors

Edit the color scheme in `tailwind.config.js`:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Content

Update the content in individual components under `src/components/`.

## License

Private - All rights reserved
